import { z } from "zod";
import ms, { type StringValue } from "ms";

const zMsString = z
  .string()
  .transform((val) => val as StringValue)
  .refine((val) => {
    try {
      const parsed = ms(val);
      return typeof parsed === "number" && parsed > 0;
    } catch {
      return false;
    }
  }, "Invalid ms() duration string");

export const envSchema = z.object({
  // ==============================
  // Mi MedCare Server
  // ==============================
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  APP_PORT: z.coerce.number(),
  APP_ENDPOINT: z.string(),
  CORS_ORIGIN: z
    .string()
    .transform((val) => val.split(",").map((origin) => origin.trim())),
  CLIENT_ENDPOINT: z.string(),
  ADMIN_ENDPOINT: z.string(),

  // ==============================
  // Database
  // ==============================
  DB_URI: z.string(),

  // ==============================
  // Media Storage
  // ==============================
  CLOUDINARY_URL: z.string(),
  CLOUDINARY_ROOT_FOLDER: z.string(),

  // ==============================
  // OTP and Auth
  // ==============================
  OTP_EXP: zMsString,
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  ACCESS_TOKEN_EXP: zMsString,
  REFRESH_TOKEN_EXP: zMsString,

  // ==============================
  // OAuth Providers
  // ==============================
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),

  // ==============================
  // Email Delivery
  // ==============================
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),

  // ==============================
  // SMS / WhatsApp (Twilio)
  // ==============================
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),
  TWILIO_WHATSAPP_NUMBER: z.string(),

  // ==============================
  // External APIs
  // ==============================
  IP_STACK_API_KEY: z.string(),

  // ==============================
  // Admin Bootstrap
  // ==============================
  ADMIN_NAME: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
});

export function validateEnv(config: Record<string, any>) {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      z.flattenError(parsed.error).fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export type EnvSchema = z.infer<typeof envSchema>;
