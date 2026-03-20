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
          data: {
            ...this.mapBusinessProfileScalars(dto),
            whatsapp: {
              update: this.mapPhone(dto.whatsapp),
            },
            phones: {
              deleteMany: {},
              create: dto.phones.map((phone) => this.mapPhone(phone)),
            },
            fax: {
              deleteMany: {},
              create: dto.fax.map((phone) => this.mapPhone(phone)),
            },
            addresses: {
              deleteMany: {},
              create: dto.addresses.map((address) => this.mapAddress(address)),
            },
          },
          include: this.businessInclude,
        })
      : await this.prisma.businessProfile.create({
          data: {
            ...this.mapBusinessProfileScalars(dto),
            whatsapp: {
              create: this.mapPhone(dto.whatsapp),
            },
            phones: {
              create: dto.phones.map((phone) => this.mapPhone(phone)),
            },
            fax: {
              create: dto.fax.map((phone) => this.mapPhone(phone)),
            },
            addresses: {
              create: dto.addresses.map((address) => this.mapAddress(address)),
            },
          },
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
    whatsapp: true,
    phones: true,
    fax: true,
    addresses: true,
    favicon: true,
    logo: true,
    cover: true,
  };

  private mapPhone(phone: BusinessProfileDto["whatsapp"]) {
    return {
      label: phone.label.trim() || phone.value,
      value: phone.value,
    };
  }

  private mapAddress(address: BusinessProfileDto["addresses"][number]) {
    return {
      label: address.label.trim(),
      line1: address.line1.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      zip: address.zip.trim(),
      country: address.country.trim(),
    };
  }

  private mapBusinessProfileScalars(dto: BusinessProfileDto) {
    const data = {
      name: dto.name,
      legalName: dto.legalName,
      description: dto.description,
      favicon: { connect: { id: dto.faviconId } },
      logo: { connect: { id: dto.logoId } },
      email: dto.email,
      website: dto.website,
      facebook: dto.facebook,
      instagram: dto.instagram,
      twitter: dto.twitter,
      linkedin: dto.linkedin,
      officeHoursDays: dto.officeHoursDays,
      officeHoursTime: dto.officeHoursTime,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
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
