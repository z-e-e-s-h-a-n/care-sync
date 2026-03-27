"use client";
import { useDoctor } from "@/hooks/healthcare";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import type { AppPageProps } from "@workspace/contracts";
import React from "react";
import { formatPrice } from "@workspace/shared/utils";
import AppointmentForm from "@/components/AppointmentForm";

const DoctorDetailPage = ({ params }: AppPageProps) => {
  const { id } = React.use(params);
  const { data: doctor } = useDoctor(id);

  if (!doctor) {
    return <div className="section">Loading doctor profile...</div>;
  }

  return (
    <section className="section grid xl:grid-cols-[1fr_0.9fr]">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant={getStatusVariant(doctor.verificationStatus)}
              className="capitalize"
            >
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Experience</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {doctor.yearsExperience
                ? `${doctor.yearsExperience}+ yrs`
                : "N/A"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consultation fee</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {doctor.consultationFee
                ? formatPrice(doctor.consultationFee)
                : "Not listed"}
            </CardContent>
          </Card>
          <Card>
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
      </div>

      <AppointmentForm
        doctorId={doctor.id}
        className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm"
      />
    </section>
  );
};

export default DoctorDetailPage;
