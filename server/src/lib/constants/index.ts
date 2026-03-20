import type {
  NotificationPriority,
  NotificationPurpose,
} from "@workspace/contracts";

/**
 * IMPORTANT = user must see this even if it costs money (SMS / WhatsApp)
 * Do NOT mark notifications important unless missing it causes
 * loss of access, money, or travel.
 */

export const NOTIFICATION_POLICY_MAP: Record<
  NotificationPurpose,
  { priority: NotificationPriority; push: boolean }
> = {
  // AUTH
  signUp: {
    priority: "normal",
    push: false,
  },
  signIn: {
    priority: "normal",
    push: false,
  },

  updatePassword: {
    priority: "important",
    push: false,
  },
  verifyIdentifier: {
    priority: "important",
    push: false,
  },
  updateIdentifier: {
    priority: "important",
    push: false,
  },
  updateMfa: {
    priority: "important",
    push: false,
  },
  verifyMfa: {
    priority: "important",
    push: false,
  },

  // ACCOUNT
  userStatus: {
    priority: "important",
    push: true,
  },

  //Contact Message
  contactMessage: {
    priority: "normal",
    push: false,
  },

  // Newsletter
  newsletter: {
    priority: "normal",
    push: false,
  },

  securityAlert: {
    priority: "important",
    push: true,
  },
};
