import { Text } from "@react-email/components";
import { appName } from "@workspace/shared/constants";
import { Greeting } from "./components/greeting";
import { Header } from "./components/header";
import { Layout } from "./components/layout";
import type {
  EmailTemplateComponent,
  EmailTemplateProps,
} from "../types/global";

const isSuspended = (props: EmailTemplateProps<"userStatus">) =>
  props.user.status === "suspended";

export const UserStatus: EmailTemplateComponent<"userStatus"> = (props) => {
  if (isSuspended(props)) {
    return (
      <Layout previewText="Your account has been suspended">
        <Header
          title="Account Suspended"
          subtitle={`${appName.default} Travel Account Notice`}
        />
        <Greeting name={props.user.displayName} />
        <Text className="text-base text-gray-900">
          Your {appName.default} account has been temporarily suspended.
        </Text>
        {props.message && (
          <Text className="text-base text-gray-900">
            Reason: {props.message}
          </Text>
        )}
        <Text className="text-base text-gray-900">
          If you believe this is a mistake or need further assistance, please
          contact our support team.
        </Text>
      </Layout>
    );
  }

  return (
    <Layout previewText="Your account has been reactivated">
      <Header
        title="Account Reactivated"
        subtitle={`Welcome back to ${appName.default}`}
      />
      <Greeting name={props.user.displayName} />
      <Text className="text-base text-gray-900">
        Great news! Your {appName.default} travel account has been successfully
        reactivated.
      </Text>
      <Text className="text-base text-gray-900">
        You can now sign in and continue planning your trips without any
        restrictions.
      </Text>
    </Layout>
  );
};

UserStatus.subject = (props) =>
  isSuspended(props)
    ? `Your ${appName.default} account has been suspended`
    : `Your ${appName.default} account has been reactivated`;

UserStatus.message = (props) =>
  isSuspended(props)
    ? `Your ${appName.default} account has been suspended${props.message ? `. Reason: ${props.message}` : "."}`
    : `Your ${appName.default} account has been successfully reactivated.`;
