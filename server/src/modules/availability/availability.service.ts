import { BadRequestException, Injectable } from "@nestjs/common";
import type {
  AvailabilityScheduleDto,
  AvailabilitySlotsQueryDto,
} from "@workspace/contracts/availability";
import type { AppointmentStatus, Prisma, Weekday } from "@workspace/db/client";

import { DoctorService } from "@/modules/doctor/doctor.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

const ACTIVE_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "booked",
  "confirmed",
];

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly doctorService: DoctorService,
  ) {}

  async getSchedule(doctorId: string) {
    const [rules, blockedTimes] = await Promise.all([
      this.prisma.doctorAvailability.findMany({
        where: { doctorId },
        orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
      }),
      this.prisma.doctorBlockedTime.findMany({
        where: { doctorId },
        orderBy: { startAt: "asc" },
      }),
    ]);

    return {
      message: "Availability fetched successfully.",
      data: { rules, blockedTimes },
    };
  }

  async replaceSchedule(
    doctorId: string,
    dto: AvailabilityScheduleDto,
    currentUser: Express.User,
  ) {
    await this.doctorService.assertDoctorAccess(currentUser, doctorId);

    await this.prisma.$transaction(async (tx) => {
      await tx.doctorAvailability.deleteMany({
        where: { doctorId },
      });
      await tx.doctorBlockedTime.deleteMany({ where: { doctorId } });

      if (dto.rules.length) {
        await tx.doctorAvailability.createMany({
          data: dto.rules.map((rule) => ({
            doctorId,
            ...rule,
          })),
        });
      }

      if (dto.blockedTimes.length) {
        await tx.doctorBlockedTime.createMany({
          data: dto.blockedTimes.map((blockedTime) => ({
            doctorId,
            ...blockedTime,
          })),
        });
      }
    });

    return this.getSchedule(doctorId);
  }

  async getAvailableSlots(
    doctorId: string,
    query: AvailabilitySlotsQueryDto,
  ) {
    if (query.from >= query.to) {
      throw new BadRequestException("`from` must be earlier than `to`.");
    }

    const [rules, blockedTimes, appointments] = await Promise.all([
      this.prisma.doctorAvailability.findMany({
        where: { doctorId, isActive: true },
      }),
      this.prisma.doctorBlockedTime.findMany({
        where: {
          doctorId,
          startAt: { lt: query.to },
          endAt: { gt: query.from },
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          doctorId,
          status: { in: ACTIVE_APPOINTMENT_STATUSES },
          scheduledStartAt: { lt: query.to },
          scheduledEndAt: { gt: query.from },
        },
        select: {
          scheduledStartAt: true,
          scheduledEndAt: true,
        },
      }),
    ]);

    const slots = this.buildSlots(query.from, query.to, rules).filter(
      (slot) => {
        const isBlocked = blockedTimes.some((blockedTime) =>
          this.overlaps(
            slot.startAt,
            slot.endAt,
            blockedTime.startAt,
            blockedTime.endAt,
          ),
        );

        const isBooked = appointments.some((appointment) =>
          this.overlaps(
            slot.startAt,
            slot.endAt,
            appointment.scheduledStartAt,
            appointment.scheduledEndAt,
          ),
        );

        return !isBlocked && !isBooked;
      },
    );

    return {
      message: "Available slots fetched successfully.",
      data: slots,
    };
  }

  async assertSlotAvailable(
    doctorId: string,
    startAt: Date,
    endAt: Date,
  ) {
    const { data } = await this.getAvailableSlots(doctorId, {
      from: startAt,
      to: endAt,
    });

    const available = data.some(
      (slot) =>
        slot.startAt.getTime() === startAt.getTime() &&
        slot.endAt.getTime() === endAt.getTime(),
    );

    if (!available) {
      throw new BadRequestException("Selected slot is not available.");
    }
  }

  private buildSlots(
    from: Date,
    to: Date,
    rules: Array<Prisma.DoctorAvailabilityGetPayload<Record<string, never>>>,
  ) {
    const slots: Array<{ startAt: Date; endAt: Date }> = [];
    const current = new Date(from);
    current.setUTCHours(0, 0, 0, 0);

    while (current < to) {
      const dayRules = rules.filter(
        (rule) => rule.weekday === this.weekdayFromDate(current),
      );

      for (const rule of dayRules) {
        let slotStart = this.combineDateAndTime(current, rule.startTime);
        const dayEnd = this.combineDateAndTime(current, rule.endTime);

        while (slotStart < dayEnd) {
          const slotEnd = new Date(
            slotStart.getTime() + rule.slotDurationMinute * 60 * 1000,
          );

          if (slotEnd > dayEnd) break;
          if (slotStart >= from && slotEnd <= to) {
            slots.push({ startAt: new Date(slotStart), endAt: slotEnd });
          }

          slotStart = slotEnd;
        }
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }

    return slots;
  }

  private combineDateAndTime(date: Date, time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const result = new Date(date);
    result.setUTCHours(hours, minutes, 0, 0);
    return result;
  }

  private weekdayFromDate(date: Date): Weekday {
    return [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][date.getUTCDay()] as Weekday;
  }

  private overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
    return startA < endB && endA > startB;
  }
}
