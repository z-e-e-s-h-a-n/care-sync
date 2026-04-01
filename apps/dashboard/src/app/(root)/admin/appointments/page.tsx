"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { useAppointments } from "@/hooks/appointment";
import type {
  AppointmentQueryType,
  AppointmentResponse,
} from "@workspace/contracts/appointment";
import { Badge } from "@workspace/ui/components/badge";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import { formatDate } from "@workspace/shared/utils";

const columns: ColumnConfig<AppointmentResponse, AppointmentQueryType>[] = [
  {
    header: "Appointment",
    accessor: (appointment) => appointment.appointmentNumber,
    sortKey: "createdAt",
  },
  {
    header: "Doctor",
    accessor: (appointment) =>
      appointment.doctor?.user?.displayName ?? "Doctor",
  },
  {
    header: "Patient",
    accessor: (appointment) =>
      appointment.patient?.user?.displayName ?? "Patient",
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

const AdminAppointmentsPage = () => {
  return (
    <ListPage
      dataKey="appointments"
      canAdd
      canEdit={false}
      columns={columns}
      defaultSortBy="scheduledStartAt"
      defaultSearchBy="appointmentNumber"
      searchByOptions={[
        { label: "Appointment", value: "appointmentNumber" },
        { label: "Doctor", value: "doctorName" },
        { label: "Patient", value: "patientName" },
        { label: "Status", value: "status" },
      ]}
      useListHook={useAppointments}
      filterConfig={{
        key: "status",
        label: "Status",
        options: ["booked", "confirmed", "cancelled", "completed", "noShow"],
      }}
    />
  );
};

export default AdminAppointmentsPage;
