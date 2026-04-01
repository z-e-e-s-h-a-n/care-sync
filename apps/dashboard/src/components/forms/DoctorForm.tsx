"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import type { BaseCUFormProps } from "@workspace/contracts";
import {
  doctorProfileSchema,
  type DoctorProfileType,
} from "@workspace/contracts/doctor";
import { Button } from "@workspace/ui/components/button";
import { ComboboxField } from "@workspace/ui/components/combobox-field";
import { Form, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { MultiSelectField } from "@workspace/ui/components/select-field";
import { SwitchField } from "@workspace/ui/components/switch-field";

import { useAdminUsers } from "@/hooks/admin";
import { MediaField } from "@workspace/ui/media/mediaField";
import CUFormSkeleton from "@workspace/ui/skeleton/CUFormSkeleton";
import CUUserForm from "@/components/forms/CUUserForm";
import { useDoctor, useSaveDoctor } from "@/hooks/doctor";
import useUser from "@workspace/ui/hooks/use-user";
import { useBranches } from "@/hooks/business";

const languageOptions = [
  { label: "Arabic", value: "Arabic" },
  { label: "English", value: "English" },
  { label: "Hindi", value: "Hindi" },
  { label: "Urdu", value: "Urdu" },
  { label: "French", value: "French" },
  { label: "Tagalog", value: "Tagalog" },
];

const DoctorForm = ({ entityId, formType }: BaseCUFormProps) => {
  const router = useRouter();
  const { currentUser, isLoading: isUserLoading } = useUser();
  const { data, isLoading } = useDoctor(entityId);
  const { saveDoctor, isPending } = useSaveDoctor(entityId);

  const form = useForm({
    defaultValues: {
      userId: "",
      branchId: "",
      slug: "",
      title: "",
      specialty: "",
      licenseNumber: "",
      languages: [],
      isAvailable: true,
      consultationFee: 0,
    } as DoctorProfileType,
    validators: {
      onSubmit: doctorProfileSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await saveDoctor(value);
        toast.success(
          `Doctor ${formType === "add" ? "created" : "updated"} successfully.`,
        );
        router.push(`/${currentUser?.role}/doctors`);
      } catch (error: any) {
        toast.error("Failed to save doctor", {
          description: error?.message,
        });
      }
    },
  });

  useEffect(() => {
    if (!data) return;
    form.reset();
  }, [data, form]);

  if (isLoading || isUserLoading) return <CUFormSkeleton />;

  return (
    <Form form={form}>
      {currentUser?.role === "admin" && (
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {formType === "add" ? "Create Doctor" : "Update Doctor"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Select the doctor, assign the branch, and complete the provider
            profile.
          </p>
        </div>
      )}
      {currentUser?.role === "admin" && (
        <FormSection
          title="Assignment"
          description="Choose the doctor account and attach the correct branch."
        >
          <ComboboxField
            form={form}
            name="userId"
            label="Doctor User"
            placeholder="Choose a doctor user"
            dataKey="users"
            useQuery={useAdminUsers}
            queryArgs={{
              page: 1,
              limit: 100,
              sortBy: "displayName",
              sortOrder: "asc",
              searchBy: "displayName",
              role: "doctor",
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
            createLabel="Add new doctor user"
            createTitle="Create Doctor User"
            createDescription="Create the user account first, then link it to this doctor profile."
            renderCreateForm={({ close, select }) => (
              <CUUserForm
                formType="add"
                userRole="doctor"
                onCancel={close}
                onSuccess={(user) => select(user.id)}
              />
            )}
          />
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
        </FormSection>
      )}

      <FormSection
        title="Professional Information"
        description="Set up consultation, specialty, and credential details."
      >
        <InputField form={form} name="slug" label="Profile Slug" />
        <InputField form={form} name="title" label="Professional Title" />
        <InputField form={form} name="specialty" label="Specialty" />
        <InputField form={form} name="licenseNumber" label="License Number" />
        <InputField
          form={form}
          name="yearsExperience"
          label="Years of Experience"
          type="number"
          min={0}
        />
        <InputField
          form={form}
          name="consultationFee"
          label="Consultation Fee"
          type="number"
          min={0}
        />
        <InputField
          form={form}
          name="commissionPercent"
          label="Commission Percent"
          type="number"
          min={0}
        />
        <InputField form={form} name="education" label="Education" />
        <InputField form={form} name="qualifications" label="Qualifications" />
        <MultiSelectField
          form={form}
          name="languages"
          label="Languages"
          placeholder="Select languages"
          options={languageOptions}
        />
      </FormSection>

      <FormSection
        title="Identity and Documents"
        description="Store verification identity details and supporting files."
      >
        <MediaField
          form={form}
          name="licenseDocumentId"
          label="License Document"
          defaultMedia={data?.licenseDocument ?? undefined}
        />
      </FormSection>

      <FormSection
        title="Publishing and Availability"
        description="Manage review state, public profile text, and booking availability."
      >
        <InputField
          form={form}
          name="bio"
          label="Professional Bio"
          type="textarea"
          rows={6}
          className="md:col-span-2"
        />

        <SwitchField
          form={form}
          name="isAvailable"
          label="Available for Booking"
          desc="Control whether this doctor can receive new bookings."
          className="md:col-span-2"
        />
      </FormSection>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/${currentUser?.role}/doctors`)}
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
                  ? "Create Doctor"
                  : "Save Changes"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
};

export default DoctorForm;
