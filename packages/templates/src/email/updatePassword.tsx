import { Text } from "@react-email/components";
import { appName } from "@workspace/shared/constants";
import { ActionBlock } from "./components/actionBlock";
import { Greeting } from "./components/greeting";
import { Header } from "./components/header";
import { Layout } from "./components/layout";
import type {
  EmailTemplateComponent,
  EmailTemplateProps,
} from "../types/global";

const isSetPassword = (props: EmailTemplateProps<"updatePassword">) => {
  if (props.action) return props.action === "set";
  return props.otp?.purpose === "setPassword";
};

export const UpdatePassword: EmailTemplateComponent<"updatePassword"> = (
  props,
) => {
  if (isSetPassword(props)) {
    if (props.otp) {
      const link = `${props.clientUrl}/auth/set-password?identifier=${props.identifier}&purpose=${props.otp.purpose}&secret=${props.otp.secret}&type=${props.otp.type}`;
      return (
        <Layout previewText="Set your password">
          <Header title="Set Your Password" />
          <Greeting name={props.user.displayName} />
          <Text className="text-base text-gray-900">
            Create a password to access your {appName.default} travel account.
          </Text>
          <ActionBlock link={link} label="Set password" otp={props.otp} />
        </Layout>
      );
    }

    return (
      <Layout previewText="Password set successfully">
        <Header title="Password Set Successfully" />
        <Greeting name={props.user.displayName} />
        <Text className="text-base text-gray-900">
          Your password has been created successfully.
        </Text>
      </Layout>
    );
  }

  if (props.otp) {
    const link = `${props.clientUrl}/auth/reset-password?identifier=${props.identifier}&purpose=${props.otp.purpose}&secret=${props.otp.secret}&type=${props.otp.type}`;
    return (
      <Layout previewText="Reset your password">
        <Header title="Reset Your Password" />
        <Greeting name={props.user.displayName} />
        <Text className="text-base text-gray-900">
          Use the code below to reset your password.
        </Text>
        <ActionBlock link={link} label="Reset password" otp={props.otp} />
      </Layout>
    );
  }

  return (
    <Layout previewText="Password reset successful">
      <Header title="Password Reset Successful" />
      <Greeting name={props.user.displayName} />
      <Text className="text-base text-gray-900">
        Your password has been updated.
      </Text>
    </Layout>
  );
};

UpdatePassword.subject = (props) => {
  if (isSetPassword(props))
    return props.otp ? "Set your password" : "Password set successfully";
  return props.otp ? "Reset your password" : "Password reset successful";
};

UpdatePassword.message = (props) => {
  if (isSetPassword(props))
    return props.otp
      ? `Your setup code is ${props.otp.secret}`
      : "Password set.";
  return props.otp ? `Reset code: ${props.otp.secret}` : "Password reset.";
};
