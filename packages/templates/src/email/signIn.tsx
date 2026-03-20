import { Text } from "@react-email/components";
import { Greeting } from "./components/greeting";
import { Header } from "./components/header";
import { Layout } from "./components/layout";
import type { EmailTemplateComponent } from "../types/global";

export const SignIn: EmailTemplateComponent<"signIn"> = ({ user }) => (
  <Layout previewText="New sign-in detected">
    <Header title="New Sign-in Detected" />
    <Greeting name={user.displayName} />
    <Text className="text-base text-gray-900">
      A sign-in to your travel account was detected.
    </Text>
    <Text className="text-base text-gray-900">
      If this wasn't you, please secure your account immediately.
    </Text>
  </Layout>
);

SignIn.subject = () => "New sign-in detected";
SignIn.message = () => "New sign-in detected.";
