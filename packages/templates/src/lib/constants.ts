import * as emailTemplates from "@workspace/templates/email";
import type { NotificationPurpose } from "@workspace/contracts";
import type { EmailTemplateComponent } from "../types/global";

export const emailTemplateMap: Record<
  NotificationPurpose,
  EmailTemplateComponent<any>
> = {
  signIn: emailTemplates.SignIn,
  signUp: emailTemplates.SignUp,
  verifyMfa: emailTemplates.VerifyMfa,
  updateMfa: emailTemplates.UpdateMfa,
  verifyIdentifier: emailTemplates.VerifyIdentifier,
  updateIdentifier: emailTemplates.UpdateIdentifier,
  updatePassword: emailTemplates.UpdatePassword,
  userStatus: emailTemplates.UserStatus,
  securityAlert: emailTemplates.SecurityAlert,
  appointmentStatus: emailTemplates.AppointmentStatus,
  appointmentReminder: emailTemplates.AppointmentReminder,
  newChatMessage: emailTemplates.NewChatMessage,
  paymentStatus: emailTemplates.PaymentStatus,
  refundStatus: emailTemplates.RefundStatus,
  orderStatus: emailTemplates.OrderStatus,
  campaign: emailTemplates.Campaign,
  newsletter: emailTemplates.Newsletter,
  contactMessage: emailTemplates.ContactMessage,
};
