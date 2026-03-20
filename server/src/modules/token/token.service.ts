import { ulid } from "ulid";
import argon2 from "argon2";
import type { Request, Response } from "express";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { futureDate } from "@workspace/shared/utils";
import { UserRole, UserStatus, type Prisma } from "@workspace/db/client";

import { CookieService } from "@/utils/cookie.util";
import { ClientService } from "@/utils/client.utils";
import { EnvService } from "@/modules/env/env.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

type TokenType = "accessToken" | "refreshToken";

export interface JwtPayload {
  sub: string;
  sid: string;
  rol: UserRole;
  sts: UserStatus;
}

interface TokensType {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
}

@Injectable()
export class TokenService {
  private encoder = new TextEncoder();
  private readonly accessSecret;
  private readonly refreshSecret;

  constructor(
    private readonly env: EnvService,
    private readonly prisma: PrismaService,
    private readonly cookieService: CookieService,
    private readonly client: ClientService,
  ) {
    this.accessSecret = this.encoder.encode(this.env.get("JWT_ACCESS_SECRET"));
    this.refreshSecret = this.encoder.encode(
      this.env.get("JWT_REFRESH_SECRET"),
    );
  }

  async generateTokens(req: Request, user: Express.User) {
    const ctx = await this.client.resolve(req);
    const isTrusted = req.headers["x-trusted-device"] === "true";
    const refreshExp = futureDate(this.env.get("REFRESH_TOKEN_EXP"));
    const deviceId =
      req.cookies["deviceId"] ?? req.headers["x-device-id"] ?? ulid();

    const payload: JWTPayload & JwtPayload = {
      sid: user.sessionId ?? ulid(),
      sub: user.id,
      rol: user.role,
      sts: user.status,
    };

    const accessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.env.get("ACCESS_TOKEN_EXP"))
      .sign(this.accessSecret);

    const refreshToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.env.get("REFRESH_TOKEN_EXP"))
      .sign(this.refreshSecret);

    const refreshTokenHash = await argon2.hash(refreshToken);

    const tokenData: Prisma.SessionUncheckedCreateInput = {
      ...ctx,
      deviceId,
      id: payload.sid,
      userId: payload.sub,
      refreshTokenHash,
      status: "active",
      lastSeenAt: new Date(),
      expiresAt: refreshExp,
    };

    const where = user.sessionId
      ? { id: user.sessionId }
      : { userId_deviceId: { userId: user.id, deviceId } };

    await this.prisma.session.upsert({
      where,
      update: tokenData,
      create: { ...tokenData, isTrusted },
    });

    return { accessToken, refreshToken, deviceId, payload, isTrusted };
  }

  async verifyToken(req: Request, type: TokenType): Promise<JwtPayload> {
    const token = req.cookies[type] as string;

    const secret =
      type === "accessToken" ? this.accessSecret : this.refreshSecret;

    if (!token) {
      throw new UnauthorizedException({
        errorCode:
          type === "accessToken" ? "access_token_missing" : "session_expired",
      });
    }

    try {
      const { payload } = await jwtVerify<JWTPayload & JwtPayload>(
        token,
        secret,
      );
      return payload;
    } catch {
      throw new UnauthorizedException({
        errorCode: "unauthorized",
      });
    }
  }

  async refreshTokens(req: Request, res: Response, payload: JwtPayload) {
    const refreshToken = req.cookies["refreshToken"];

    await this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: payload.sid },
      });

      if (!session || session.status !== "active") {
        throw new UnauthorizedException({ errorCode: "session_expired" });
      }

      if (session.expiresAt <= new Date()) {
        await tx.session.update({
          where: { id: payload.sid },
          data: { status: "expired" },
        });
        throw new UnauthorizedException({ errorCode: "session_expired" });
      }

      const isValid = await argon2.verify(
        session.refreshTokenHash,
        refreshToken,
      );

      const IS_PROD = this.env.get("NODE_ENV") === "production";

      if (!isValid && IS_PROD) {
        await this.revokeSession(session.id, undefined, tx);
        throw new UnauthorizedException({ errorCode: "session_expired" });
      }

      await this.createAuthSession(req, res, {
        id: payload.sub,
        role: payload.rol,
        status: payload.sts,
        sessionId: payload.sid,
      });
    });
  }

  async createAuthSession(req: Request, res: Response, user: Express.User) {
    const tokens = await this.generateTokens(req, user);
    this.setAuthCookies(res, tokens, tokens.isTrusted);
    this.attachAuthContext(req, tokens.payload);
  }

  attachAuthContext = (req: Request, payload: JwtPayload) => {
    req["user"] = {
      id: payload.sub,
      role: payload.rol,
      status: payload.sts,
      sessionId: payload.sid,
    };
  };

  setAuthCookies(res: Response, tokens: TokensType, isTrusted: boolean): void {
    const { accessToken, refreshToken, deviceId } = tokens;
    const accessExp = futureDate(this.env.get("ACCESS_TOKEN_EXP"));
    const refreshExp = futureDate(this.env.get("REFRESH_TOKEN_EXP"));

    this.cookieService.setCookie(res, "accessToken", accessToken, {
      expires: accessExp,
    });
    this.cookieService.setCookie(res, "refreshToken", refreshToken, {
      expires: isTrusted ? refreshExp : undefined,
    });
    this.cookieService.setCookie(res, "deviceId", deviceId, {
      expires: futureDate("1y"),
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
  }

  async getUserSessions(user: Express.User) {
    const sessions = await this.prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { lastSeenAt: "desc" },
      select: {
        id: true,
        ip: true,
        isp: true,
        location: true,
        timezone: true,
        deviceType: true,
        deviceInfo: true,

        status: true,
        isTrusted: true,
        lastSeenAt: true,
        createdAt: true,
        expiresAt: true,
        revokedAt: true,
      },
    });

    const currentSessionId = user.sessionId;

    const sortedSessions = sessions.sort((a, b) => {
      if (a.id === currentSessionId) return -1;
      if (b.id === currentSessionId) return 1;
      return 0;
    });

    return { message: "Session Fetched Successfully.", data: sortedSessions };
  }

  async revokeSession(
    sessionId: string,
    res?: Response,
    tx?: Prisma.TransactionClient,
  ) {
    if (!tx) tx = this.prisma;
    await tx.session.updateMany({
      where: { id: sessionId, status: "active" },
      data: { status: "revoked", revokedAt: new Date() },
    });

    if (res) this.clearAuthCookies(res);

    return { message: "Session Revoked Successfully." };
  }

  async revokeAllSessions(user: Express.User) {
    await this.prisma.session.updateMany({
      where: { userId: user.id, status: "active", NOT: { id: user.sessionId } },
      data: { status: "revoked", revokedAt: new Date() },
    });

    return { message: "All Session Revoked Successfully." };
  }
}

