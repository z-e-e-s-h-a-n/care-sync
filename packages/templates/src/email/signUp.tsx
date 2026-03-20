import { Text } from "@react-email/components";
import { appName } from "@workspace/shared/constants";
import { Greeting } from "./components/greeting";
import { Header } from "./components/header";
import { Layout } from "./components/layout";
import type { EmailTemplateComponent } from "../types/global";

export const SignUp: EmailTemplateComponent<"signUp"> = ({ user }) => (
  <Layout previewText={`Welcome to ${appName.default}`}>
    <Header
      title={`Welcome to ${appName.default}`}
      subtitle="Your travel account is ready"
    />
    <Greeting name={user.displayName} />
    <Text className="text-base text-gray-900">
      Your travel agency account has been successfully created.
    </Text>
    <Text className="text-base text-gray-900">
      You can now sign in and start planning your next adventure.
    </Text>
  </Layout>
);

SignUp.subject = () => `Welcome to ${appName.default}`;
SignUp.message = () => `Welcome to ${appName.default}. Your account is ready.`;
