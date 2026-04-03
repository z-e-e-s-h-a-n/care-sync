"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import Link from "next/link";
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
import { Label } from "@workspace/ui/components/label";
import { Form, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { DatePickerField } from "@workspace/ui/components/date-field";
import { ComboboxField } from "@workspace/ui/components/combobox-field";
import { Field } from "@workspace/ui/components/field";
import { IconClock } from "@tabler/icons-react";
import useUser from "@workspace/ui/hooks/use-user";
import { InfoNotice } from "@workspace/ui/shared/InfoNotice";

interface AppointmentFormProps {
  doctorId?: string;
  onSuccess?: () => void;
}

type AppointmentFormValues = CreateAppointmentType & {
  selectedDate?: string;
};

const AppointmentForm = ({ doctorId, onSuccess }: AppointmentFormProps) => {
  const router = useRouter();
  const { data: patientProfile } = useMyPatientProfile();
  const { currentUser } = useUser();
  const { createAppointment, isPending } = useCreateAppointment();

  const defaultValues = useMemo<Partial<AppointmentFormValues>>(
    () => ({
      doctorId,
      patientId: patientProfile?.id,
      // branchId: "",
      selectedDate: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      patientNotes: "",
      bookingSource: "app",
      channel: "inPerson",
    }),
    [doctorId, patientProfile?.id],
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
          `/patient/appointments/success/?appointmentId=${appointment.data.id}`,
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

  const from = useMemo(
    () => addDays(selectedDate!, 0)?.toISOString(),
    [selectedDate],
  );
  const to = useMemo(
    () => addDays(selectedDate!, 6)?.toISOString(),
    [selectedDate],
  );

  const slotsQuery = useDoctorSlots(selectedDoctorId, from, to);

  const slots = slotsQuery.data?.slice(0, 8) ?? [];

  return (
    <Form form={form}>
      <FormSection title="New Appointment" className="md:grid-cols-1">
        {!currentUser ? (
          <InfoNotice
            variant="info"
            message={
              <span>
                Sign in and complete your profile before booking an appointment.
                <Link href="/auth/sign-in" className="ml-1 font-semibold underline underline-offset-4">
                  Sign in
                </Link>
                .
              </span>
            }
          />
        ) : !patientProfile ? (
            <InfoNotice
              variant="warning"
              message="Complete your profile to continue booking an appointment."
            />
          ) : null}

        <ComboboxField
          form={form}
          name="doctorId"
          label="Doctor"
          placeholder="Select Doctor"
          disabled={!!doctorId}
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
                    {formatDate(slot.startAt, { mode: "time" })}
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
      </FormSection>
    </Form>
  );
};

export default AppointmentForm;
