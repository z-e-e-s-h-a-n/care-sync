import { ForbiddenException, Injectable } from "@nestjs/common";

import { AuthService } from "@/modules/auth/auth.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import type { CUUserDto, UserQueryDto } from "@workspace/contracts/admin";
import type { CUUserType } from "@workspace/contracts/admin";
import type { Prisma } from "@workspace/db/client";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createUser(dto: CUUserDto, currentUser: Express.User) {
    const { role, ...rest } = dto as CUUserType;
    if (currentUser.role === "doctor" && role !== "patient") {
      throw new ForbiddenException("Doctor can only create patients.");
    }
    const { user } = await this.authService.createUser(rest, role);

    return {
      message: "User created successfully",
      data: user,
    };
  }

  async findAllUsers(query: UserQueryDto, currentUser: Express.User) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      searchBy,
      role,
      isEmailVerified,
      isPhoneVerified,
    } = query;

    const where: Prisma.UserWhereInput = {};

    if (currentUser.role === "doctor") {
      where.role = "patient";
    } else if (role) {
      where.role = role;
    }

    if (isEmailVerified !== undefined) where.isEmailVerified = isEmailVerified;
    if (isPhoneVerified !== undefined) where.isPhoneVerified = isPhoneVerified;

    if (search && searchBy) {
      const searchWhereMap: Record<typeof searchBy, any> = {
        id: { id: search },
        email: {
          email: { contains: search, mode: "insensitive" },
        },
        phone: {
          phone: { contains: search, mode: "insensitive" },
        },
        displayName: {
          displayName: { contains: search, mode: "insensitive" },
        },
      };
      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        ...this.authService.userView,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      message: "Users fetched successfully.",
      data: {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findUser(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      ...this.authService.userView,
    });

    return { message: "User Fetched Successfully.", data: user };
  }

  async updateUser({ identifier, ...dto }: CUUserDto, userId: string) {
    const { key, value } = this.authService.parseIdentifier(identifier);

    let hashedPassword: string | null = null;

    if (dto.password) {
      hashedPassword = await this.authService.hashPassword(dto.password);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        [key]: value,
        ...(hashedPassword && { password: hashedPassword }),
      },
      ...this.authService.userView,
    });

    return { message: "User Updated Successfully", data: updated };
  }

  async deleteUser(userId: string, force = false) {
    await this.prisma.user.delete({
      where: { id: userId },
      ...({ force } as any),
    });

    return { message: "User Deleted Successfully." };
  }

  async restoreUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: null },
    });

    return { message: "User Restored Successfully." };
  }
}
