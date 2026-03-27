import { Injectable, NotFoundException } from "@nestjs/common";
import type { BusinessProfileDto } from "@workspace/contracts/business";

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

    const profile = existing
      ? await this.prisma.businessProfile.update({
          where: { id: existing.id },
          data: this.mapBusinessProfileScalars(dto),
          include: this.businessInclude,
        })
      : await this.prisma.businessProfile.create({
          data: this.mapBusinessProfileScalars(dto),
          include: this.businessInclude,
        });

    return {
      message: existing
        ? "Business profile updated successfully."
        : "Business profile created successfully.",
      data: profile,
    };
  }

  private readonly businessInclude = {
    favicon: true,
    logo: true,
    cover: true,
  };

  private mapBusinessProfileScalars(dto: BusinessProfileDto) {
    const data = {
      name: dto.name,
      legalName: dto.legalName,
      description: dto.description,
      favicon: { connect: { id: dto.faviconId } },
      logo: { connect: { id: dto.logoId } },
      email: dto.email,
      website: dto.website,
    };

    if (dto.coverId) {
      return {
        ...data,
        cover: { connect: { id: dto.coverId } },
      };
    }

    return data;
  }
}
