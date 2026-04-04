"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import type { BaseCUFormProps } from "@workspace/contracts";
import { GenderEnum, IdentificationTypeEnum } from "@workspace/contracts";
import {
  patientProfileSchema,
  type PatientProfileType,
} from "@workspace/contracts/patient";
import { Button } from "@workspace/ui/components/button";
import { ComboboxField } from "@workspace/ui/components/combobox-field";
import { DatePickerField } from "@workspace/ui/components/date-field";
import { Form, FormField, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { RadioField } from "@workspace/ui/components/radio-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import { useAdminUsers } from "@/hooks/admin";
import CUUserForm from "@/components/forms/CUUserForm";
import { MediaField } from "@workspace/ui/media/mediaField";
import CUFormSkeleton from "@workspace/ui/skeleton/CUFormSkeleton";
import { usePatient, useSavePatient } from "@/hooks/patient";
import PageIntro from "@/components/dashboard/PageIntro";

const formatLabel = (value: string) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

const PatientForm = ({ entityId, formType }: BaseCUFormProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isDoctorWorkspace = pathname.startsWith("/doctor");
  const { data, isLoading } = usePatient(entityId);
  const { savePatient, isPending } = useSavePatient(entityId);

  const form = useForm({
    defaultValues: {
      userId: "",
      birthDate: "",
      gender: "male",
    } as PatientProfileType,
    validators: {
      onSubmit: patientProfileSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await savePatient(value);
        toast.success(
          `Patient ${formType === "add" ? "created" : "updated"} successfully.`,
        );

        if (isDoctorWorkspace && formType === "add") {
          router.push(`/doctor/appointments/new?patientId=${response.data.id}`);
          return;
        }

        router.push(
          isDoctorWorkspace ? "/users" : `/admin/patients/${response.data.id}`,
        );
      } catch (error: any) {
        toast.error("Failed to save patient", {
          description: error?.message,
        });
      }
    },
  });

  useEffect(() => {
    if (!data) return;
    form.reset(data);
  }, [data, form]);

  if (isLoading) return <CUFormSkeleton />;

  return (
    <Form
      form={form}
      header={
        <PageIntro
          title={formType === "add" ? "Create Patient" : "Update Patient"}
          description="Select the linked patient user and manage the medical profile separately from the account record."
        />
      }
    >
      <FormSection
        title="Patient Account"
        description="Link the patient user account before completing the profile."
      >
        <ComboboxField
          form={form}
          name="userId"
          label="Patient User"
          placeholder="Choose a patient user"
          dataKey="users"
          useQuery={useAdminUsers}
          queryArgs={{
            page: 1,
            limit: 100,
            sortBy: "displayName",
            sortOrder: "asc",
            searchBy: "displayName",
            role: "patient",
          }}
          getOption={(user) => ({
            key: user.id,
            value: user.id,
            label: user.displayName,
            content: (
              <div className="flex flex-col">
                <span className="font-medium">{user.displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email ?? user.phone ?? "No contact"}
                </span>
              </div>
            ),
          })}
          createLabel="Add new patient user"
          createTitle="Create Patient User"
          createDescription="Create the patient user account first, then attach the profile."
          renderCreateForm={({ close, select }) => (
            <CUUserForm
              formType="add"
              userRole="patient"
              onCancel={close}
              onSuccess={(user) => select(user.id)}
            />
          )}
        />
      </FormSection>

      <FormSection
        title="Personal Information"
        description="Personal details, demographics, address, and emergency contacts."
      >
        <DatePickerField
          form={form}
          name="birthDate"
          label="Date of Birth"
          placeholder="Select date of birth"
        />
        <RadioField
          form={form}
          name="gender"
          label="Gender"
          options={GenderEnum.options.map((option) => ({
            label: formatLabel(option),
            value: option,
          }))}
        />
        <InputField form={form} name="address" label="Address" />
        <InputField form={form} name="occupation" label="Occupation" />
        <InputField
          form={form}
          name="emergencyContactName"
          label="Emergency Contact Name"
        />
        <InputField
          form={form}
          name="emergencyContactNumber"
          label="Emergency Contact Number"
          type="tel"
        />
      </FormSection>

      <FormSection
        title="Medical Information"
        description="Insurance information, medications, and medical history."
      >
        <InputField
          form={form}
          name="insuranceProvider"
          label="Insurance Provider"
        />
        <InputField
          form={form}
          name="insurancePolicyNumber"
          label="Insurance Policy Number"
        />
        <InputField
          form={form}
          name="allergies"
          label="Allergies"
          type="textarea"
          rows={4}
        />
        <InputField
          form={form}
          name="currentMedication"
          label="Current Medications"
          type="textarea"
          rows={4}
        />
        <InputField
          form={form}
          name="familyMedicalHistory"
          label="Family Medical History"
          type="textarea"
          rows={4}
        />
        <InputField
          form={form}
          name="pastMedicalHistory"
          label="Past Medical History"
          type="textarea"
          rows={4}
        />
      </FormSection>

      <FormSection
        title="Identification and Verification"
        description="Capture identification type, number, and scanned document."
      >
        <FormField
          form={form}
          name="identificationType"
          label="Identification Type"
        >
          {({ value, onChange, isInvalid }) => (
            <Select value={value ?? ""} onValueChange={onChange}>
              <SelectTrigger aria-invalid={isInvalid}>
                <SelectValue placeholder="Select identification type" />
              </SelectTrigger>
              <SelectContent>
                {IdentificationTypeEnum.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {formatLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
        <InputField
          form={form}
          name="identificationNumber"
          label="Identification Number"
        />
        <MediaField
          form={form}
          name="identificationDocumentId"
          label="Scanned Copy of Identification Document"
          className="md:col-span-2"
          defaultMedia={data?.identificationDocument}
        />
      </FormSection>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            router.push(
              entityId
                ? `/admin/patients/${entityId}`
                : isDoctorWorkspace
                  ? "/users"
                  : "/admin/patients",
            )
          }
          disabled={isPending}
        >
          Cancel
        </Button>

        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending
                ? "Saving..."
                : formType === "add"
                  ? "Create Patient"
                  : "Save Changes"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
};

export default PatientForm;
