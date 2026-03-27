"use client";

import ListPage from "@workspace/ui/shared/ListPage";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import { useAppointments } from "@/hooks/healthcare";
import type {
  AppointmentQueryType,
  AppointmentResponse,
} from "@workspace/contracts/appointment";
import { Badge, type BadgeVariantProps } from "@workspace/ui/components/badge";
import type { AppointmentStatus } from "@workspace/db";

const formatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const BadgeVariantMap: Record<AppointmentStatus, BadgeVariantProps["variant"]> =
  {
    booked: "default",
    cancelled: "destructive",
    completed: "secondary",
    confirmed: "secondary",
    noShow: "destructive",
  };

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
    accessor: (appointment) =>
      formatter.format(new Date(appointment.scheduledStartAt)),
    sortKey: "scheduledStartAt",
  },
  {
    header: "Status",
    accessor: (appointment) => (
      <Badge variant={BadgeVariantMap[appointment.status]}>
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
