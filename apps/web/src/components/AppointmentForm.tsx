"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";

import {
  useCreateAppointment,
  useDoctors,
  useDoctorSlots,
  useMyPatientProfile,
} from "@/hooks/healthcare";
import { addDays, formatDate } from "@workspace/shared/utils";
import {
  createAppointmentSchema,
  type CreateAppointmentType,
} from "@workspace/contracts/appointment";

import { Button } from "@workspace/ui/components/button";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { Form } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { DatePickerField } from "@workspace/ui/components/date-field";
import { ComboboxField } from "@workspace/ui/components/combobox-field";
import { Field } from "@workspace/ui/components/field";
import { IconClock } from "@tabler/icons-react";

interface AppointmentFormProps {
  doctorId?: string;
  onSuccess?: () => void;
  className?: string;
}

type AppointmentFormValues = CreateAppointmentType & {
  selectedDate?: string;
};

const AppointmentForm = ({
  doctorId,
  onSuccess,
  className,
}: AppointmentFormProps) => {
  const router = useRouter();
  const { data: patientProfile } = useMyPatientProfile();
  const { createAppointment, isPending } = useCreateAppointment();

  const defaultValues = useMemo<Partial<AppointmentFormValues>>(
    () => ({
      doctorId,
      patientId: patientProfile?.id,
      branchId: patientProfile?.preferredBranchId,
      selectedDate: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      patientNotes: "",
      bookingSource: "app",
      channel: "inPerson",
    }),
    [doctorId, patientProfile?.id, patientProfile?.preferredBranchId],
  );

  const form = useForm({
    defaultValues: defaultValues as AppointmentFormValues,
    validators: {
      onSubmit: createAppointmentSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const appointment = await createAppointment(value);
        toast.success("Appointment booked successfully.");
        onSuccess?.();
        router.push(
          `/user/appointments/success/?appointmentId=${appointment.data.id}`,
        );
      } catch (error: any) {
        toast.error("Booking failed", {
          description: error?.message ?? "Something went wrong.",
        });
      }
    },
  });

  const { selectedDate, selectedDoctorId, startAt } = useStore(
    form.store,
    (state) => ({
      selectedDate: state.values.selectedDate,
      selectedDoctorId: state.values.doctorId,
      startAt: state.values.scheduledStartAt,
    }),
  );

  const from = useMemo(() => addDays(selectedDate, 0), [selectedDate]);
  const to = useMemo(() => addDays(selectedDate, 6), [selectedDate]);

  const slotsQuery = useDoctorSlots(selectedDoctorId, from, to);

  const slots = slotsQuery.data?.slice(0, 8) ?? [];

  return (
    <Form form={form}>
      <div className={className}>
        <CardHeader>
          <CardTitle>New Appointment</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          {!patientProfile && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Complete your date of birth, gender, and emergency contact details
              before confirming a booking.
            </div>
          )}

          <ComboboxField
            form={form}
            name="doctorId"
            label="Doctor"
            placeholder="Select Doctor"
            dataKey="doctors"
            useQuery={useDoctors as any}
            getOption={(doctor: any) => ({
              key: doctor.id,
              label: doctor.user.displayName,
              value: doctor.id,
              content: <div>{doctor.user.displayName}</div>,
            })}
          />

          <DatePickerField
            form={form}
            name="selectedDate"
            label="Expected appointment date"
            disableBefore={new Date().toISOString()}
          />

          <Field className="space-y-3">
            <Label>Choose a time slot</Label>

            <div className="grid gap-4 grid-cols-2">
              {slots.map((slot) => {
                const isActive = startAt === slot.startAt;

                return (
                  <Button
                    key={slot.startAt}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => {
                      form.setFieldValue("scheduledStartAt", slot.startAt);
                      form.setFieldValue("scheduledEndAt", slot.endAt);
                    }}
                  >
                    <IconClock />
                    <p className="font-medium">
                      {formatDate(slot.startAt, "time")}
                    </p>
                  </Button>
                );
              })}
            </div>

            {!slots.length && (
              <p className="text-sm text-muted-foreground">
                No slots available in the selected window.
              </p>
            )}
          </Field>

          <InputField
            form={form}
            name="patientNotes"
            type="textarea"
            label="Notes for the doctor"
            rows={4}
            placeholder="Symptoms, reason for visit, or anything the provider should know."
          />

          <Button
            className="w-full"
            type="submit"
            disabled={isPending || !startAt || !patientProfile}
          >
            {isPending ? "Booking..." : "Submit Appointment"}
          </Button>
        </CardContent>
      </div>
    </Form>
  );
};

export default AppointmentForm;
