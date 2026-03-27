import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ulid } from "ulid";
import type {
  AppointmentQueryDto,
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
} from "@workspace/contracts/appointment";
import type { AppointmentStatus, Prisma } from "@workspace/db/client";

import { AvailabilityService } from "@/modules/availability/availability.service";
import { DoctorService } from "@/modules/doctor/doctor.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class AppointmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: AvailabilityService,
    private readonly doctorService: DoctorService,
  ) {}

  async create(dto: CreateAppointmentDto, currentUser: Express.User) {
    await this.validateBookingAccess(dto, currentUser);
    await this.ensureDoctor(dto);
    await this.availabilityService.assertSlotAvailable(
      dto.doctorId,
      dto.scheduledStartAt,
      dto.scheduledEndAt,
    );

    const appointment = await this.prisma.appointment.create({
      data: {
        ...dto,
        appointmentNumber: `APT-${ulid().slice(-10).toUpperCase()}`,
        createdById: dto.createdById ?? currentUser.id,
      },
      include: this.appointmentInclude,
    });

    await this.prisma.conversation.create({
      data: {
        branchId: appointment.branchId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        assignedToId: appointment.doctor.userId,
        type: "appointment",
        subject: `Appointment ${appointment.appointmentNumber}`,
      },
    });

    return {
      message: "Appointment booked successfully.",
      data: appointment,
    };
  }

  async list(query: AppointmentQueryDto, currentUser: Express.User) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      searchBy,
      branchId,
      doctorId,
      patientId,
      status,
      paymentStatus,
      startsFrom,
      startsTo,
    } = query;

    const where: Prisma.AppointmentWhereInput = {};

    if (branchId) where.branchId = branchId;
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (startsFrom || startsTo) {
      where.scheduledStartAt = {
        ...(startsFrom ? { gte: startsFrom } : {}),
        ...(startsTo ? { lte: startsTo } : {}),
      };
    }

    await this.applyRoleScope(where, currentUser);

    if (search && searchBy) {
      const searchWhereMap: Record<
        typeof searchBy,
        Prisma.AppointmentWhereInput
      > = {
        id: {
          OR: [
            { id: search },
            { appointmentNumber: { contains: search, mode: "insensitive" } },
          ],
        },
        status: { status: search as AppointmentStatus },
        doctorName: {
          doctor: {
            user: { displayName: { contains: search, mode: "insensitive" } },
          },
        },
        patientName: {
          patient: {
            user: { displayName: { contains: search, mode: "insensitive" } },
          },
        },
        appointmentNumber: {
          appointmentNumber: { contains: search, mode: "insensitive" },
        },
      };

      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy =
      sortBy === "scheduledStartAt"
        ? { scheduledStartAt: sortOrder }
        : { [sortBy]: sortOrder };

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.appointmentInclude,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      message: "Appointments fetched successfully.",
      data: {
        appointments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(appointmentId: string, currentUser: Express.User) {
    const appointment = await this.prisma.appointment.findUniqueOrThrow({
      where: { id: appointmentId },
      include: this.appointmentInclude,
    });

    await this.assertAppointmentAccess(appointment, currentUser);

    return {
      message: "Appointment fetched successfully.",
      data: appointment,
    };
  }

  async updateStatus(
    appointmentId: string,
    dto: UpdateAppointmentStatusDto,
    currentUser: Express.User,
  ) {
    const appointment = await this.prisma.appointment.findUniqueOrThrow({
      where: { id: appointmentId },
      include: this.appointmentInclude,
    });

    await this.assertStatusUpdateAccess(appointment, dto.status, currentUser);

    const timestamps = this.statusTimestamps(dto.status);
    const cancellationSource =
      dto.status === "cancelled" ? currentUser.role : undefined;

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: dto.status,
        paymentStatus: dto.paymentStatus ?? appointment.paymentStatus,
        doctorNotes: dto.doctorNotes ?? appointment.doctorNotes,
        adminNotes: dto.adminNotes ?? appointment.adminNotes,
        cancellationReason:
          dto.cancellationReason ?? appointment.cancellationReason,
        ...(cancellationSource
          ? {
              cancellationSource:
                dto.cancellationSource ?? (cancellationSource as any),
            }
          : {}),
        ...timestamps,
      },
      include: this.appointmentInclude,
    });

    return {
      message: "Appointment updated successfully.",
      data: updated,
    };
  }

  private async validateBookingAccess(
    dto: CreateAppointmentDto,
    currentUser: Express.User,
  ) {
    if (currentUser.role === "patient") {
      const patientProfile = await this.prisma.patientProfile.findUniqueOrThrow(
        {
          where: { userId: currentUser.id },
        },
      );

      if (patientProfile.id !== dto.patientId) {
        throw new ForbiddenException(
          "You can only book appointments for yourself.",
        );
      }

      return;
    }

    if (currentUser.role === "doctor") {
      const doctorProfile = await this.doctorService.findByUserIdOrThrow(
        currentUser.id,
      );

      if (doctorProfile.id !== dto.doctorId) {
        throw new ForbiddenException(
          "Doctors can only book appointments for themselves.",
        );
      }
    }
  }

  private async ensureDoctor(dto: CreateAppointmentDto) {
    const doctor = await this.prisma.doctorProfile.findUniqueOrThrow({
      where: { id: dto.doctorId },
      include: {
        branch: true,
      },
    });

    if (
      doctor.branchId !== dto.branchId ||
      doctor.verificationStatus !== "verified" ||
      !doctor.isAvailable
    ) {
      throw new BadRequestException("Doctor is not available for booking.");
    }
  }

  private async applyRoleScope(
    where: Prisma.AppointmentWhereInput,
    currentUser: Express.User,
  ) {
    if (currentUser.role === "admin") return;

    if (currentUser.role === "doctor") {
      const doctor = await this.doctorService.findByUserIdOrThrow(
        currentUser.id,
      );
      where.doctorId = doctor.id;
      return;
    }

    const patient = await this.prisma.patientProfile.findUniqueOrThrow({
      where: { userId: currentUser.id },
    });
    where.patientId = patient.id;
  }

  private async assertAppointmentAccess(
    appointment: any,
    currentUser: Express.User,
  ) {
    if (currentUser.role === "admin") return;

    if (currentUser.role === "doctor") {
      const doctor = await this.doctorService.findByUserIdOrThrow(
        currentUser.id,
      );
      if (appointment.doctorId !== doctor.id) {
        throw new ForbiddenException(
          "You can only view your own appointments.",
        );
      }
      return;
    }

    const patient = await this.prisma.patientProfile.findUniqueOrThrow({
      where: { userId: currentUser.id },
    });

    if (appointment.patientId !== patient.id) {
      throw new ForbiddenException("You can only view your own appointments.");
    }
  }

  private async assertStatusUpdateAccess(
    appointment: any,
    nextStatus: AppointmentStatus,
    currentUser: Express.User,
  ) {
    if (currentUser.role === "admin") return;

    if (currentUser.role === "doctor") {
      const doctor = await this.doctorService.findByUserIdOrThrow(
        currentUser.id,
      );
      if (appointment.doctorId !== doctor.id) {
        throw new ForbiddenException(
          "You can only manage your own appointments.",
        );
      }

      const allowed: AppointmentStatus[] = [
        "confirmed",
        "completed",
        "cancelled",
        "noShow",
      ];
      if (!allowed.includes(nextStatus)) {
        throw new ForbiddenException(
          "Doctors cannot set this appointment status.",
        );
      }
      return;
    }

    const patient = await this.prisma.patientProfile.findUniqueOrThrow({
      where: { userId: currentUser.id },
    });
    if (appointment.patientId !== patient.id || nextStatus !== "cancelled") {
      throw new ForbiddenException(
        "Patients can only cancel their own appointments.",
      );
    }
  }

  private statusTimestamps(status: AppointmentStatus) {
    switch (status) {
      case "confirmed":
        return { confirmedAt: new Date() };
      case "cancelled":
        return { cancelledAt: new Date() };
      case "completed":
        return { completedAt: new Date() };
      default:
        return {};
    }
  }

  private appointmentInclude = {
    branch: true,
    doctor: {
      include: {
        user: { omit: { password: true }, include: { image: true } },
        branch: true,
      },
    },
    patient: {
      include: {
        user: { omit: { password: true }, include: { image: true } },
      },
    },
    conversation: true,
    payments: true,
  } satisfies Prisma.AppointmentInclude;
}
