"use client";

import type {
  TrafficSourceQueryType,
  TrafficSourceResponse,
} from "@workspace/contracts/traffic";

import { useTrafficSources } from "@/hooks/traffic";
import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import type { SearchByOption } from "@workspace/ui/shared/SearchToolbar";
import { formatDate } from "@workspace/shared/utils";

const trafficColumns: ColumnConfig<
  TrafficSourceResponse,
  TrafficSourceQueryType
>[] = [
  {
    header: "Source",
    accessor: (source) => source.utmSource ?? "—",
    sortKey: "createdAt",
  },
  {
    header: "Medium",
    accessor: (source) => source.utmMedium ?? "—",
  },
  {
    header: "Campaign",
    accessor: (source) => source.utmCampaign ?? "—",
  },
  {
    header: "Referrer",
    accessor: (source) => source.referrer ?? "—",
  },
  {
    header: "Landing Page",
    accessor: (source) => source.landingPage ?? "—",
  },
  {
    header: "Created",
    accessor: (source) => formatDate(source.createdAt),
    sortKey: "createdAt",
  },
];

const trafficSearchOptions: SearchByOption<TrafficSourceQueryType>[] = [
  { value: "utmSource", label: "UTM Source" },
  { value: "utmMedium", label: "UTM Medium" },
  { value: "utmCampaign", label: "UTM Campaign" },
  { value: "referrer", label: "Referrer" },
  { value: "landingPage", label: "Landing Page" },
];

const TrafficSourcesPage = () => {
  return (
    <ListPage
      dataKey={"sources"}
      entityType="traffic-sources"
      canAdd={false}
      canEdit={false}
      columns={trafficColumns}
      searchByOptions={trafficSearchOptions}
      useListHook={useTrafficSources}
      defaultSortBy="createdAt"
      defaultSearchBy="utmSource"
    />
  );
};

export default TrafficSourcesPage;
