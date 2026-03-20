import { z } from "zod";
import * as enums from "./enums";
import React from "react";
import { Prisma } from "@workspace/db/browser";

/* --------------------
     Shared - Utilities
  -------------------- */

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
          : {
              [K in keyof T]: Sanitize<T[K]>;
            };

/* --------------------
     Apps Shared - Types
  -------------------- */

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

export type FormSectionType = "add" | "update";
export type AuthFormType =
  | "sign-up"
  | "sign-in"
  | "reset-password"
  | "set-password";

export interface BaseCUFormProps {
  entityId?: string;
  formType: FormSectionType;
}

/* --------------------
     Shared - TYPES
  -------------------- */

export type SortOrderType = z.infer<typeof enums.SortOrderEnum>;
export type ChartRangeType = z.infer<typeof enums.ChartRangeEnum>;

export type IdentifierType = "email" | "phone";
export type OAuthProvider = "google" | "facebook" | "apple";
export type AuthActions = "verifyIdentifier" | "verifyMfa" | "setPassword";
export type MfaMethod = z.infer<typeof enums.MfaMethodEnum>;

export type OtpPurpose = z.infer<typeof enums.OtpPurposeEnum>;
export type OtpType = z.infer<typeof enums.OtpTypeEnum>;
export type SessionStatus = z.infer<typeof enums.SessionStatusEnum>;

export type PushProvider = z.infer<typeof enums.PushProviderEnum>;
export type NotificationPurpose = z.infer<typeof enums.NotificationPurposeEnum>;
export type MessagingChannel = z.infer<typeof enums.MessagingChannelEnum>;
export type NotificationChannel = z.infer<typeof enums.NotificationChannelEnum>;
export type NotificationPriority = z.infer<
  typeof enums.NotificationPriorityEnum
>;
export type NotificationStatus = z.infer<typeof enums.NotificationStatusEnum>;

/* --------------------
     SHARED QUERY - TYPES
  -------------------- */

export type BaseSortByType = z.infer<typeof enums.BaseSortByEnum>;

export interface BaseQueryType {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: SortOrderType;
  sortBy?: string;
  searchBy?: string;
}

/* --------------------
     SHARED RESPONSE - TYPES
  -------------------- */

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

/* --------------------
     USER - TYPES
  -------------------- */

export type UserRole = z.infer<typeof enums.UserRoleEnum>;
export type UserStatus = z.infer<typeof enums.UserStatusEnum>;
export type UserSearchByType = z.infer<typeof enums.UserSearchByEnum>;
export type UserSortByType = z.infer<typeof enums.UserSortByEnum>;

/* --------------------
     MEDIA - TYPES
  -------------------- */

export type MediaType = z.infer<typeof enums.MediaTypeEnum>;
export type MediaVisibility = z.infer<typeof enums.MediaVisibilityEnum>;

/* --------------------
     NEWSLETTER - TYPES
  -------------------- */

export type NewsletterSubscriberSortByType = z.infer<
  typeof enums.NewsletterSubscriberSortByEnum
>;
export type NewsletterSubscriberSearchByType = z.infer<
  typeof enums.NewsletterSubscriberSearchByEnum
>;

/* --------------------
     SYSTEM - TYPES
  -------------------- */

export type AuditAction = z.infer<typeof enums.AuditActionEnum>;
export type AuditLogSearchByType = z.infer<typeof enums.AuditLogSearchByEnum>;
export type AuditLogSortByType = z.infer<typeof enums.AuditLogSortByEnum>;
export type TrafficSourceSearchByType = z.infer<
  typeof enums.TrafficSourceSearchByEnum
>;
export type TrafficSourceSortByType = z.infer<
  typeof enums.TrafficSourceSortByEnum
>;
