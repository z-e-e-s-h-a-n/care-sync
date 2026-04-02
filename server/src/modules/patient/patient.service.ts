/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type {
  PatientProfileDto,
  PatientQueryDto,
} from "@workspace/contracts/patient";
import { Prisma } from "@workspace/db/client";

import { AuthService } from "@/modules/auth/auth.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class PatientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async getMyProfile(currentUser: Express.User) {
    const patient = await this.prisma.patientProfile.findUniqueOrThrow({
      where: { userId: currentUser.id },
      include: this.patientInclude,
    });

    return { message: "Patient profile fetched successfully.", data: patient };
  }

  async upsertMyProfile(dto: PatientProfileDto, currentUser: Express.User) {
    const patient = await this.prisma.patientProfile.upsert({
      where: { userId: currentUser.id },
      update: dto,
      create: dto,
    });

    return { message: "Patient profile saved successfully.", data: patient };
  }

  async create(dto: PatientProfileDto) {
    const patient = await this.prisma.patientProfile.create({
      data: dto,
    });

    return { message: "Patient profile created successfully.", data: patient };
  }

  async list(query: PatientQueryDto, currentUser: Express.User) {
    const { page, limit, sortBy, sortOrder, search, searchBy } = query;

    const where: Prisma.PatientProfileWhereInput = {};

    if (currentUser.role === "doctor") {
      const doctorProfile = await this.prisma.doctorProfile.findUniqueOrThrow({
        where: {
          userId: currentUser.id,
        },
      });

      where.appointments = {
        some: {
          doctorId: doctorProfile.id,
        },
      };
    }

    if (search && searchBy) {
      const searchWhereMap: Record<
        typeof searchBy,
        Prisma.PatientProfileWhereInput
      > = {
        displayName: {
          user: { displayName: { contains: search, mode: "insensitive" } },
        },
        email: {
          user: { email: { contains: search, mode: "insensitive" } },
        },
        phone: {
          user: { phone: { contains: search, mode: "insensitive" } },
        },
      };
      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy =
      sortBy === "displayName"
        ? { user: { displayName: sortOrder } }
        : sortBy === "email"
          ? { user: { email: sortOrder } }
          : { createdAt: sortOrder };

    const [patients, total] = await Promise.all([
      this.prisma.patientProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.patientInclude,
      }),
      this.prisma.patientProfile.count({ where }),
    ]);

    return {
      message: "Patients fetched successfully.",
      data: {
        patients,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(patientId: string, currentUser: Express.User) {
    const patient = await this.prisma.patientProfile.findUniqueOrThrow({
      where: { id: patientId },
      include: this.patientInclude,
    });

    if (currentUser.role === "admin") {
      return {
        message: "Patient profile fetched successfully.",
        data: patient,
      };
    }

    if (currentUser.role === "patient") {
      if (patient.userId !== currentUser.id) {
        throw new ForbiddenException(
          "You can only access your own patient profile.",
        );
      }

      return {
        message: "Patient profile fetched successfully.",
        data: patient,
      };
    }

    if (currentUser.role === "doctor") {
      const doctorProfile = await this.prisma.doctorProfile.findUniqueOrThrow({
        where: { userId: currentUser.id },
      });

      const hasAccess = await this.prisma.appointment.findFirst({
        where: {
          patientId,
          doctorId: doctorProfile.id,
        },
        select: { id: true },
      });

      if (!hasAccess) {
        throw new ForbiddenException("You can only access your own patients.");
      }

      return {
        message: "Patient profile fetched successfully.",
        data: patient,
      };
    }

    throw new ForbiddenException("Access denied.");
  }

  async update(patientId: string, dto: PatientProfileDto) {
    const patient = await this.prisma.patientProfile.update({
      where: { id: patientId },
      data: dto,
    });

    return { message: "Patient profile updated successfully.", data: patient };
  }

  private patientInclude = {
    user: {
      omit: { password: true },
      include: { avatar: true },
    },
    identificationDocument: true,
    appointments: {
      orderBy: { scheduledStartAt: "desc" },
      take: 10,
    },
  } satisfies Prisma.PatientProfileInclude;
}
