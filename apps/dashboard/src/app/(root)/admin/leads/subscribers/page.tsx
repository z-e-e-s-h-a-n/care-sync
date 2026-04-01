"use client";

import { Badge } from "@workspace/ui/components/badge";
import type {
  NewsletterSubscriberQueryType,
  NewsletterSubscriberResponse,
} from "@workspace/contracts/newsletter";

import { useNewsletterSubscribers } from "@/hooks/lead";
import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import type { SearchByOption } from "@workspace/ui/shared/SearchToolbar";
import { formatDate } from "@workspace/shared/utils";

const newsletterColumns: ColumnConfig<
  NewsletterSubscriberResponse,
  NewsletterSubscriberQueryType
>[] = [
  {
    header: "Name",
    accessor: "name",
    sortKey: "name",
  },
  {
    header: "Email",
    accessor: "email",
    sortKey: "email",
  },
  {
    header: "Status",
    accessor: (subscriber) => (
      <Badge variant={subscriber.isActive ? "success" : "destructive"}>
        {subscriber.isActive ? "active" : "inactive"}
      </Badge>
    ),
  },
  {
    header: "Subscribed",
    accessor: (subscriber) => formatDate(subscriber.subscribedAt),
    sortKey: "subscribedAt",
  },
];

const newsletterSearchOptions: SearchByOption<NewsletterSubscriberQueryType>[] =
  [
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
  ];

const NewsletterSubscribersPage = () => {
  return (
    <ListPage
      dataKey="subscribers"
      canAdd={false}
      canEdit={false}
      columns={newsletterColumns}
      searchByOptions={newsletterSearchOptions}
      useListHook={useNewsletterSubscribers}
      defaultSortBy="createdAt"
      defaultSearchBy="name"
    />
  );
};

export default NewsletterSubscribersPage;
