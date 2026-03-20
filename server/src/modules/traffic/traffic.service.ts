import { Injectable } from "@nestjs/common";
import type {
  CreateTrafficSourceDto,
  TrafficSourceQueryDto,
} from "@workspace/contracts/traffic";
import type { Prisma } from "@workspace/db/client";

import { AuditService } from "@/modules/audit/audit.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class TrafficService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateTrafficSourceDto) {
    const source = await this.prisma.trafficSource.create({
      data: dto,
    });

    await this.auditService.log({
      action: "create",
      entityType: "TrafficSource",
      entityId: source.id,
      meta: JSON.parse(JSON.stringify(dto)) as Prisma.InputJsonValue,
    });

    return {
      message: "Traffic source created successfully.",
      data: source,
    };
  }

  async list(query: TrafficSourceQueryDto) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      searchBy,
      utmSource,
      utmMedium,
      utmCampaign,
    } = query;

    const where: Prisma.TrafficSourceWhereInput = {};

    if (utmSource)
      where.utmSource = { contains: utmSource, mode: "insensitive" };
    if (utmMedium)
      where.utmMedium = { contains: utmMedium, mode: "insensitive" };
    if (utmCampaign) {
      where.utmCampaign = { contains: utmCampaign, mode: "insensitive" };
    }

    if (search && searchBy) {
      const searchWhereMap: Record<
        typeof searchBy,
        Prisma.TrafficSourceWhereInput
      > = {
        utmSource: { utmSource: { contains: search, mode: "insensitive" } },
        utmMedium: { utmMedium: { contains: search, mode: "insensitive" } },
        utmCampaign: {
          utmCampaign: { contains: search, mode: "insensitive" },
        },
        referrer: { referrer: { contains: search, mode: "insensitive" } },
        landingPage: {
          landingPage: { contains: search, mode: "insensitive" },
        },
      };

      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    const [sources, total] = await Promise.all([
      this.prisma.trafficSource.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.trafficSource.count({ where }),
    ]);

    return {
      message: "Traffic sources fetched successfully.",
      data: {
        sources,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const source = await this.prisma.trafficSource.findUniqueOrThrow({
      where: { id },
      include: {
        contactMessages: true,
        newsletterSubs: true,
      },
    });

    return {
      message: "Traffic source fetched successfully.",
      data: source,
    };
  }
}
