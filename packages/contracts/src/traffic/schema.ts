import z from "zod";

import { baseQuerySchema, optionalStringSchema } from "../lib/schema";
import {
  TrafficSourceSearchByEnum,
  TrafficSourceSortByEnum,
} from "../lib/enums";

export const createTrafficSourceSchema = z.object({
  utmSource: optionalStringSchema,
  utmMedium: optionalStringSchema,
  utmCampaign: optionalStringSchema,
  utmTerm: optionalStringSchema,
  utmContent: optionalStringSchema,
  referrer: optionalStringSchema,
  landingPage: optionalStringSchema,
});

export const trafficSourceQuerySchema = baseQuerySchema(
  TrafficSourceSortByEnum,
  TrafficSourceSearchByEnum,
).extend({
  utmSource: optionalStringSchema,
  utmMedium: optionalStringSchema,
  utmCampaign: optionalStringSchema,
});
