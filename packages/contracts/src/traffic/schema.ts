import z from "zod";

import { baseQuerySchema } from "../lib/schema";
import {
  TrafficSourceSearchByEnum,
  TrafficSourceSortByEnum,
} from "../lib/enums";

export const createTrafficSourceSchema = z.object({
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  referrer: z.string().optional(),
  landingPage: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
});

export const trafficSourceQuerySchema = baseQuerySchema(
  TrafficSourceSortByEnum,
  TrafficSourceSearchByEnum,
).extend({
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});
