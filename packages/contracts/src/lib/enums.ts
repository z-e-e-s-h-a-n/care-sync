import { z } from "zod";
import * as $Enums from "@workspace/db/enums";

export const BaseSortByEnum = z.enum(["createdAt"]);
export const SortOrderEnum = z.enum(["asc", "desc"]);
export const ChartRangeEnum = z.enum(["7d", "30d", "90d"]);
export const ThemeModeEnum = z.enum($Enums.ThemeMode);

export const UserRoleEnum = z.enum($Enums.UserRole);
export const UserStatusEnum = z.enum($Enums.UserStatus);
export const SafeUserRoleEnum = z.enum(
  Object.values($Enums.UserRole).filter((role) => role !== "admin"),
);

export const GenderEnum = z.enum($Enums.Gender);
export const IdentificationTypeEnum = z.enum($Enums.IdentificationType);

export const OtpTypeEnum = z.enum($Enums.OtpType);
export const OtpPurposeEnum = z.enum($Enums.OtpPurpose);
export const MfaMethodEnum = z.enum($Enums.MfaMethod);
export const SessionStatusEnum = z.enum($Enums.SessionStatus);
export const AuditActionEnum = z.enum($Enums.AuditAction);

export const PushProviderEnum = z.enum($Enums.PushProvider);
export const NotificationChannelEnum = z.enum($Enums.NotificationChannel);
export const NotificationPurposeEnum = z.enum($Enums.NotificationPurpose);
export const NotificationStatusEnum = z.enum($Enums.NotificationStatus);

export const MediaTypeEnum = z.enum($Enums.MediaType);
export const MediaVisibilityEnum = z.enum($Enums.MediaVisibility);

export const WeekdayEnum = z.enum($Enums.Weekday);
export const AppointmentChannelEnum = z.enum($Enums.AppointmentChannel);
export const AppointmentStatusEnum = z.enum($Enums.AppointmentStatus);
export const AppointmentCancellationSourceEnum = z.enum(
  $Enums.AppointmentCancellationSource,
);
export const BookingSourceEnum = z.enum($Enums.BookingSource);
export const ConversationTypeEnum = z.enum($Enums.ConversationType);
export const ConversationStatusEnum = z.enum($Enums.ConversationStatus);
export const PaymentProviderEnum = z.enum($Enums.PaymentProvider);
export const PaymentMethodTypeEnum = z.enum($Enums.PaymentMethodType);
export const PaymentStatusEnum = z.enum($Enums.PaymentStatus);
export const RefundStatusEnum = z.enum($Enums.RefundStatus);
export const OrderStatusEnum = z.enum($Enums.OrderStatus);
export const ShipmentStatusEnum = z.enum($Enums.ShipmentStatus);
export const CampaignStatusEnum = z.enum($Enums.CampaignStatus);
export const CampaignAudienceEnum = z.enum($Enums.CampaignAudience);
export const DoctorVerificationStatusEnum = z.enum(
  $Enums.DoctorVerificationStatus,
);

export const UserSearchByEnum = z.enum(["id", "email", "phone", "displayName"]);
export const UserSortByEnum = z.enum([
  "displayName",
  "email",
  "phone",
  "role",
  "status",
  "lastLoginAt",
]);

export const DoctorSearchByEnum = z.enum([
  "displayName",
  "specialty",
  "slug",
  "licenseNumber",
]);
export const DoctorSortByEnum = z.enum([
  "displayName",
  "specialty",
  "verificationStatus",
  "consultationFee",
]);

export const PatientSearchByEnum = z.enum(["displayName", "email", "phone"]);
export const PatientSortByEnum = z.enum(["displayName", "email", "createdAt"]);

export const AppointmentSearchByEnum = z.enum([
  "id",
  "status",
  "doctorName",
  "patientName",
  "appointmentNumber",
]);
export const AppointmentSortByEnum = z.enum([
  "scheduledStartAt",
  "status",
  "createdAt",
]);

export const PaymentSearchByEnum = z.enum([
  "appointmentId",
  "orderId",
  "status",
  "transactionId",
]);
export const PaymentSortByEnum = z.enum(["createdAt", "paidAt", "status"]);
export const ProductSearchByEnum = z.enum(["name", "sku", "slug"]);
export const ProductSortByEnum = z.enum(["name", "price", "stockQuantity"]);
export const OrderSearchByEnum = z.enum(["orderNumber", "status"]);
export const OrderSortByEnum = z.enum(["createdAt", "totalAmount", "status"]);
export const CampaignSearchByEnum = z.enum(["title", "status", "audience"]);
export const CampaignSortByEnum = z.enum([
  "createdAt",
  "scheduledAt",
  "status",
]);

export const BranchSearchByEnum = z.enum(["name", "slug"]);
export const BranchSortByEnum = z.enum(["name", "createdAt"]);

export const MediaSearchByEnum = z.enum(["id", "name"]);
export const MediaSortByEnum = z.enum(["size", "name", "type"]);

export const AuditLogSearchByEnum = z.enum([
  "userId",
  "entityType",
  "entityId",
]);
export const AuditLogSortByEnum = z.enum(["createdAt", "entityType"]);
