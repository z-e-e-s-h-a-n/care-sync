"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { useCampaigns } from "@/hooks/campaign";
import type {
  CampaignQueryType,
  NotificationCampaignResponse,
} from "@workspace/contracts/campaign";
import { Badge } from "@workspace/ui/components/badge";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const columns: ColumnConfig<NotificationCampaignResponse, CampaignQueryType>[] =
  [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Audience",
      accessor: (campaign) => <Badge>{campaign.audience}</Badge>,
    },
    {
      header: "Recipients",
      accessor: (campaign) => campaign.recipients?.length ?? 0,
    },
    {
      header: "Status",
      accessor: (campaign) => (
        <Badge variant={getStatusVariant(campaign.status)}>
          {campaign.status}
        </Badge>
      ),
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
