import { Text } from "@react-email/components";
import { Greeting } from "./components/greeting";
import { Header } from "./components/header";
import { Layout } from "./components/layout";
import type { EmailTemplateComponent, EmailTemplateProps } from "../types/global";

const titleMap: Record<
  | "appointmentStatus"
  | "appointmentReminder"
  | "newChatMessage"
  | "paymentStatus"
  | "refundStatus"
  | "orderStatus"
  | "campaign",
  string
> = {
  appointmentStatus: "Appointment update",
  appointmentReminder: "Appointment reminder",
  newChatMessage: "New chat message",
  paymentStatus: "Payment update",
  refundStatus: "Refund update",
  orderStatus: "Order update",
  campaign: "Important update",
};

const renderEvent = (
  purpose:
    | "appointmentStatus"
    | "appointmentReminder"
    | "newChatMessage"
    | "paymentStatus"
    | "refundStatus"
    | "orderStatus"
    | "campaign",
): EmailTemplateComponent<typeof purpose> => {
  const Component: EmailTemplateComponent<typeof purpose> = ({ user, message }) => (
    <Layout previewText={titleMap[purpose]}>
      <Header title={titleMap[purpose]} />
      <Greeting name={user.displayName} />
      <Text className="text-base text-gray-900">{message}</Text>
    </Layout>
  );

  Component.subject = () => titleMap[purpose];
  Component.message = (props: EmailTemplateProps<typeof purpose>) => props.message;

  return Component;
};

export const AppointmentStatus = renderEvent("appointmentStatus");
export const AppointmentReminder = renderEvent("appointmentReminder");
export const NewChatMessage = renderEvent("newChatMessage");
export const PaymentStatus = renderEvent("paymentStatus");
export const RefundStatus = renderEvent("refundStatus");
export const OrderStatus = renderEvent("orderStatus");
export const Campaign = renderEvent("campaign");
