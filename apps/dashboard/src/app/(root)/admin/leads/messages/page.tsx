"use client";

import { Badge } from "@workspace/ui/components/badge";
import type {
  ContactMessageQueryType,
  ContactMessageResponse,
} from "@workspace/contracts/contact";
import { ContactMessageStatusEnum } from "@workspace/contracts";
import { formatDate } from "@workspace/shared/utils";
import { getStatusVariant } from "@workspace/ui/lib/utils";

import { useContactMessages } from "@/hooks/lead";
import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import type { SearchByOption } from "@workspace/ui/shared/SearchToolbar";

const getContactName = (message: ContactMessageResponse) =>
  [message.firstName, message.lastName].filter(Boolean).join(" ");

const contactColumns: ColumnConfig<
  ContactMessageResponse,
  ContactMessageQueryType
>[] = [
  {
    header: "Name",
    accessor: (message) => getContactName(message) || "—",
  },
  {
    header: "Email",
    accessor: "email",
    sortKey: "email",
  },
  {
    header: "Phone",
    accessor: "phone",
    sortKey: "phone",
  },
  {
    header: "Subject",
    accessor: (message) => message.subject ?? "—",
    sortKey: "subject",
  },
  {
    header: "Status",
    accessor: (message) => (
      <Badge variant={getStatusVariant(message.status)}>{message.status}</Badge>
    ),
  },
  {
    header: "Received",
    accessor: (message) => formatDate(message.createdAt),
    sortKey: "createdAt",
  },
];

const contactSearchOptions: SearchByOption<ContactMessageQueryType>[] = [
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "subject", label: "Subject" },
];

const ContactMessagesPage = () => {
  return (
    <ListPage
      dataKey="messages"
      canAdd={false}
      columns={contactColumns}
      searchByOptions={contactSearchOptions}
      useListHook={useContactMessages}
      defaultSortBy="createdAt"
      defaultSearchBy="name"
      filterConfig={{
        key: "status",
        label: "Status",
        options: ContactMessageStatusEnum.options,
      }}
    />
  );
};

export default ContactMessagesPage;
