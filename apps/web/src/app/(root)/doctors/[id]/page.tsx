"use client";

import React from "react";

import AppointmentForm from "@/components/AppointmentForm";
import { useDoctor } from "@/hooks/healthcare";
import type { AppPageProps } from "@workspace/contracts";
import { Badge } from "@workspace/ui/components/badge";
import { getStatusVariant } from "@workspace/ui/lib/utils";
import { formatPrice } from "@workspace/shared/utils";
import StatCard from "@workspace/ui/shared/StatCard";

const DoctorDetailPage = ({ params }: AppPageProps) => {
  const { id } = React.use(params);
  const { data: doctor } = useDoctor(id);

  if (!doctor) {
    return <div className="section">Loading doctor profile...</div>;
  }

  return (
    <section className="section grid xl:grid-cols-[1fr_0.9fr] space-y-6">
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
          <StatCard
            label="Experience"
            value={
              doctor.yearsExperience ? `${doctor.yearsExperience}+ yrs` : "N/A"
            }
            labelVariant="title"
            valueInContent
          />
          <StatCard
            label="Consultation fee"
            value={
              doctor.consultationFee
                ? formatPrice(doctor.consultationFee)
                : "Not listed"
            }
            labelVariant="title"
            valueInContent
          />
          <StatCard
            label="Booking status"
            value={
              doctor.isAvailable
                ? "Available for booking"
                : "Currently unavailable"
            }
            labelVariant="title"
            valueInContent
            valueClassName="text-lg font-semibold"
          />
        </div>
      </div>

      <AppointmentForm doctorId={doctor.id} />
    </section>
  );
};

export default DoctorDetailPage;
