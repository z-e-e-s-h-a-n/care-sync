/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { CUUserSchema, type CUUserType } from "@workspace/contracts/admin";
import {
  UserRoleEnum,
  UserStatusEnum,
  type BaseCUFormProps,
} from "@workspace/contracts";

import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { InputField } from "@workspace/ui/components/input-field";
import { SelectField } from "@workspace/ui/components/select-field";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useAdminUser } from "@/hooks/admin";
import CUFormSkeleton from "@/components/skeleton/CUFormSkeleton";

const CUUserForm = ({ entityId, formType }: BaseCUFormProps) => {
  const router = useRouter();
  const { data, mutateAsync, isPending, isLoading } = useAdminUser(entityId);
  const [changePassword, setChangePassword] = useState(false);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      identifier: data?.email ?? data?.phone,
      password: undefined,
      role: "customer",
      status: "pending",
      ...data,
    } as CUUserType,
    validators: {
      onSubmit: CUUserSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync(value);
        toast.success(
          `User ${formType === "add" ? "created" : "updated"} successfully`,
        );
        router.push("/admin/users");
      } catch (err: any) {
        toast.error(err.message || "Failed to save user");
      }
    },
  });

  if (isLoading) return <CUFormSkeleton />;

  return (
    <Form form={form}>
      <div>
        <h2 className="capitalize text-lg font-semibold">
          {formType === "add" ? "Add New" : "Update"} User
          {entityId}
        </h2>
      </div>

      {/* =========================
              BASIC INFORMATION
          ========================== */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <InputField form={form} name="firstName" label="First Name" />
          <InputField form={form} name="lastName" label="Last Name" />

          <form.Subscribe
            selector={(s) => ({
              firstName: s.values.firstName,
              lastName: s.values.lastName,
            })}
          >
            {({ firstName, lastName }) => {
              const displayName = `${firstName} ${lastName || ""}`.trim();

              if (displayName) {
                form.setFieldValue("displayName", displayName);
              }

              return (
                <InputField
                  form={form}
                  name="displayName"
                  label="Display Name"
                  className="md:col-span-2"
                />
              );
            }}
          </form.Subscribe>
        </CardContent>
      </Card>

      {/* =========================
              ACCOUNT & SECURITY
          ========================== */}
      <Card>
        <CardHeader>
          <CardTitle>Account & Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* =========================
              ROLE & STATUS
          ========================== */}
      <Card>
        <CardHeader>
          <CardTitle>Role & Status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <SelectField
            form={form}
            name="role"
            label="Role"
            options={UserRoleEnum.options}
          />
          <SelectField
            form={form}
            name="status"
            label="Status"
            options={UserStatusEnum.options}
          />
        </CardContent>
      </Card>

      {/* =========================
              ACTIONS
          ========================== */}
      <div className="flex justify-between border-t pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/users")}
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
