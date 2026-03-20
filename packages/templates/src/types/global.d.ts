import type {
  Otp,
  ContactMessage,
  NewsletterSubscriber,
} from "@workspace/db/browser";

export type EmailTemplateComponent<TPurpose extends NotificationPurpose> = {
  (props: EmailTemplateProps<TPurpose>): React.ReactElement;
  subject: (props: EmailTemplateProps<TPurpose>) => string;
  message: (props: EmailTemplateProps<TPurpose>) => string;
};
export interface EmailTemplateResult {
  subject: string;
  html: string;
  message: string;
}

export interface EmailTemplateBaseProps {
  user: SafeUser;
  otp?: Otp;
  identifier: string;
  clientUrl?: string;
  message: string;
  contactMessage: ContactMessage;
  newsletterSubscriber: NewsletterSubscriber;
}

export type EmailTemplateMap = {
  signUp: Pick<EmailTemplateBaseProps, "user">;

  signIn: Pick<EmailTemplateBaseProps, "user">;

  securityAlert: Pick<EmailTemplateBaseProps, "user" | "message">;

  verifyMfa: Pick<EmailTemplateBaseProps, "user" | "otp">;

  updateMfa: {
    action: "enable" | "disable" | "update";
  } & Pick<EmailTemplateBaseProps, "user" | "otp">;

  updatePassword: {
    action: "set" | "update" | "reset";
  } & Pick<EmailTemplateBaseProps, "user" | "otp" | "identifier" | "clientUrl">;

  verifyIdentifier: Pick<
    EmailTemplateBaseProps,
    "user" | "otp" | "identifier" | "clientUrl"
  >;

  updateIdentifier: Pick<
    EmailTemplateBaseProps,
    "user" | "otp" | "identifier" | "clientUrl"
  > & {
    meta: {
      newIdentifier: string;
      oldIdentifier: string;
    };
  };

  userStatus: Pick<EmailTemplateBaseProps, "user" | "message">;

  newsletter: Pick<EmailTemplateBaseProps, "newsletterSubscriber">;

  contactMessage: Pick<EmailTemplateBaseProps, "contactMessage">;
};

export type EmailTemplateProps<T extends NotificationPurpose> = {
  purpose: T;
} & EmailTemplateMap[T];
