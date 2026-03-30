import { Injectable } from "@nestjs/common";
import type { BranchDto, BranchQueryDto } from "@workspace/contracts/branch";
import type { Prisma } from "@workspace/db/client";

import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: BranchDto) {
    const branch = await this.prisma.branch.create({
      data: dto,
    });

    return { message: "Location created successfully.", data: branch };
  }

  async update(branchId: string, dto: BranchDto) {
    const branch = await this.prisma.branch.update({
      where: { id: branchId },
      data: dto,
    });

    return { message: "Location updated successfully.", data: branch };
  }

  async findOne(branchId: string) {
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id: branchId },
      include: {
        doctors: {
          include: {
            user: {
              omit: { password: true },
              include: { avatar: true },
            },
          },
        },
      },
    });

    return { message: "Location fetched successfully.", data: branch };
  }

  async list(query: BranchQueryDto) {
    const { page, limit, sortBy, sortOrder, search, searchBy, isActive } =
      query;

    const where: Prisma.BranchWhereInput = {};
    if (isActive !== undefined) where.isActive = isActive;

    if (search && searchBy) {
      const searchWhereMap: Record<typeof searchBy, Prisma.BranchWhereInput> = {
        name: { name: { contains: search, mode: "insensitive" } },
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
        include: {
          doctors: {
            include: {
              user: {
                omit: { password: true },
                include: { avatar: true },
              },
            },
          },
        },
      }),
      this.prisma.branch.count({ where }),
    ]);

    return {
      message: "Locations fetched successfully.",
      data: {
        branches,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
