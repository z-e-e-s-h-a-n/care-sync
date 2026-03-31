"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { GenderEnum, IdentificationTypeEnum } from "@workspace/contracts";
import {
  patientProfileSchema,
  type PatientProfileType,
} from "@workspace/contracts/patient";
import { Button } from "@workspace/ui/components/button";
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

import { MediaField } from "@workspace/ui/media/mediaField";
import { useMyPatientProfile } from "@/hooks/healthcare";
import CUFormSkeleton from "@workspace/ui/skeleton/CUFormSkeleton";

const formatLabel = (value: string) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

const defaultValues: PatientProfileType = {
  userId: "",
  identificationDocumentId: undefined,
  birthDate: "",
  gender: "male",
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  identificationType: undefined,
  identificationNumber: "",
};

const PatientProfileForm = () => {
  const router = useRouter();
  const {
    isLoading,
    data: PatientProfile,
    saveProfile,
    isPending,
  } = useMyPatientProfile();

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: patientProfileSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await saveProfile(value);
        toast.success(`Profile "updated successfully.`);
        router.push("/user/profile");
      } catch (error: any) {
        toast.error("Failed to save patient", {
          description: error?.message,
        });
      }
    },
  });

  useEffect(() => {
    if (!PatientProfile) return;
    form.reset(PatientProfile);
  }, [PatientProfile, form]);

  if (isLoading) return <CUFormSkeleton />;

  return (
    <Form form={form}>
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
          defaultMedia={PatientProfile?.identificationDocument ?? undefined}
        />
      </FormSection>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/")}
          disabled={isPending}
        >
          Cancel
        </Button>

        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending ? "Saving..." : "Update Profile"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
};

export default PatientProfileForm;
