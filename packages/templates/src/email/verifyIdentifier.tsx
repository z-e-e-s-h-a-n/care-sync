import { Text } from "@react-email/components";
import { ActionBlock } from "./components/actionBlock";
import { Greeting } from "./components/greeting";
import { Header } from "./components/header";
import { Layout } from "./components/layout";
import type { EmailTemplateComponent } from "../types/global";

export const VerifyIdentifier: EmailTemplateComponent<"verifyIdentifier"> = ({
  user,
  otp,
  identifier,
  clientUrl,
}) => {
  const type = identifier.includes("@") ? "email" : "phone number";
  const typeLabel = type === "email" ? "Email Address" : "Phone Number";
  const link = `${clientUrl}/auth/verify?identifier=${identifier}&purpose=${otp?.purpose}&secret=${otp?.secret}&type=${otp?.type}`;

  return (
    <Layout previewText={`Verify your ${type}`}>
      <Header title={`Verify Your ${typeLabel}`} />
      <Greeting name={user.displayName} />
      <Text className="text-base text-gray-900">
        Please verify your {type} to activate your travel account.
      </Text>
      {otp ? (
        <ActionBlock link={link} label={`Verify ${type}`} otp={otp} />
      ) : (
        <Text className="text-base text-gray-900">
          Your {type} has been verified successfully.
        </Text>
      )}
    </Layout>
  );
};

VerifyIdentifier.subject = (props) => {
  const type = props.identifier.includes("@") ? "email" : "phone number";
  return `Verify your ${type}`;
};
VerifyIdentifier.message = (props) =>
  props.otp
    ? `Verification code: ${props.otp.secret}`
    : "Your identifier has been verified.";
