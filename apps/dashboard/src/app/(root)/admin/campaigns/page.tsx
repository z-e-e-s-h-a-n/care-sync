"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { useCampaigns } from "@/hooks/healthcare";
import type {
  CampaignQueryType,
  NotificationCampaignResponse,
} from "@workspace/contracts/campaign";

const columns: ColumnConfig<NotificationCampaignResponse, CampaignQueryType>[] =
  [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Audience",
      accessor: "audience",
    },
    {
      header: "Recipients",
      accessor: (campaign) => campaign.recipients?.length ?? 0,
    },
    {
      header: "Status",
      accessor: "status",
      sortKey: "status",
    },
  ];

const CampaignsPage = () => {
  return (
    <ListPage
      dataKey="campaigns"
      canEdit={false}
      columns={columns}
      defaultSortBy="createdAt"
      defaultSearchBy="title"
      searchByOptions={[
        { label: "Title", value: "title" },
        { label: "Status", value: "status" },
        { label: "Audience", value: "audience" },
      ]}
      useListHook={useCampaigns}
      filterConfig={{
        key: "status",
        label: "Status",
        options: ["draft", "scheduled", "sending", "sent", "failed"],
      }}
    />
  );
};

export default CampaignsPage;
