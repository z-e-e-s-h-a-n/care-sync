"use client";

import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { AppointmentChannelEnum } from "@workspace/contracts";
import {
  createAppointmentSchema,
  type CreateAppointmentType,
} from "@workspace/contracts/appointment";
import { Button } from "@workspace/ui/components/button";
import { ComboboxField } from "@workspace/ui/components/combobox-field";
import { DatePickerField } from "@workspace/ui/components/date-field";
import { Form, FormField, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import CUFormSkeleton from "@workspace/ui/skeleton/CUFormSkeleton";
import { useCreateAppointment } from "@/hooks/appointment";
import { useDoctors, useMyDoctorProfile } from "@/hooks/doctor";
import { usePatients } from "@/hooks/patient";
import { useBranches } from "@/hooks/business";

const formatLabel = (value: string) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

const combineDateAndTime = (dateIso: string, time: string) => {
  const date = new Date(dateIso);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0,
  ).toISOString();
};

const todayStartIso = (() => {
  const next = new Date();
  next.setHours(0, 0, 0, 0);
  return next.toISOString();
})();

const AppointmentForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDoctorWorkspace = pathname.startsWith("/doctor");
  const appointmentsPath = isDoctorWorkspace
    ? "/doctor/appointments"
    : "/admin/appointments";
  const { data: doctorProfile, isLoading: isDoctorLoading } =
    useMyDoctorProfile();
  const { createAppointment, isPending } = useCreateAppointment();

  const form = useForm({
    defaultValues: {
      patientId: searchParams.get("patientId"),
      doctorId: doctorProfile?.id,
      branchId: doctorProfile?.branchId,
      channel: "inPerson",
      patientNotes: "",
      scheduledEndAt: "",
      scheduledStartAt: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    } as CreateAppointmentType & { appointmentDate?: string },
    validators: {
      onSubmit: createAppointmentSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await createAppointment(value);
        toast.success("Appointment booked successfully.");
        router.push(`${appointmentsPath}/${response.data.id}`);
      } catch (error: any) {
        toast.error("Failed to book appointment", {
          description: error?.message,
        });
      }
    },
  });

  if (isDoctorWorkspace && isDoctorLoading) {
    return <CUFormSkeleton />;
  }

  if (isDoctorWorkspace && !doctorProfile) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        Your doctor profile needs a branch assignment before appointments can be
        booked.
      </div>
    );
  }

  return (
    <Form form={form}>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Book Appointment
        </h2>
        <p className="text-sm text-muted-foreground">
          {isDoctorWorkspace
            ? "Schedule an appointment from your own doctor workspace."
            : "Book an appointment on behalf of a patient from the admin workspace."}
        </p>
      </div>

      <FormSection
        title="Linked Records"
        description="Choose the branch, patient, and doctor for this appointment."
      >
        {isDoctorWorkspace ? (
          <>
            <div className="rounded-xl border border-border/60 px-4 py-3">
              <p className="text-sm text-muted-foreground">Doctor</p>
              <p className="mt-1 font-medium">
                {doctorProfile?.user?.displayName ?? "Doctor"}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 px-4 py-3">
              <p className="text-sm text-muted-foreground">Branch</p>
              <p className="mt-1 font-medium">
                {doctorProfile?.branch?.name ?? "Branch not set"}
              </p>
            </div>
          </>
        ) : (
          <>
            <ComboboxField
              form={form}
              name="branchId"
              label="Branch"
              placeholder="Choose a branch"
              dataKey="branches"
              useQuery={useBranches}
              queryArgs={{
                page: 1,
                limit: 100,
                sortBy: "name",
                sortOrder: "asc",
                searchBy: "name",
              }}
              getOption={(branch) => ({
                key: branch.id,
                value: branch.id,
                label: branch.name,
                content: (
                  <div className="flex flex-col">
                    <span className="font-medium">{branch.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {branch.street}, {branch.city}, {branch.state},{" "}
                      {branch.postalCode}
                    </span>
                  </div>
                ),
              })}
            />
            <ComboboxField
              form={form}
              name="doctorId"
              label="Doctor"
              placeholder="Choose a doctor"
              dataKey="doctors"
              useQuery={useDoctors}
              queryArgs={{
                page: 1,
                limit: 100,
                sortBy: "displayName",
                sortOrder: "asc",
                searchBy: "displayName",
                verificationStatus: "verified",
                isAvailable: true,
              }}
              getOption={(doctor) => ({
                key: doctor.id,
                value: doctor.id,
                label: doctor.user?.displayName ?? doctor.slug ?? doctor.id,
                content: (
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {doctor.user?.displayName ?? doctor.slug ?? doctor.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {doctor.specialty ?? "Specialty not set"}
                    </span>
                  </div>
                ),
              })}
            />
          </>
        )}

        <ComboboxField
          form={form}
          name="patientId"
          label="Patient"
          placeholder="Choose a patient"
          dataKey="patients"
          useQuery={usePatients}
          queryArgs={{
            page: 1,
            limit: 100,
            sortBy: "displayName",
            sortOrder: "asc",
            searchBy: "displayName",
          }}
          getOption={(patient) => ({
            key: patient.id,
            value: patient.id,
            label: patient.user?.displayName ?? patient.id,
            content: (
              <div className="flex flex-col">
                <span className="font-medium">
                  {patient.user?.displayName ?? patient.id}
                </span>
                <span className="text-xs text-muted-foreground">
                  {patient.user?.email ?? patient.user?.phone ?? "No contact"}
                </span>
              </div>
            ),
          })}
        />
      </FormSection>

      <FormSection
        title="Schedule Details"
        description="Set the date, time window, channel, and timezone for this booking."
      >
        <DatePickerField
          form={form}
          name="appointmentDate"
          label="Appointment Date"
          placeholder="Select appointment date"
          disableBefore={todayStartIso}
        />
        <FormField form={form} name="channel" label="Channel">
          {({ value, onChange, isInvalid }) => (
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger aria-invalid={isInvalid}>
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                {AppointmentChannelEnum.options.map(
                  (option: "inPerson" | "virtual") => (
                    <SelectItem key={option} value={option}>
                      {formatLabel(option)}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          )}
        </FormField>
        <InputField
          form={form}
          name="scheduledStartAt"
          label="Start Time"
          type="time"
        />
        <InputField
          form={form}
          name="scheduledEndAt"
          label="End Time"
          type="time"
        />
        <InputField form={form} name="timezone" label="Timezone" />
        <InputField
          form={form}
          name="patientNotes"
          label="Patient Notes"
          type="textarea"
          rows={5}
          className="md:col-span-2"
        />
      </FormSection>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(appointmentsPath)}
          disabled={isPending}
        >
          Cancel
        </Button>

        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending ? "Booking..." : "Book Appointment"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
};

export default AppointmentForm;
