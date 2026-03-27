"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";

import type { BaseCUFormProps } from "@workspace/contracts";
import { branchSchema, type BranchType } from "@workspace/contracts/branch";
import { Form, FormSection } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { InputField } from "@workspace/ui/components/input-field";
import { SwitchField } from "@workspace/ui/components/switch-field";

import { useBranch, useSaveBranch } from "@/hooks/healthcare";
import CUFormSkeleton from "@/components/skeleton/CUFormSkeleton";

const ClinicForm = ({ entityId, formType }: BaseCUFormProps) => {
  const router = useRouter();
  const clinicQuery = useBranch(entityId);
  const { saveBranch, isPending } = useSaveBranch(entityId);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      email: "",
      phone: "",
      whatsapp: "",
      address: "",
      timezone: "",
      officeHoursDays: "",
      officeHoursTime: "",
      isActive: true,
    } as BranchType,
    validators: {
      onSubmit: branchSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await saveBranch(value);
        toast.success(
          `Branch ${formType === "add" ? "created" : "updated"} successfully.`,
        );
        router.push("/admin/branches");
      } catch (error: any) {
        toast.error("Failed to save branch", {
          description: error?.message,
        });
      }
    },
  });

  useEffect(() => {
    if (!clinicQuery.data) return;

    form.reset(clinicQuery.data);
  }, [clinicQuery.data, form]);

  if (clinicQuery.isLoading) return <CUFormSkeleton />;

  return (
    <Form form={form}>
      <div>
        <h2 className="text-lg font-semibold">
          {formType === "add" ? "Create Branch" : "Update Branch"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure branch identity, contact details, and office hours.
        </p>
      </div>
      <SwitchField
        form={form}
        name="isActive"
        label="Branch Active"
        desc="Hide inactive branches from operational selection and routing."
        className="md:col-span-2"
      />
      <FormSection title="Branch Information">
        <InputField form={form} name="name" label="Branch Name" />
        <InputField form={form} name="slug" label="Slug" />
        <InputField
          form={form}
          name="address"
          label="Address"
          className="md:col-span-2"
        />
        <InputField form={form} name="timezone" label="Timezone" />
      </FormSection>

      <FormSection title="Contact & Office Hours">
        <InputField form={form} name="email" label="Email" type="email" />
        <InputField form={form} name="phone" label="Phone" type="tel" />
        <InputField form={form} name="whatsapp" label="WhatsApp" type="tel" />
        <InputField form={form} name="officeHoursDays" label="Office Days" />
        <InputField form={form} name="officeHoursTime" label="Office Hours" />
      </FormSection>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/branches")}
          disabled={isPending}
        >
          Cancel
        </Button>

        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {formType === "add" ? "Create Branch" : "Save Changes"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
};

export default ClinicForm;
