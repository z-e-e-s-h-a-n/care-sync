import { Text } from "@react-email/components";
import { ActionBlock } from "./components/actionBlock";
import { Greeting } from "./components/greeting";
import { Header } from "./components/header";
import { Layout } from "./components/layout";
import type { EmailTemplateComponent } from "../types/global";

export const UpdateIdentifier: EmailTemplateComponent<"updateIdentifier"> = ({
  user,
  otp,
  identifier,
  clientUrl,
  meta,
}) => {
  const { oldIdentifier, newIdentifier } = meta;
  const type = identifier.includes("@") ? "email" : "phone number";
  const subjectType = type === "email" ? "Email" : "Phone";

  if (otp) {
    const link = `${clientUrl}/auth/verify?identifier=${oldIdentifier}&newIdentifier=${newIdentifier}&purpose=${otp.purpose}&secret=${otp.secret}&type=${otp.type}`;
    return (
      <Layout previewText={`${subjectType} change request`}>
        <Header
          title={`${type === "email" ? "Email" : "Phone Number"} Change Request`}
          subtitle={`Confirm your new ${type}`}
        />
        <Greeting name={user.displayName} />
        <Text className="text-base text-gray-900">
          A request was made to change your {type}.
        </Text>
        <Text className="text-base text-gray-900">
          Current {subjectType}: <strong>{oldIdentifier}</strong>
        </Text>
        <Text className="text-base text-gray-900">
          New {subjectType}: <strong>{newIdentifier}</strong>
        </Text>
        <ActionBlock
          link={link}
          label={`Confirm ${subjectType} Change`}
          otp={otp}
        />
      </Layout>
    );
  }

  return (
    <Layout previewText={`${subjectType} updated`}>
      <Header
        title={`${type === "email" ? "Email Address" : "Phone Number"} Updated`}
      />
      <Greeting name={user.displayName} />
      <Text className="text-base text-gray-900">
        Your {type} has been successfully updated.
      </Text>
      <Text className="text-base text-gray-900">
        Previous {subjectType}: <strong>{oldIdentifier}</strong>
      </Text>
      <Text className="text-base text-gray-900">
        New {subjectType}: <strong>{newIdentifier}</strong>
      </Text>
    </Layout>
  );
};

UpdateIdentifier.subject = (props) => {
  const type = props.identifier.includes("@") ? "email" : "phone number";
  const subjectType = type === "email" ? "Email" : "Phone";
  return props.otp ? `${subjectType} change request` : `${subjectType} updated`;
};
UpdateIdentifier.message = (props) => {
  const type = props.identifier.includes("@") ? "email" : "phone number";
  return props.otp ? `Confirm ${type} change.` : `${type} updated.`;
};
