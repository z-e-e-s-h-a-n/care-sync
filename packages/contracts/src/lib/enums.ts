import { z } from "zod";
import * as $Enums from "@workspace/db/enums";

/* =========================
   SHARED - ENUMS
========================= */

export const SortOrderEnum = z.enum(["asc", "desc"]);
export const ChartRangeEnum = z.enum(["7d", "30d", "90d"]);
export const ThemeModeEnum = z.enum($Enums.ThemeMode);

export const OtpTypeEnum = z.enum($Enums.OtpType);
export const OtpPurposeEnum = z.enum($Enums.OtpPurpose);

export const MfaMethodEnum = z.enum($Enums.MfaMethod);
export const SessionStatusEnum = z.enum($Enums.SessionStatus);

export const PushProviderEnum = z.enum($Enums.PushProvider);
export const MessagingChannelEnum = z.enum($Enums.MessagingChannel);
export const NotificationChannelEnum = z.enum($Enums.NotificationChannel);
export const NotificationPurposeEnum = z.enum($Enums.NotificationPurpose);
export const NotificationStatusEnum = z.enum($Enums.NotificationStatus);
export const NotificationPriorityEnum = z.enum($Enums.NotificationPriority);

export const ContactMessageStatusEnum = z.enum($Enums.ContactMessageStatus);

/* =========================
   SHARED - VARIABLES
========================= */

export const BaseSortByEnum = z.enum(["createdAt"]);

/* =========================
   USER
========================= */
export const UserRoleEnum = z.enum($Enums.UserRole).exclude(["admin"]);
export const UserStatusEnum = z.enum($Enums.UserStatus);

export const UserSearchByEnum = z.enum(["id", "email", "phone", "displayName"]);
export const UserSortByEnum = z.enum([
  "phone",
  "email",
  "role",
  "status",
  "displayName",
  "lastLoginAt",
]);

// =========================
// MEDIA
// =========================

export const MediaTypeEnum = z.enum($Enums.MediaType);
export const MediaVisibilityEnum = z.enum($Enums.MediaVisibility);

export const MediaSearchByEnum = z.enum(["id", "title"]);
export const MediaSortByEnum = z.enum(["size", "title", "type"]);

/* =========================
   LEADS
========================= */
export const NewsletterSubscriberSortByEnum = z.enum([
  "name",
  "email",
  "subscribedAt",
  "unsubscribedAt",
]);

export const NewsletterSubscriberSearchByEnum = z.enum(["name", "email"]);

export const ContactMessageSortByEnum = z.enum([
  "fullName",
  "email",
  "phone",
  "repliedAt",
]);

export const ContactMessageSearchByEnum = z.enum(["name", "email", "phone"]);

/* =========================
   SYSTEM
========================= */

export const AuditActionEnum = z.enum($Enums.AuditAction);
export const AuditLogSearchByEnum = z.enum([
  "userId",
  "entityType",
  "entityId",
]);
export const AuditLogSortByEnum = z.enum(["createdAt", "entityType"]);

export const TrafficSourceSearchByEnum = z.enum([
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "referrer",
  "landingPage",
]);
export const TrafficSourceSortByEnum = z.enum(["createdAt"]);
