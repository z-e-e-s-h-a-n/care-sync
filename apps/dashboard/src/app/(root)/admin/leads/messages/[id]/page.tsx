"use client";

import { Calendar, Mail, MessageSquare, Phone, UserRound } from "lucide-react";

import type { AppPageProps } from "@workspace/contracts";
import type { ContactMessageResponse } from "@workspace/contracts/contact";
import { formatDate } from "@workspace/shared/utils";
import { Badge } from "@workspace/ui/components/badge";
import { GenericDetailsPage } from "@workspace/ui/shared/GenericDetailsPage";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import { useContactMessage } from "@/hooks/lead";
import React from "react";

const getContactName = (message: ContactMessageResponse) =>
  [message.firstName, message.lastName].filter(Boolean).join(" ");

const ContactMessageDetailsPage = ({ params }: AppPageProps) => {
  const { id } = React.use(params);

  return (
    <GenericDetailsPage<ContactMessageResponse>
      entityId={id}
      entityName="contact message"
      useQuery={useContactMessage}
      renderHeader={(message) => (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-background/80 p-3">
              <Mail className="size-6" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {getContactName(message) || "Contact Message"}
                </h2>
                <Badge variant={getStatusVariant(message.status)}>
                  {message.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{message.email}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {message.phone}
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Message ID</div>
            <div className="font-mono text-xs">{message.id}</div>
          </div>
        </div>
      )}
      sections={[
        {
          title: "Contact Details",
          columns: 2,
          fields: [
            {
              label: "Name",
              accessor: (message) => getContactName(message) || "—",
              icon: UserRound,
            },
            { label: "Email", accessor: "email", icon: Mail },
            { label: "Phone", accessor: "phone", icon: Phone },
            {
              label: "Subject",
              accessor: (message) => message.subject ?? "—",
              icon: MessageSquare,
            },
            {
              label: "Status",
              accessor: "status",
              icon: MessageSquare,
              render: (value) => (
                <Badge variant={getStatusVariant(value)}>{value}</Badge>
              ),
            },
          ],
        },
        {
          title: "Message & Follow-up",
          columns: 2,
          fields: [
            {
              label: "Message",
              accessor: (message) => message.message,
              className: "md:col-span-2",
            },
            {
              label: "Notes",
              accessor: (message) => message.notes ?? "—",
              className: "md:col-span-2",
            },
            {
              label: "Created At",
              accessor: "createdAt",
              icon: Calendar,
              format: (value) => formatDate(value, "datetime"),
            },
            {
              label: "Updated At",
              accessor: "updatedAt",
              icon: Calendar,
              format: (value) => formatDate(value, "datetime"),
            },
            {
              label: "Viewed At",
              accessor: (message) =>
                message.viewedAt ? formatDate(message.viewedAt, "datetime") : "—",
              icon: Calendar,
            },
            {
              label: "Replied At",
              accessor: (message) =>
                message.repliedAt
                  ? formatDate(message.repliedAt, "datetime")
                  : "—",
              icon: Calendar,
            },
          ],
        },
      ]}
    />
  );
};

export default ContactMessageDetailsPage;
