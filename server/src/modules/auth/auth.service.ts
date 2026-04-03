import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import argon2 from "argon2";
import type { Request, Response } from "express";
import type { UserStatus } from "@workspace/db/client";

import type {
  UpdateIdentifierDto,
  RequestOtpDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  ValidateOtpDto,
  UpdateMfaDto,
} from "@workspace/contracts/auth";

import { OtpService } from "./otp.service";
import type { SafeUserRole } from "@workspace/contracts";
import type { SafeUser } from "@workspace/contracts/user";
import { TokenService } from "@/modules/token/token.service";
import { ClientService } from "@/modules/client/client.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { NotificationService } from "@/modules/notification/notification.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly client: ClientService,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly notifyService: NotificationService,
  ) {}

  async signUp(dto: SignUpDto) {
    if (!dto.password) {
      throw new BadRequestException("Password should not be empty.");
    }

    const { key } = await this.createUser(dto, "patient");

    return {
      message: `User created successfully. Please verify your ${key}.`,
    };
  }

  async signIn(dto: SignInDto, req: Request, res: Response) {
    const { user, key, value, meta } = await this.findUserFail404(
      dto.identifier,
    );

    if (!meta.password) {
      await this.otpService.sendOtp({
        user,
        identifier: value,
        type: "secureToken",
        purpose: "setPassword",
      });

      throw new UnauthorizedException(
        "Password not set. Please set your password to continue.",
      );
    }

    if (!dto.password) {
      throw new BadRequestException("Password should not be empty.");
    }

    const isPasswordValid = await this.verifyPassword(
      dto.password,
      meta.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    this.checkUserStatus(user.status);
    await this.client.assertRoleAccess(req, user.role);
    await this.checkVerificationStatus(user, key, value, "unverified");

    if (user.preferredMfa) {
      await this.otpService.sendOtp({
        user,
        identifier: value,
        purpose: "verifyMfa",
      });
      return {
        message: "MFA code sent. Please verify to complete login.",
        action: "verifyMfa",
      };
    }

    await this.tokenService.createAuthSession(req, res, {
      id: user.id,
      role: user.role,
      status: user.status,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    if (user.loginAlerts) {
      await this.notifyService.sendNotification({
        purpose: "signIn",
        identifier: value,
        user,
      });
    }

    return {
      message: "Signed in successfully",
      data: { id: user.id, role: user.role },
    };
  }

  async signOut(sessionId: string, res: Response) {
    await this.tokenService.revokeSession(sessionId, res);
    return { message: "Signed out successfully" };
  }

  async requestOtp(dto: RequestOtpDto) {
    const { user, key, value, meta } = await this.findUserFail404(
      dto.identifier,
    );

    switch (dto.purpose) {
      case "verifyIdentifier": {
        await this.checkVerificationStatus(user, key, value, "verified");

        await this.otpService.sendOtp({
          user,
          identifier: value,
          purpose: dto.purpose,
        });

        return { message: "Verification OTP sent." };
      }

      case "setPassword":
      case "resetPassword": {
        if (dto.purpose === "setPassword" && meta.password) {
          throw new BadRequestException(
            "Password already set. Use resetPassword.",
          );
        }

        await this.otpService.sendOtp({
          user,
          identifier: value,
          purpose: dto.purpose,
        });

        return { message: `${dto.purpose} OTP sent.` };
      }

      case "updateIdentifier": {
        await this.otpService.sendOtp({
          user,
          identifier: value,
          purpose: dto.purpose,
        });

        return { message: `Update ${key} OTP sent.` };
      }

      case "updateMfa": {
        await this.otpService.sendOtp({
          user,
          identifier: value,
          purpose: dto.purpose,
        });

        return {
          message: `Mfa ${user.preferredMfa ? "Change" : "Enable"} OTP sent.`,
        };
      }

      case "disableMfa": {
        if (!user.preferredMfa) {
          throw new BadRequestException("MFA is already disabled.");
        }

        await this.otpService.sendOtp({
          user,
          identifier: value,
          purpose: dto.purpose,
        });

        return { message: "disableMfa OTP sent." };
      }

      case "verifyMfa": {
        await this.otpService.sendOtp({
          user,
          identifier: value,
          purpose: dto.purpose,
        });

        return { message: "verifyMfa OTP sent." };
      }

      default:
        throw new BadRequestException(`Invalid purpose: ${dto.purpose}`);
    }
  }

  async validateOtp(dto: ValidateOtpDto, req: Request, res: Response) {
    const { key, value, user } = await this.findUserFail404(dto.identifier);

    await this.otpService.verifyOtp({
      userId: user.id,
      purpose: dto.purpose,
      secret: dto.secret,
      type: dto.type,
    });

    switch (dto.purpose) {
      case "verifyIdentifier": {
        await this.prisma.user.update({
          where: { id: user.id },
          data:
            key === "email"
              ? { isEmailVerified: true }
              : { isPhoneVerified: true },
        });

        return { message: `${key} verified successfully.` };
      }

      case "setPassword":
      case "resetPassword": {
        const otp = await this.otpService.sendOtp({
          user,
          identifier: value,
          type: "secureToken",
          purpose: dto.purpose,
          notify: false,
        });

        return {
          message: "OTP validated successfully.",
          meta: { secret: otp.secret },
        };
      }

      case "updateIdentifier": {
        const otp = await this.otpService.sendOtp({
          user,
          identifier: value,
          type: "secureToken",
          purpose: dto.purpose,
          notify: false,
        });

        return {
          message: "OTP validated successfully.",
          meta: { secret: otp.secret },
        };
      }

      case "updateMfa": {
        const otp = await this.otpService.sendOtp({
          user,
          identifier: value,
          type: "secureToken",
          purpose: dto.purpose,
          notify: false,
        });

        return {
          message: "OTP verified. Setup MFA details.",
          meta: { secret: otp.secret },
        };
      }

      case "disableMfa": {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { preferredMfa: null },
        });

        await this.notifyService.sendNotification({
          identifier: dto.identifier,
          purpose: "updateMfa",
          user,
          action: "update",
        });

        return { message: "disableMfa successfully." };
      }

      case "verifyMfa": {
        this.checkUserStatus(user.status);
        await this.client.assertRoleAccess(req, user.role);

        await this.tokenService.createAuthSession(req, res, {
          id: user.id,
          role: user.role,
          status: user.status,
        });

        await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          message: "MFA verified. Signed in successfully.",
          data: { id: user.id, role: user.role },
        };
      }

      default:
        throw new BadRequestException(`Invalid purpose: ${dto.purpose}`);
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { user, key } = await this.findUserFail404(dto.identifier);

    await this.otpService.verifyOtp({
      userId: user.id,
      purpose: dto.purpose,
      secret: dto.secret,
      type: "secureToken",
    });

    const hashedPassword = await this.hashPassword(dto.newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        ...(key === "email"
          ? { isEmailVerified: true }
          : { isPhoneVerified: true }),
      },
    });

    await this.notifyService.sendNotification({
      identifier: dto.identifier,
      purpose: "updatePassword",
      user,
      action: dto.purpose === "setPassword" ? "set" : "reset",
    });

    return {
      message: `Password ${dto.purpose.split("Password")[0]} successfully`,
    };
  }

  async updateMfa(dto: UpdateMfaDto) {
    const { user } = await this.findUserFail404(dto.identifier);

    await this.otpService.verifyOtp({
      userId: user.id,
      purpose: dto.purpose,
      secret: dto.secret,
      type: "secureToken",
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { preferredMfa: dto.preferredMfa },
    });

    await this.notifyService.sendNotification({
      identifier: dto.identifier,
      purpose: "updateMfa",
      user,
      action: user.preferredMfa ? "update" : "enable",
    });

    return {
      message: `Mfa ${user.preferredMfa ? "Updated" : "Enabled"} successfully.`,
    };
  }

  async requestUpdateIdentifier(dto: UpdateIdentifierDto) {
    const { user, key, value } = await this.findUserFail404(dto.identifier);

    const { key: newKey, value: newValue } = await this.findUserFail200(
      dto.newIdentifier,
    );

    await this.otpService.verifyOtp({
      userId: user.id,
      purpose: dto.purpose,
      secret: dto.secret,
      type: "secureToken",
    });

    const isSameType = key === newKey;
    const action = isSameType ? "change" : "update";

    await this.otpService.sendOtp({
      user,
      identifier: newValue,
      type: "secureToken",
      purpose: "updateIdentifier",
      meta: {
        oldIdentifier: value,
        newIdentifier: newValue,
      },
    });

    return {
      message: `Link sent to new ${newKey}. Please verify to complete the ${action}.`,
    };
  }

  async verifyUpdateIdentifier(dto: UpdateIdentifierDto) {
    const { user } = await this.findUserFail404(dto.identifier);

    const otp = await this.otpService.verifyOtp({
      userId: user.id,
      purpose: dto.purpose,
      secret: dto.secret,
      type: "secureToken",
    });

    const newIdentifier = otp.meta?.newIdentifier;

    if (!newIdentifier || newIdentifier !== dto.newIdentifier) {
      throw new BadRequestException("Invalid identifier update token.");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        [this.parseIdentifier(newIdentifier).key]: newIdentifier,
        ...(newIdentifier.includes("@")
          ? { isEmailVerified: true }
          : { isPhoneVerified: true }),
      },
    });

    await this.tokenService.revokeAllSessions(user);
    await this.notifyService.sendNotification({
      user,
      identifier: dto.identifier,
      purpose: "updateIdentifier",
      meta: {
        newIdentifier: dto.newIdentifier,
        oldIdentifier: dto.identifier,
      },
    });

    await this.notifyService.sendNotification({
      user,
      identifier: dto.newIdentifier,
      purpose: "updateIdentifier",
      meta: {
        newIdentifier: dto.newIdentifier,
        oldIdentifier: dto.identifier,
      },
    });

    return { message: "Identifier changed successfully." };
  }

  async validateSession(req: Request, user: Express.User) {
    await this.client.assertRoleAccess(req, user.role);
    return {
      message: "Session is valid.",
      data: {
        id: user.id,
        role: user.role,
      },
    };
  }

  async createUser(
    dto: Omit<SignUpDto, "password"> & { password?: string },
    role: SafeUserRole,
  ) {
    const { key, value } = await this.findUserFail200(dto.identifier);

    const hashedPassword = dto.password
      ? await this.hashPassword(dto.password)
      : undefined;

    const user = await this.prisma.user.create({
      data: {
        [key]: value,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: `${dto.firstName} ${dto.lastName}`.trim(),
        role,
      },
    });

    await this.notifyService.sendNotification({
      purpose: "signUp",
      identifier: dto.identifier,
      user,
    });

    if (!hashedPassword) {
      await this.otpService.sendOtp({
        user,
        identifier: value,
        type: "secureToken",
        purpose: "setPassword",
      });
    } else {
      await this.otpService.sendOtp({
        user,
        identifier: dto.identifier,
        purpose: "verifyIdentifier",
      });
    }

    return { user, key };
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  private async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  async findUserFail404(identifier: string) {
    const { key, value, query } = this.parseIdentifier(identifier);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: query,
    });

    if (!user) {
      throw new BadRequestException("User Not Found");
    }

    const { password, ...reset } = user;
    return {
      key,
      value,
      user: reset,
      meta: { password },
    };
  }

  private findUserFail200 = async (identifier: string) => {
    const { key, value, query } = this.parseIdentifier(identifier);
    const user = await this.prisma.user.findUnique({
      where: query,
    });

    if (user) {
      throw new BadRequestException(`${key} already in use.`);
    }

    return { key, value };
  };

  checkUserStatus(status: UserStatus) {
    if (status === "pending") {
      throw new ForbiddenException(
        "Your account is pending approval. Please contact support.",
      );
    } else if (status === "suspended") {
      throw new ForbiddenException(
        "Your account has been suspended. Contact support for assistance.",
      );
    }
  }

  private async checkVerificationStatus(
    user: SafeUser,
    key: "email" | "phone",
    value: string,
    check: "verified" | "unverified",
  ) {
    const isVerified =
      key === "email" ? user.isEmailVerified : user.isPhoneVerified;

    if (check === "verified" && isVerified) {
      throw new BadRequestException(`${key} is already verified.`);
    }

    if (check === "unverified" && !isVerified) {
      await this.otpService.sendOtp({
        user,
        identifier: value,
        purpose: "verifyIdentifier",
      });

      throw new UnauthorizedException({
        message: `${key} not verified`,
        action: "verifyIdentifier",
      });
    }
  }

  parseIdentifier(identifier: string) {
    const isEmail = identifier.includes("@");
    const key: "email" | "phone" = isEmail ? "email" : "phone";
    const value = isEmail ? identifier.toLowerCase() : identifier;
    const query = key === "email" ? { email: value } : { phone: value };

    return { key, value, query };
  }

  userView = {
    omit: { password: true },
    include: {
      avatar: true,
    },
  };
}
