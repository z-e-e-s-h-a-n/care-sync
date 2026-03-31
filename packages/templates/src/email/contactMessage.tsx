import { Text } from "@react-email/components";
import { Greeting } from "./components/greeting";
import { Header } from "./components/header";
import { Layout } from "./components/layout";
import type {
  EmailTemplateComponent,
  EmailTemplateProps,
} from "../types/global";

const isReplied = (props: EmailTemplateProps<"contactMessage">) => {
  return props.contactMessage.status === "replied";
};

export const ContactMessage: EmailTemplateComponent<"contactMessage"> = (
  props,
) => {
  if (isReplied(props)) {
    return (
      <Layout previewText="Your message has been replied">
        <Header
          title="Message Replied"
          subtitle={props.contactMessage.subject || ""}
        />
        <Greeting name={props.contactMessage.firstName} />
        <Text className="text-base text-gray-900">
          Your message titled "{props.contactMessage.subject}" has been replied.
          Please check your inbox or contact our support team if you need any
          further help.
        </Text>
        {props.contactMessage.notes && (
          <Text className="text-base text-gray-900">
            Reply Notes: {props.contactMessage.notes}
          </Text>
        )}
      </Layout>
    );
  }

  return (
    <Layout previewText="New contact message received">
      <Header
        title="New Contact Message"
        subtitle={props.contactMessage.subject || ""}
      />
      <Greeting name={props.contactMessage.firstName} />
      <Text className="text-base text-gray-900">
        We have received your message titled "{props.contactMessage.subject}".
        Our team will get back to you shortly.
      </Text>
    </Layout>
  );
};

ContactMessage.subject = (props) =>
  isReplied(props)
    ? "Your message has been replied"
    : "New contact message received";
ContactMessage.message = (props) =>
  isReplied(props)
    ? "Your message has been replied."
    : "We have received your message.";
