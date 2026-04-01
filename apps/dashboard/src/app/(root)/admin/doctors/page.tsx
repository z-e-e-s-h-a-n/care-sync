"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { useDoctors } from "@/hooks/doctor";
import type {
  DoctorProfileResponse,
  DoctorQueryType,
} from "@workspace/contracts/doctor";
import { Badge } from "@workspace/ui/components/badge";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const columns: ColumnConfig<DoctorProfileResponse, DoctorQueryType>[] = [
  {
    header: "Doctor",
    accessor: (doctor) => doctor.user?.displayName ?? doctor.slug ?? doctor.id,
    sortKey: "displayName",
  },
  {
    header: "Specialty",
    accessor: (doctor) => doctor.specialty ?? "Not set",
    sortKey: "specialty",
  },
  {
    header: "Branch",
    accessor: (doctor) => doctor.branch?.name ?? "Unassigned",
  },
  {
    header: "Status",
    accessor: (doctor) => (
      <Badge variant={getStatusVariant(doctor.isAvailable ? "active" : "closed")}>
        {doctor.isAvailable ? "available" : "unavailable"}
      </Badge>
    ),
    sortKey: "verificationStatus",
  },
];

const DoctorsPage = () => {
  return (
    <ListPage
      dataKey="doctors"
      canEdit
      columns={columns}
      defaultSortBy="displayName"
      defaultSearchBy="displayName"
      searchByOptions={[
        { label: "Doctor", value: "displayName" },
        { label: "Specialty", value: "specialty" },
        { label: "Slug", value: "slug" },
        { label: "License number", value: "licenseNumber" },
      ]}
      useListHook={useDoctors}
      filterConfig={{
        key: "verificationStatus",
        label: "Verification",
        options: ["pending", "verified", "rejected"],
      }}
    />
  );
};

export default DoctorsPage;
