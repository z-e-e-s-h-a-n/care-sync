import * as winston from "winston";
import { utilities } from "nest-winston";
import { appName } from "@workspace/shared/constants";

const isProduction = process.env.NODE_ENV === "production";

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      level: isProduction ? "info" : "debug",
      format: winston.format.combine(
        winston.format.timestamp(),
        utilities.format.nestLike(appName.short, { prettyPrint: true }),
      ),
    }),
  ],
};
