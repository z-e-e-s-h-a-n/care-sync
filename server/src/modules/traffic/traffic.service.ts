import type { Request, Response } from "express";
import { Injectable } from "@nestjs/common";
import type {
  CreateTrafficSourceDto,
  TrafficSourceQueryDto,
} from "@workspace/contracts/traffic";
import type { Prisma, TrafficSource } from "@workspace/db/client";

import { AuditService } from "@/modules/audit/audit.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ClientService } from "@/modules/client/client.service";

type TrafficSourceCreateInput = Prisma.TrafficSourceUncheckedCreateInput;

@Injectable()
export class TrafficService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly client: ClientService,
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
    };
  }

  async track(dto: CreateTrafficSourceDto, req: Request, res: Response) {
    const normalized = this.normalizeSourceDto(dto, req);
    const existingId = this.client.getTrafficSourceId(req);
    const hasAttributionSignal = this.hasAttributionSignal(normalized, req);

    if (!hasAttributionSignal) {
      if (!existingId) {
        return {
          message: "No traffic attribution detected for this session.",
          data: null,
        };
      }

      const existing = await this.prisma.trafficSource.findUnique({
        where: { id: existingId },
      });

      if (!existing) {
        this.client.clearTrafficSourceCookie(res);
      }

      return {
        message: existing
          ? "Existing session traffic source retained."
          : "No traffic attribution detected for this session.",
        data: existing,
      };
    }

    if (existingId) {
      const existing = await this.prisma.trafficSource.findUnique({
        where: { id: existingId },
      });

      if (!existing) {
        this.client.clearTrafficSourceCookie(res);
      }

      if (existing) {
        if (this.isSameAttribution(existing, normalized)) {
          this.client.setTrafficSourceCookie(res, existing.id);

          return {
            message: "Traffic source already tracked.",
            data: existing,
          };
        }
      }
    }

    const source = await this.prisma.trafficSource.create({
      data: normalized,
    });

    this.client.setTrafficSourceCookie(res, source.id);

    await this.auditService.log({
      action: "create",
      entityType: "TrafficSource",
      entityId: source.id,
      meta: JSON.parse(JSON.stringify(normalized)) as Prisma.InputJsonValue,
    });

    return {
      message: "Traffic source tracked successfully.",
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

  private normalizeSourceDto(
    dto: CreateTrafficSourceDto,
    req: Request,
  ): TrafficSourceCreateInput {
    return {
      utmSource: this.normalizeString(dto.utmSource),
      utmMedium: this.normalizeString(dto.utmMedium),
      utmCampaign: this.normalizeString(dto.utmCampaign),
      utmTerm: this.normalizeString(dto.utmTerm),
      utmContent: this.normalizeString(dto.utmContent),
      referrer: this.normalizeString(dto.referrer),
      landingPage: this.normalizeString(dto.landingPage),
      ip: this.normalizeString(this.getRequestIp(req)),
      userAgent: this.normalizeString(req.headers["user-agent"]),
    };
  }

  private hasAttributionSignal(
    source: TrafficSourceCreateInput,
    req: Request,
  ): boolean {
    const hasUtm =
      Boolean(source.utmSource) ||
      Boolean(source.utmMedium) ||
      Boolean(source.utmCampaign) ||
      Boolean(source.utmTerm) ||
      Boolean(source.utmContent);

    if (hasUtm) {
      return true;
    }

    return this.isExternalReferrer(
      source.referrer,
      req.headers["x-client-url"] as string | undefined,
    );
  }

  private isSameAttribution(
    source: TrafficSource,
    incoming: TrafficSourceCreateInput,
  ) {
    return (
      this.normalizeString(source.utmSource) === incoming.utmSource &&
      this.normalizeString(source.utmMedium) === incoming.utmMedium &&
      this.normalizeString(source.utmCampaign) === incoming.utmCampaign &&
      this.normalizeString(source.utmTerm) === incoming.utmTerm &&
      this.normalizeString(source.utmContent) === incoming.utmContent &&
      this.normalizeString(source.referrer) === incoming.referrer &&
      this.normalizeString(source.landingPage) === incoming.landingPage
    );
  }

  private isExternalReferrer(referrer?: string | null, clientUrl?: string) {
    if (!referrer) {
      return false;
    }

    try {
      const referrerOrigin = new URL(referrer).origin;
      const clientOrigin = clientUrl ? new URL(clientUrl).origin : undefined;

      return Boolean(clientOrigin) && referrerOrigin !== clientOrigin;
    } catch {
      return false;
    }
  }

  private getRequestIp(req: Request) {
    const forwarded = req.headers["x-forwarded-for"];

    if (typeof forwarded === "string" && forwarded.length > 0) {
      return forwarded.split(",")[0]?.trim();
    }

    if (Array.isArray(forwarded) && forwarded[0]) {
      return forwarded[0];
    }

    const realIp = req.headers["x-real-ip"];

    if (typeof realIp === "string" && realIp.length > 0) {
      return realIp;
    }

    return req.socket.remoteAddress;
  }

  private normalizeString(value: unknown) {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : undefined;
  }
}
