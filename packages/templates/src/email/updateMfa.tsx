import { Text } from "@react-email/components";
import { Greeting } from "./components/greeting";
import { Header } from "./components/header";
import { Layout } from "./components/layout";
import { NumericCode } from "./components/numericCode";
import type {
  EmailTemplateComponent,
  EmailTemplateProps,
} from "../types/global";

const isDisableFlow = (props: EmailTemplateProps<"updateMfa">) => {
  if (props.action) return props.action === "disable";
  return props.otp?.purpose === "disableMfa";
};

export const UpdateMfa: EmailTemplateComponent<"updateMfa"> = (props) => {
  if (isDisableFlow(props)) {
    if (props.otp) {
      return (
        <Layout previewText="Disable two-factor authentication">
          <Header title="Disable Two-Factor Authentication" />
          <Greeting name={props.user.displayName} />
          <Text className="text-base text-gray-900">
            Use the code below to disable 2FA for your travel account.
          </Text>
          <NumericCode code={props.otp.secret} />
          <Text className="text-xs text-gray-500 text-center">
            This code expires in 15 minutes.
          </Text>
        </Layout>
      );
    }

    return (
      <Layout previewText="Two-factor authentication disabled">
        <Header title="2FA Disabled" />
        <Greeting name={props.user.displayName} />
        <Text className="text-base text-gray-900">
          Two-factor authentication has been disabled on your account.
        </Text>
      </Layout>
    );
  }

  if (props.otp) {
    return (
      <Layout previewText="Enable two-factor authentication">
        <Header title="Enable Two-Factor Authentication" />
        <Greeting name={props.user.displayName} />
        <Text className="text-base text-gray-900">
          Use the code below to enable 2FA for your travel account.
        </Text>
        <NumericCode code={props.otp.secret} />
        <Text className="text-xs text-gray-500 text-center">
          This code expires in 15 minutes.
        </Text>
      </Layout>
    );
  }

  return (
    <Layout previewText="Two-factor authentication enabled">
      <Header title="2FA Enabled Successfully" />
      <Greeting name={props.user.displayName} />
      <Text className="text-base text-gray-900">
        Two-factor authentication is now active on your account.
      </Text>
    </Layout>
  );
};

UpdateMfa.subject = (props) => {
  if (isDisableFlow(props)) {
    return props.otp
      ? "Disable two-factor authentication"
      : "Two-factor authentication disabled";
  }
  return props.otp
    ? "Enable two-factor authentication"
    : "Two-factor authentication enabled";
};

UpdateMfa.message = (props) => {
  if (isDisableFlow(props)) {
    return props.otp
      ? `Your 2FA disable code is ${props.otp.secret}.`
      : "2FA disabled.";
  }
  return props.otp
    ? `Your 2FA setup code is ${props.otp.secret}.`
    : "2FA enabled.";
};
