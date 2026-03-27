"use client";

import AppointmentCard from "@/components/AppointmentCard";
import { useAppointments, useMyPatientProfile } from "@/hooks/healthcare";

const AppointmentsPage = () => {
  const { data: patientProfile } = useMyPatientProfile();
  const { data } = useAppointments({
    page: 1,
    limit: 20,
    sortBy: "scheduledStartAt",
    sortOrder: "asc",
    searchBy: "doctorName",
    patientId: patientProfile?.id,
  });

  const appointments = data?.appointments ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
          Appointments
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Your care schedule
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Review upcoming appointments, revisit completed visits, and open the
          related conversation with your provider.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>

      {!appointments.length && (
        <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
          No appointments yet. Start by browsing doctors and booking your first
          consultation.
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
