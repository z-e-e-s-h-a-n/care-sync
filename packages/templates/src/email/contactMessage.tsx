import { Text } from "@react-email/components";
import type {
  EmailTemplateComponent,
  EmailTemplateProps,
} from "../types/global";
import { Greeting } from "./components/greeting";
import { Header } from "./components/header";
import { Layout } from "./components/layout";

const isReplied = (props: EmailTemplateProps<"contactMessage">) =>
  props.contactMessage.status === "replied";

export const ContactMessage: EmailTemplateComponent<"contactMessage"> = (
  props,
) => {
  if (isReplied(props)) {
    return (
      <Layout previewText="Your MI MedCare message has been answered">
        <Header title="Message Replied" />
        <Greeting name={props.contactMessage.fullName} />
        <Text className="text-base text-gray-900">
          Our team has replied to your message about{" "}
        </Text>
        {props.contactMessage.notes && (
          <Text className="text-base text-gray-900">
            Response details: {props.contactMessage.notes}
          </Text>
        )}
      </Layout>
    );
  }

  return (
    <Layout previewText="New contact message received">
      <Header title="Message Received" />
      <Greeting name={props.contactMessage.fullName} />
      <Text className="text-base text-gray-900">
        We received your message and our medical billing team will review it
        shortly.
      </Text>
      <Text className="text-base text-gray-900">
        If your note is related to claims, eligibility, denials, payment
        posting, or prior authorization support, we will route it to the right
        specialist.
      </Text>
    </Layout>
  );
};

ContactMessage.subject = (props) =>
  isReplied(props)
    ? "Your message has been answered"
    : "We received your message";

ContactMessage.message = (props) =>
  isReplied(props)
    ? "Our team has responded to your message."
    : "We received your message and will respond shortly.";
