import { createZodDto } from "nestjs-zod";
import {
  availabilityRuleSchema,
  availabilityScheduleSchema,
  availabilitySlotsQuerySchema,
  blockedTimeSchema,
} from "./schema";

export class AvailabilityRuleDto extends createZodDto(availabilityRuleSchema) {}

export class BlockedTimeDto extends createZodDto(blockedTimeSchema) {}

export class AvailabilityScheduleDto extends createZodDto(
  availabilityScheduleSchema,
) {}

export class AvailabilitySlotsQueryDto extends createZodDto(
  availabilitySlotsQuerySchema,
) {}
