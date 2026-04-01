"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { useAppointments } from "@/hooks/appointment";
import type {
  AppointmentQueryType,
  AppointmentResponse,
} from "@workspace/contracts/appointment";
import { formatDate } from "@workspace/shared/utils";
import UserAvatar from "@workspace/ui/shared/UserAvatar";
import { Badge } from "@workspace/ui/components/badge";
import { getStatusVariant } from "@workspace/ui/lib/utils";

const columns: ColumnConfig<AppointmentResponse, AppointmentQueryType>[] = [
  {
    header: "Patient",
    accessor: (appointment) => (
      <div className="flex items-center gap-4 min-w-50">
        <UserAvatar user={appointment.patient.user} />
        <p className="font-semibold">{appointment.patient.user.displayName}</p>
      </div>
    ),
    wrapperCn: "space-y-4",
  },
  {
    header: "Channel",
    accessor: (appointment) => (
      <Badge variant="info">{appointment.channel}</Badge>
    ),
  },
  {
    header: "Scheduled",
    accessor: (appointment) => formatDate(appointment.scheduledStartAt),
    sortKey: "scheduledStartAt",
  },
  {
    header: "Status",
    accessor: (appointment) => (
      <Badge variant={getStatusVariant(appointment.status)}>
        {appointment.status}
      </Badge>
    ),
    sortKey: "status",
  },
];

export default function DoctorAppointmentsPage() {
  return (
    <ListPage<AppointmentResponse, AppointmentQueryType, "appointments">
      dataKey="appointments"
      canAdd
      canEdit={false}
      columns={columns}
      defaultSortBy="scheduledStartAt"
      defaultSearchBy="patientName"
      searchByOptions={[
        { label: "Patient", value: "patientName" },
        { label: "Status", value: "status" },
        { label: "Doctor", value: "doctorName" },
        { label: "Appointment #", value: "appointmentNumber" },
      ]}
      useListHook={useAppointments}
      filterConfig={{
        key: "status",
        label: "Status",
        options: ["booked", "confirmed", "completed", "cancelled", "noShow"],
      }}
    />
  );
}
