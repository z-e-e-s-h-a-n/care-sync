"use client";

import type { DoctorProfileResponse } from "@workspace/contracts/doctor";
import type { PatientProfileResponse } from "@workspace/contracts/patient";

import { formatPatientFieldLabel, getPatientProfileCompletion } from "@/lib/patient";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

interface DoctorBookingChecklistProps {
  doctor: DoctorProfileResponse;
  patientProfile?: PatientProfileResponse | null;
}

const DoctorBookingChecklist = ({
  doctor,
  patientProfile,
}: DoctorBookingChecklistProps) => {
  const completion = getPatientProfileCompletion(patientProfile);

  const items = [
    {
      label: "Doctor is available for booking",
      ready: doctor.isAvailable,
    },
    {
      label: "Patient booking profile is complete",
      ready: completion.isReadyForBooking,
    },
    {
      label: "Consultation fee has been published",
      ready: Boolean(doctor.consultationFee),
    },
  ];

  return (
    <Card className="rounded-[1.75rem] border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Booking checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{item.label}</span>
            <Badge variant={item.ready ? "secondary" : "outline"}>
              {item.ready ? "Ready" : "Pending"}
            </Badge>
          </div>
        ))}

        {!completion.isReadyForBooking && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <p className="font-medium">Still needed on your patient profile</p>
            <p className="mt-1 text-sm">
              {completion.missingFields.map((field) => formatPatientFieldLabel(field)).join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorBookingChecklist;
