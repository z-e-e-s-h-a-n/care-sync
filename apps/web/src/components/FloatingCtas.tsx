"use client";

import { IconCalendar } from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import { useDialog } from "@workspace/ui/hooks/dialog";
import AppointmentForm from "./AppointmentForm";

export function FloatingCtas() {
  const { openDialog, closeDialog } = useDialog();

  return (
    <div className="fixed bottom-5 right-5 z-12 flex flex-col items-end gap-3">
      <Button
        variant="gradient"
        pulseDelay={4000}
        className="h-11 rounded-full px-4 shadow-lg"
        onClick={() => {
          openDialog({
            title: "New Appointment Form",
            content: <AppointmentForm onSuccess={closeDialog} />,
          });
        }}
      >
        <IconCalendar className="size-5" />
        <span>Book Appointment</span>
      </Button>
    </div>
  );
}
