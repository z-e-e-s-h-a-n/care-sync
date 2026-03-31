import { Text } from "@react-email/components";
import { Greeting } from "./components/greeting";
import { Header } from "./components/header";
import { Layout } from "./components/layout";
import type {
  EmailTemplateComponent,
  EmailTemplateProps,
} from "../types/global";

const isUnsubscribed = (props: EmailTemplateProps<"newsletter">) => {
  return (
    !props.newsletterSubscriber.isActive ||
    Boolean(props.newsletterSubscriber.unsubscribedAt)
  );
};

export const Newsletter: EmailTemplateComponent<"newsletter"> = (props) => {
  if (isUnsubscribed(props)) {
    return (
      <Layout previewText="You have unsubscribed">
        <Header title="Unsubscription Successful" />
        <Greeting name={props.newsletterSubscriber.name} />
        <Text className="text-base text-gray-900">
          You have successfully unsubscribed from our newsletter. You will no
          longer receive emails from us.
        </Text>
      </Layout>
    );
  }

  return (
    <Layout previewText="Newsletter subscription confirmed">
      <Header title="Subscription Confirmed" />
      <Greeting name={props.newsletterSubscriber.name} />
      <Text className="text-base text-gray-900">
        Thank you for subscribing to our newsletter. You will now receive the
        latest updates and offers.
      </Text>
    </Layout>
  );
};

Newsletter.subject = (props) =>
  isUnsubscribed(props)
    ? "Unsubscription successful"
    : "Newsletter subscription confirmed";
Newsletter.message = (props) =>
  isUnsubscribed(props)
    ? "You have successfully unsubscribed from our newsletter."
    : "Thank you for subscribing to our newsletter.";
