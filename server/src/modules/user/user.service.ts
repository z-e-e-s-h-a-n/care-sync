import { Injectable } from "@nestjs/common";
import type { UserProfileDto } from "@workspace/contracts/user";

import { AuthService } from "@/modules/auth/auth.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      ...this.authService.userView,
    });

    return {
      message: "User Fetched Successfully.",
      data: user,
    };
  }

  async updateUserProfile(dto: UserProfileDto, userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    return {
      message: "Profile Updated Successfully.",
    };
  }
}
