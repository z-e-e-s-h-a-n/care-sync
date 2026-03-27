"use client";
import DoctorBookingChecklist from "@/components/DoctorBookingChecklist";
import { useDoctor, useMyPatientProfile } from "@/hooks/healthcare";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import type { AppPageProps } from "@workspace/contracts";
import React from "react";
import { formatPrice } from "@workspace/shared/utils";
import AppointmentForm from "@/components/AppointmentForm";

const DoctorDetailPage = ({ params }: AppPageProps) => {
  const { id } = React.use(params);
  const { data: doctor } = useDoctor(id);
  const { data: profileData } = useMyPatientProfile();

  if (!doctor) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground sm:px-6 lg:px-8">
        Loading doctor profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="capitalize">
                {doctor.verificationStatus}
              </Badge>
              <Badge variant="secondary">
                {doctor.branch?.name ?? "Independent practice"}
              </Badge>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">
                {doctor.user?.displayName ?? doctor.slug ?? doctor.id}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {doctor.specialty ?? "Care provider"}
              </p>
            </div>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              {doctor.bio ??
                "Provider biography will appear here once published by the care team."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-[1.75rem] border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Experience</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {doctor.yearsExperience
                  ? `${doctor.yearsExperience}+ yrs`
                  : "N/A"}
              </CardContent>
            </Card>
            <Card className="rounded-[1.75rem] border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Consultation fee</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {doctor.consultationFee
                  ? formatPrice(doctor.consultationFee)
                  : "Not listed"}
              </CardContent>
            </Card>
            <Card className="rounded-[1.75rem] border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Booking status</CardTitle>
              </CardHeader>
              <CardContent className="text-lg font-semibold">
                {doctor.isAvailable
                  ? "Available for booking"
                  : "Currently unavailable"}
              </CardContent>
            </Card>
          </div>

          <DoctorBookingChecklist
            doctor={doctor}
            patientProfile={profileData}
          />
        </div>

        <AppointmentForm doctorId={doctor.id} />
      </div>
    </div>
  );
};

export default DoctorDetailPage;
