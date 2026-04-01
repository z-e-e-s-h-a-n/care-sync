"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { useAppointments } from "@/hooks/appointment";
import type {
  AppointmentQueryType,
  AppointmentResponse,
} from "@workspace/contracts/appointment";
import { formatDate } from "@workspace/shared/utils";

const columns: ColumnConfig<AppointmentResponse, AppointmentQueryType>[] = [
  {
    header: "Patient",
    accessor: (appointment) => appointment.patient?.user.displayName,
  },
  { header: "Channel", accessor: "channel" },
  {
    header: "Scheduled",
    accessor: (appointment) => formatDate(appointment.scheduledStartAt),
    sortKey: "scheduledStartAt",
  },
  { header: "Status", accessor: "status", sortKey: "status" },
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
