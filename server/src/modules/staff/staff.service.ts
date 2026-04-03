import { ForbiddenException, Injectable } from "@nestjs/common";
import type { StaffProfileDto, StaffQueryDto } from "@workspace/contracts/staff";
import type { Prisma } from "@workspace/db/client";

import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: StaffProfileDto) {
    const staff = await this.prisma.staffProfile.create({
      data: dto,
    });

    return { message: "Staff profile created successfully.", data: staff };
  }

  async list(query: StaffQueryDto) {
    const { page, limit, sortBy, sortOrder, search, searchBy, branchId, isActive } =
      query;

    const where: Prisma.StaffProfileWhereInput = {};

    if (branchId) where.branchId = branchId;
    if (isActive !== undefined) where.isActive = isActive;

    if (search && searchBy) {
      const searchWhereMap: Record<typeof searchBy, Prisma.StaffProfileWhereInput> = {
        displayName: {
          user: { displayName: { contains: search, mode: "insensitive" } },
        },
        email: {
          user: { email: { contains: search, mode: "insensitive" } },
        },
        title: {
          title: { contains: search, mode: "insensitive" },
        },
      };

      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy =
      sortBy === "displayName"
        ? { user: { displayName: sortOrder } }
        : { [sortBy]: sortOrder };

    const [staff, total] = await Promise.all([
      this.prisma.staffProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.staffInclude,
      }),
      this.prisma.staffProfile.count({ where }),
    ]);

    return {
      message: "Staff fetched successfully.",
      data: {
        staff,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const staff = await this.prisma.staffProfile.findUniqueOrThrow({
      where: { id },
      include: this.staffInclude,
    });

    return { message: "Staff profile fetched successfully.", data: staff };
  }

  async findByUserIdOrThrow(userId: string) {
    return this.prisma.staffProfile.findUniqueOrThrow({
      where: { userId },
      include: this.staffInclude,
    });
  }

  async findByUserId(userId: string) {
    const staff = await this.findByUserIdOrThrow(userId);
    return { message: "Staff profile fetched successfully.", data: staff };
  }

  async update(staffId: string, dto: Partial<StaffProfileDto>) {
    const staff = await this.prisma.staffProfile.update({
      where: { id: staffId },
      data: dto,
    });

    return { message: "Staff profile updated successfully.", data: staff };
  }

  async assertStaffAccess(currentUser: Express.User, staffId: string) {
    const staff = await this.findByUserIdOrThrow(currentUser.id);
    if (staff.id !== staffId) {
      throw new ForbiddenException("You can only manage your own profile.");
    }
  }

  private staffInclude = {
    user: {
      omit: { password: true },
      include: { avatar: true },
    },
    branch: true,
  } satisfies Prisma.StaffProfileInclude;
}
