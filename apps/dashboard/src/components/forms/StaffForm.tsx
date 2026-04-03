"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import type { BaseCUFormProps } from "@workspace/contracts";
import {
  staffProfileSchema,
  type StaffProfileType,
} from "@workspace/contracts/staff";
import { Button } from "@workspace/ui/components/button";
import { ComboboxField } from "@workspace/ui/components/combobox-field";
import { Form, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { MultiSelectField } from "@workspace/ui/components/select-field";
import { SwitchField } from "@workspace/ui/components/switch-field";

import { useAdminUsers } from "@/hooks/admin";
import CUFormSkeleton from "@workspace/ui/skeleton/CUFormSkeleton";
import CUUserForm from "@/components/forms/CUUserForm";
import { useStaffMember, useSaveStaff } from "@/hooks/staff";
import useUser from "@workspace/ui/hooks/use-user";
import { useBranches } from "@/hooks/business";

const credentialOptions = [
  { label: "BCBA", value: "BCBA" },
  { label: "BCaBA", value: "BCaBA" },
  { label: "RBT", value: "RBT" },
  { label: "BCBA-D", value: "BCBA-D" },
  { label: "M.S.", value: "M.S." },
  { label: "M.Ed.", value: "M.Ed." },
  { label: "Ph.D.", value: "Ph.D." },
  { label: "Psy.D.", value: "Psy.D." },
];

const StaffForm = ({ entityId, formType }: BaseCUFormProps) => {
  const router = useRouter();
  const { isLoading: isUserLoading } = useUser();
  const { data, isLoading } = useStaffMember(entityId);
  const { saveStaff, isPending } = useSaveStaff(entityId);

  const form = useForm({
    defaultValues: {
      userId: "",
      branchId: "",
      title: "",
      specialty: "",
      bio: "",
      credentials: [],
      isActive: true,
    } as StaffProfileType,
    validators: {
      onSubmit: staffProfileSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await saveStaff(value);
        toast.success(
          `Staff member ${formType === "add" ? "created" : "updated"} successfully.`,
        );
        router.push("/admin/staff");
      } catch (error: any) {
        toast.error("Failed to save staff member", {
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
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          {formType === "add" ? "Add Staff Member" : "Update Staff Member"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Assign a user account, select their branch, and complete the staff
          profile.
        </p>
      </div>

      <FormSection
        title="Assignment"
        description="Choose the staff user account and attach the correct branch."
      >
        <ComboboxField
          form={form}
          name="userId"
          label="Staff User"
          placeholder="Choose a staff user"
          dataKey="users"
          useQuery={useAdminUsers}
          queryArgs={{
            page: 1,
            limit: 100,
            sortBy: "displayName",
            sortOrder: "asc",
            searchBy: "displayName",
            role: "staff",
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
          createLabel="Add new staff user"
          createTitle="Create Staff User"
          createDescription="Create the user account first, then link it to this staff profile."
          renderCreateForm={({ close, select }) => (
            <CUUserForm
              formType="add"
              userRole="staff"
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

      <FormSection
        title="Professional Information"
        description="Set role title, specialty, and ABA credentials."
      >
        <InputField
          form={form}
          name="title"
          label="Job Title"
          placeholder="e.g. BCBA, RBT, Program Manager"
        />
        <InputField
          form={form}
          name="specialty"
          label="Specialty"
          placeholder="e.g. Early Intervention, Social Skills"
        />
        <MultiSelectField
          form={form}
          name="credentials"
          label="Credentials"
          placeholder="Select credentials"
          options={credentialOptions}
          className="md:col-span-2"
        />
        <InputField
          form={form}
          name="bio"
          label="Bio"
          type="textarea"
          rows={4}
          className="md:col-span-2"
          placeholder="Brief professional background."
        />
      </FormSection>

      <FormSection
        title="Status"
        description="Control whether this staff member is active on the platform."
      >
        <SwitchField
          form={form}
          name="isActive"
          label="Active"
          desc="Inactive staff cannot be assigned to patients or appointments."
          className="md:col-span-2"
        />
      </FormSection>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/staff")}
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
                  ? "Create Staff Member"
                  : "Save Changes"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
};

export default StaffForm;
