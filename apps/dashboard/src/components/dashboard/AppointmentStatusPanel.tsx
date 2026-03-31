/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import type { AppointmentStatus } from "@workspace/contracts";
import type { AppointmentResponse } from "@workspace/contracts/appointment";
import SectionCard from "@workspace/ui/shared/SectionCard";

import { useUpdateAppointmentStatus } from "@/hooks/healthcare";

interface AppointmentStatusPanelProps {
  appointment: AppointmentResponse;
  variant?: "card" | "toolbar";
}

const dashboardActions: AppointmentStatus[] = [
  "confirmed",
  "completed",
  "cancelled",
  "noShow",
];

const formatStatusLabel = (value: string) =>
  value.replace(/([A-Z])/g, " $1").trim();

const AppointmentStatusPanel = ({
  appointment,
  variant = "card",
}: AppointmentStatusPanelProps) => {
  const { updateStatus, isPending } = useUpdateAppointmentStatus(
    appointment.id,
  );

  const setStatus = async (status: AppointmentStatus) => {
    try {
      await updateStatus({
        status,
        cancellationReason:
          status === "cancelled"
            ? "Updated from dashboard workflow."
            : undefined,
        cancellationSource: status === "cancelled" ? "admin" : undefined,
        adminNotes: appointment.adminNotes,
      });
      toast.success(`Appointment marked as ${status}.`);
    } catch (error: any) {
      toast.error("Failed to update appointment", {
        description: error?.message,
      });
    }
  };

  const actions = (
    <div className="flex flex-wrap gap-2">
      {dashboardActions.map((status) => (
        <Button
          key={status}
          type="button"
          size="sm"
          variant={appointment.status === status ? "default" : "outline"}
          onClick={() => setStatus(status)}
          disabled={isPending}
          className="capitalize"
        >
          {formatStatusLabel(status)}
        </Button>
      ))}
    </div>
  );

  if (variant === "toolbar") {
    return actions;
  }

  return (
    <SectionCard title="Status actions" className="shadow-sm">
      {actions}
    </SectionCard>
  );
};

export default AppointmentStatusPanel;
