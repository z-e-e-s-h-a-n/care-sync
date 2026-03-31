import { createZodDto } from "nestjs-zod";

import { createTrafficSourceSchema, trafficSourceQuerySchema } from "./schema";

export class CreateTrafficSourceDto extends createZodDto(
  createTrafficSourceSchema,
) {}

export class TrafficSourceQueryDto extends createZodDto(
  trafficSourceQuerySchema,
) {}
