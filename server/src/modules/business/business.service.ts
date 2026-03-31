import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CUBranchDto,
  BranchQueryDto,
  BusinessProfileDto,
} from "@workspace/contracts/business";
import type { Prisma } from "@workspace/db/client";

import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile() {
    const profile = await this.prisma.businessProfile.findFirst({
      orderBy: { createdAt: "asc" },
      include: this.businessInclude,
    });

    if (!profile) {
      throw new NotFoundException("Business profile not found.");
    }

    return {
      message: "Business profile fetched successfully.",
      data: profile,
    };
  }

  async upsertProfile(dto: BusinessProfileDto) {
    const existing = await this.prisma.businessProfile.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    if (existing) {
      await this.prisma.businessProfile.update({
          where: { id: existing.id },
          data: dto,
        });
    } else {
      await this.prisma.businessProfile.create({
        data: dto,
      });
    }

    return {
      message: existing
        ? "Business profile updated successfully."
        : "Business profile created successfully.",
    };
  }

  async createBranch({ branchTimings, ...dto }: CUBranchDto) {
    const businessProfileId = await this.getBusinessProfileId();

    await this.prisma.branch.create({
      data: {
        businessProfileId,
        ...dto,
        branchTimings: {
          create: branchTimings.map((timing) => ({
            weekday: timing.weekday,
            openTime: timing.openTime,
            closeTime: timing.closeTime,
            isClosed: timing.isClosed,
          })),
        },
      },
    });

    return {
      message: "Branch created successfully.",
    };
  }

  async listBranches(query: BranchQueryDto) {
    const { page, limit, sortBy, sortOrder, search, searchBy, isActive } =
      query;

    const where: Prisma.BranchWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search && searchBy) {
      const searchWhereMap: Record<typeof searchBy, Prisma.BranchWhereInput> = {
        name: {
          name: { contains: search, mode: "insensitive" },
        },
        slug: { slug: { contains: search, mode: "insensitive" } },
      };

      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    const [branches, total] = await Promise.all([
      this.prisma.branch.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.branchInclude,
      }),
      this.prisma.branch.count({ where }),
    ]);

    return {
      message: "Branches fetched successfully.",
      data: {
        branches,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBranch(id: string) {
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id },
      include: this.branchInclude,
    });

    return {
      message: "Branch fetched successfully.",
      data: branch,
    };
  }

  async updateBranch({ branchTimings, ...dto }: CUBranchDto, branchId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.branchTiming.deleteMany({ where: { branchId } });

      await tx.branch.update({
        where: { id: branchId },
        data: {
          ...dto,
          branchTimings: {
            create: branchTimings.map((timing) => ({
              weekday: timing.weekday,
              openTime: timing.openTime,
              closeTime: timing.closeTime,
              isClosed: timing.isClosed,
            })),
          },
        },
      });

    });

    return {
      message: "Branch updated successfully.",
    };
  }

  async deleteBranch(branchId: string, force = false) {
    await this.prisma.branch.delete({
      where: { id: branchId },
      ...({ force } as any),
    });

    return {
      message: "Branch deleted successfully.",
    };
  }

  async restoreBranch(branchId: string) {
    await this.prisma.branch.update({
      where: { id: branchId },
      data: { deletedAt: null },
    });

    return { message: "User Restored Successfully." };
  }

  private async getBusinessProfileId() {
    const profile = await this.prisma.businessProfile.findFirstOrThrow({
      select: { id: true },
    });

    return profile.id;
  }

  private readonly branchInclude = {
    branchTimings: {
      orderBy: { weekday: "asc" as const },
    },
  };

  private readonly businessInclude = {
    favicon: true,
    logo: true,
    cover: true,
    branches: {
      orderBy: { createdAt: "asc" as const },
      include: this.branchInclude,
    },
  };
}
