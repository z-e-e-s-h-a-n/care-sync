"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { useAppointments } from "@/hooks/healthcare";
import type {
  AppointmentQueryType,
  AppointmentResponse,
} from "@workspace/contracts/appointment";

const formatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const columns: ColumnConfig<AppointmentResponse, AppointmentQueryType>[] = [
  {
    header: "Patient",
    accessor: (appointment) =>
      appointment.patient?.user?.displayName ?? appointment.patientId,
  },
  { header: "Channel", accessor: "channel" },
  {
    header: "Scheduled",
    accessor: (appointment) =>
      formatter.format(new Date(appointment.scheduledStartAt)),
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
