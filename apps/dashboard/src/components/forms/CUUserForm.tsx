"use client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";

import { CUUserSchema, type CUUserType } from "@workspace/contracts/admin";
import {
  SafeUserRoleEnum,
  type SafeUserRole,
  UserStatusEnum,
  type BaseCUFormProps,
} from "@workspace/contracts";

import { Form, FormSection } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { InputField } from "@workspace/ui/components/input-field";
import { SelectField } from "@workspace/ui/components/select-field";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useAdminUser } from "@/hooks/admin";
import CUFormSkeleton from "@workspace/ui/skeleton/CUFormSkeleton";
import type { UserResponse } from "@workspace/contracts/user";
import useUser from "@workspace/ui/hooks/use-user";

interface CUUserFormProps extends BaseCUFormProps {
  onSuccess?: (user: UserResponse) => void;
  onCancel?: () => void;
  userRole?: SafeUserRole;
}

const CUUserForm = ({
  entityId,
  formType,
  userRole,
  onSuccess,
  onCancel,
}: CUUserFormProps) => {
  const router = useRouter();
  const { currentUser, isLoading: isUserLoading } = useUser();
  const { data, mutateAsync, isPending, isLoading } = useAdminUser(entityId);
  const [changePassword, setChangePassword] = useState(false);
  const allowedRoles =
    currentUser?.role === "doctor"
      ? SafeUserRoleEnum.options.filter((role) => role === "patient")
      : SafeUserRoleEnum.options;

  const handleClose = () => {
    if (onCancel) {
      onCancel();
      return;
    }
  };

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      identifier: data?.email ?? data?.phone,
      password: undefined,
      role: userRole,
      status: "pending",
      ...data,
    } as CUUserType,
    validators: {
      onSubmit: CUUserSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await mutateAsync(value);
        toast.success(
          `User ${formType === "add" ? "created" : "updated"} successfully`,
        );
        onSuccess?.(response.data);
        if (!onSuccess) {
          router.push("/users");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to save user");
      }
    },
  });

  const { firstName, lastName, displayName } = useStore(
    form.store,
    (state) => ({
      firstName: state.values.firstName,
      lastName: state.values.lastName,
      displayName: state.values.displayName,
    }),
  );

  useEffect(() => {
    if (!data) return;
    form.reset();
  }, [data, form]);

  useEffect(() => {
    const nextDisplayName = `${firstName ?? ""} ${lastName ?? ""}`.trim();

    if (displayName === nextDisplayName) return;

    form.setFieldValue("displayName", nextDisplayName);
  }, [displayName, firstName, form, lastName]);

  if (isUserLoading || !currentUser) return <CUFormSkeleton />;
  if (isLoading) return <CUFormSkeleton />;

  return (
    <Form form={form}>
      <div>
        <h2 className="capitalize text-lg font-semibold">
          {formType === "add" ? "Add New" : "Update"} User
        </h2>
      </div>

      {/* =========================
              BASIC INFORMATION
          ========================== */}
      <FormSection title="Basic Information">
          <InputField form={form} name="firstName" label="First Name" />
          <InputField form={form} name="lastName" label="Last Name" />

          <InputField
            form={form}
            name="displayName"
            label="Display Name"
            className="md:col-span-2"
          />
      </FormSection>

      {/* =========================
              ACCOUNT & SECURITY
          ========================== */}
      <FormSection title="Account & Security" className="md:grid-cols-1">
          <InputField
            form={form}
            name="identifier"
            label="Email / Phone"
            type="email"
            disabled={formType === "update"}
          />

          {!changePassword ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-fit"
              onClick={() => setChangePassword(true)}
            >
              {formType === "add" ? "Set Password" : "Change Password"}
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border p-4 bg-muted/10">
              <InputField
                form={form}
                name="password"
                label="New Password"
                type="password"
                autoComplete="new-password"
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setChangePassword(false)}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setChangePassword(false);
                    form.setFieldValue("password", undefined);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
      </FormSection>

      {/* =========================
              ROLE & STATUS
          ========================== */}
      <FormSection title="Role & Status">
          <SelectField
            form={form}
            name="role"
            label="Role"
            options={allowedRoles}
          />
          <SelectField
            form={form}
            name="status"
            label="Status"
            options={UserStatusEnum.options}
          />
      </FormSection>

      {/* =========================
              ACTIONS
          ========================== */}
      <div className="flex justify-between border-t pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={handleClose}
          disabled={isPending}
        >
          Cancel
        </Button>

        <form.Subscribe selector={(s) => s.canSubmit}>
          {(canSubmit) => (
            <Button
              type="submit"
              disabled={!canSubmit || isPending}
              className="min-w-32"
            >
              {isPending && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              {formType === "add" ? "Create User" : "Update User"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
};

export default CUUserForm;
