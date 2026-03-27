import React from "react";
import { Prisma } from "@workspace/db/browser";
import { z } from "zod";
import * as enums from "./enums";
import { type Icon } from "@tabler/icons-react";

export type Nullable<T> = T | null;
export type DecimalInstance = InstanceType<typeof Prisma.Decimal>;
export type StrictOmit<T, K extends keyof T> = Omit<T, K>;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type ArrayItem<T> = T extends any[] ? T[number] : never;

export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | undefined
  | null;

export type Sanitize<T> = T extends DecimalInstance
  ? number
  : T extends Date
    ? string
    : T extends null
      ? undefined
      : T extends Primitive
        ? T
        : T extends Array<infer U>
          ? Array<Sanitize<U>>
          : { [K in keyof T]: Sanitize<T[K]> };

export interface SegmentParams {
  [key: string]: string;
}

export type TSearchParams = Record<string, string | string[] | undefined>;

export interface AppPageProps<
  TParams extends SegmentParams = SegmentParams,
  TSParams extends TSearchParams = TSearchParams,
> {
  params: Promise<TParams>;
  searchParams: Promise<TSParams>;
}

export interface AppLayoutProps {
  children?: React.ReactNode;
}

export type NavItem = {
  label: string;
  href?: string;
  icon?: Icon;
  children?: NavItem[];
};

export interface NavGroup {
  groupLabel?: string;
  items: NavItem[];
}

export type FormSectionType = "add" | "update";
export interface BaseCUFormProps {
  entityId?: string;
  formType: FormSectionType;
}

export type AuthFormType =
  | "sign-up"
  | "sign-in"
  | "reset-password"
  | "set-password";

export type ClientApp = "web" | "dashboard";
export type IdentifierType = "email" | "phone";
export type OAuthProvider = "google";
export type SortOrderType = z.infer<typeof enums.SortOrderEnum>;
export type ChartRangeType = z.infer<typeof enums.ChartRangeEnum>;
export type ThemeMode = z.infer<typeof enums.ThemeModeEnum>;

export type OtpPurpose = z.infer<typeof enums.OtpPurposeEnum>;
export type OtpType = z.infer<typeof enums.OtpTypeEnum>;
export type MfaMethod = z.infer<typeof enums.MfaMethodEnum>;
export type SessionStatus = z.infer<typeof enums.SessionStatusEnum>;

export type PushProvider = z.infer<typeof enums.PushProviderEnum>;
export type NotificationChannel = z.infer<typeof enums.NotificationChannelEnum>;
export type NotificationPurpose = z.infer<typeof enums.NotificationPurposeEnum>;
export type NotificationStatus = z.infer<typeof enums.NotificationStatusEnum>;

export interface BaseQueryType {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: SortOrderType;
  sortBy?: string;
  searchBy?: string;
}

export interface HealthCheckResponse {
  message: string;
  status: string;
  uptime: string;
  timestamp: string;
}

export interface BaseResponse {
  id: string;
}

export interface BaseQueryResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type UserRole = z.infer<typeof enums.UserRoleEnum>;
export type SafeUserRole = z.infer<typeof enums.SafeUserRoleEnum>;
export type UserStatus = z.infer<typeof enums.UserStatusEnum>;
export type Gender = z.infer<typeof enums.GenderEnum>;
export type IdentificationType = z.infer<typeof enums.IdentificationTypeEnum>;

export type Weekday = z.infer<typeof enums.WeekdayEnum>;
export type AppointmentChannel = z.infer<typeof enums.AppointmentChannelEnum>;
export type AppointmentStatus = z.infer<typeof enums.AppointmentStatusEnum>;
export type AppointmentCancellationSource = z.infer<
  typeof enums.AppointmentCancellationSourceEnum
>;
export type BookingSource = z.infer<typeof enums.BookingSourceEnum>;
export type ConversationType = z.infer<typeof enums.ConversationTypeEnum>;
export type ConversationStatus = z.infer<typeof enums.ConversationStatusEnum>;
export type PaymentProvider = z.infer<typeof enums.PaymentProviderEnum>;
export type PaymentMethodType = z.infer<typeof enums.PaymentMethodTypeEnum>;
export type PaymentStatus = z.infer<typeof enums.PaymentStatusEnum>;
export type RefundStatus = z.infer<typeof enums.RefundStatusEnum>;
export type OrderStatus = z.infer<typeof enums.OrderStatusEnum>;
export type ShipmentStatus = z.infer<typeof enums.ShipmentStatusEnum>;
export type CampaignStatus = z.infer<typeof enums.CampaignStatusEnum>;
export type CampaignAudience = z.infer<typeof enums.CampaignAudienceEnum>;
export type DoctorVerificationStatus = z.infer<
  typeof enums.DoctorVerificationStatusEnum
>;

export type MediaType = z.infer<typeof enums.MediaTypeEnum>;
export type MediaVisibility = z.infer<typeof enums.MediaVisibilityEnum>;
export type AuditAction = z.infer<typeof enums.AuditActionEnum>;
