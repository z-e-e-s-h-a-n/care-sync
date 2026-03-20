import { Injectable } from "@nestjs/common";
import type { AuditLogQueryDto } from "@workspace/contracts/audit";
import type { AuditAction, Prisma } from "@workspace/db/client";

import { PrismaService } from "@/modules/prisma/prisma.service";

type CreateAuditLogInput = {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string;
  meta?: Prisma.InputJsonValue;
  ip?: string;
  userAgent?: string;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: CreateAuditLogInput) {
    return this.prisma.auditLog.create({
      data: input,
    });
  }

  async list(query: AuditLogQueryDto) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      searchBy,
      action,
      userId,
      entityType,
      entityId,
    } = query;

    const where: Prisma.AuditLogWhereInput = {};

    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    if (search && searchBy) {
      const searchWhereMap: Record<typeof searchBy, Prisma.AuditLogWhereInput> =
        {
          userId: { userId: search },
          entityType: { entityType: { contains: search, mode: "insensitive" } },
          entityId: { entityId: { contains: search, mode: "insensitive" } },
        };

      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.auditInclude,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      message: "Audit logs fetched successfully.",
      data: {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const log = await this.prisma.auditLog.findUniqueOrThrow({
      where: { id },
      include: this.auditInclude,
    });

    return {
      message: "Audit log fetched successfully.",
      data: log,
    };
  }

  private readonly auditInclude = {
    user: { omit: { password: true } },
  };
}
