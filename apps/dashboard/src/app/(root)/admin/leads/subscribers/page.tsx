"use client";

import { Badge } from "@workspace/ui/components/badge";
import type {
  NewsletterSubscriberQueryType,
  NewsletterSubscriberResponse,
} from "@workspace/contracts/lead";

import { useNewsletterSubscribers } from "@/hooks/lead";
import ListPage from "@/components/shared/ListPage";
import DateWrapper from "@/components/shared/DateWrapper";
import type { ColumnConfig } from "@/components/shared/GenericTable";
import type { SearchByOption } from "@/components/shared/SearchToolbar";

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
      <Badge variant="secondary">
        {subscriber.isActive ? "active" : "inactive"}
      </Badge>
    ),
  },
  {
    header: "Subscribed",
    accessor: (subscriber) => <DateWrapper date={subscriber.subscribedAt} />,
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
