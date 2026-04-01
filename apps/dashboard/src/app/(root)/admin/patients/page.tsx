"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { usePatients } from "@/hooks/patient";
import type {
  PatientProfileResponse,
  PatientQueryType,
} from "@workspace/contracts/patient";
import UserAvatar from "@workspace/ui/shared/UserAvatar";
import { Badge } from "@workspace/ui/components/badge";

const columns: ColumnConfig<PatientProfileResponse, PatientQueryType>[] = [
  {
    header: "Patient",
    accessor: (patient) => (
      <div className="flex items-center gap-4 min-w-50">
        <UserAvatar user={patient.user} />
        <p className="font-semibold">{patient.user?.displayName}</p>
      </div>
    ),
    sortKey: "displayName",
  },
  {
    header: "Email",
    accessor: (patient) => patient.user?.email ?? "N/A",
    sortKey: "email",
  },
  {
    header: "Phone",
    accessor: (patient) => patient.user?.phone ?? "N/A",
  },
  {
    header: "Gender",
    accessor: (patient) => <Badge>{patient.gender ?? "N/A"}</Badge>,
  },
];

const PatientsPage = () => {
  return (
    <ListPage
      dataKey="patients"
      canAdd
      canEdit
      columns={columns}
      defaultSortBy="createdAt"
      defaultSearchBy="displayName"
      searchByOptions={[
        { label: "Patient", value: "displayName" },
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
      ]}
      useListHook={usePatients}
    />
  );
};

export default PatientsPage;
