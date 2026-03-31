"use client";

import { Mail } from "lucide-react";

import type { NewsletterSubscriberResponse } from "@workspace/contracts/newsletter";
import { GenericDetailsPage } from "@workspace/ui/shared/GenericDetailsPage";
import { useNewsletterSubscriber } from "@/hooks/lead";
import type { AppPageProps } from "@workspace/contracts";
import React from "react";

const NewsletterSubscriberDetailsPage = ({ params }: AppPageProps) => {
  const { id } = React.use(params);

  return (
    <GenericDetailsPage<NewsletterSubscriberResponse>
      entityId={id}
      entityName="newsletter subscriber"
      canEdit={false}
      useQuery={useNewsletterSubscriber}
      renderHeader={(subscriber) => (
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-background/80 p-3">
            <Mail className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{subscriber.name}</h2>
            <p className="text-muted-foreground">{subscriber.email}</p>
          </div>
        </div>
      )}
      sections={[
        {
          title: "Subscriber Details",
          columns: 2,
          fields: [
            { label: "Name", accessor: "name" },
            { label: "Email", accessor: "email" },
            {
              label: "Status",
              accessor: (subscriber) =>
                subscriber.isActive ? "active" : "inactive",
            },
            { label: "Created At", accessor: "createdAt" },
            { label: "Subscribed At", accessor: "subscribedAt" },
            {
              label: "Unsubscribed At",
              accessor: (subscriber) => subscriber.unsubscribedAt ?? "—",
            },
          ],
        },
      ]}
    />
  );
};

export default NewsletterSubscriberDetailsPage;
