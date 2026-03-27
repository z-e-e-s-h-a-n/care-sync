"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Mail, Shield, Phone, Smartphone, Loader2 } from "lucide-react";
import z from "zod";
import { identifierSchema, passwordSchema } from "@workspace/contracts";
import {
  requestOtp,
  resetPassword,
  requestUpdateIdentifier,
  updateMfa,
} from "@workspace/sdk/auth";
import { Form } from "@workspace/ui/components/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { InputField } from "@workspace/ui/components/input-field";
import OtpModal, { type OtpMeta } from "@workspace/ui/components/otp-modal";
import { SelectField } from "@workspace/ui/components/select-field";
import { MfaMethodEnum } from "@workspace/contracts";
import { Badge } from "@workspace/ui/components/badge";
import useUser from "@workspace/ui/hooks/user";
import UserSessions from "./UserSessions";
import type { UserResponse } from "@workspace/contracts/user";
import type { OtpPurpose } from "@workspace/contracts";
import { getStatusVariant } from "@workspace/ui/lib/utils";

type IdentifierType = "email" | "phone";

interface AccountSectionProps {
  user: UserResponse;
}

const AccountSection = ({ user }: AccountSectionProps) => {
  const { refetchUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>();
  const [identifierType, setIdentifierType] = useState<IdentifierType>();
  const [otpMeta, setOtpMeta] = useState<OtpMeta>();
  const [isLoading, setIsLoading] = useState(false);

  const primaryIdentifier = user.email || user.phone;
  const primaryIdentifierType = user.email ? "email" : "phone";

  const schema = z.object({
    newIdentifier:
      otpPurpose === "updateIdentifier"
        ? identifierSchema
        : z.string().optional(),
    newPassword: otpPurpose?.includes("Password")
      ? passwordSchema
      : z.string().optional(),
    confirmPassword: otpPurpose?.includes("Password")
      ? passwordSchema
      : z.string().optional(),
    preferredMfa:
      otpPurpose === "updateMfa" ? MfaMethodEnum : MfaMethodEnum.optional(),
  });

  const form = useForm({
    defaultValues: {
      newIdentifier: otpPurpose === "updateIdentifier" ? "" : undefined,
      newPassword: otpPurpose?.includes("Password") ? "" : undefined,
      confirmPassword: otpPurpose?.includes("Password") ? "" : undefined,
      preferredMfa: user.preferredMfa ?? "email",
    },
    validators: {
      onSubmit: schema as any,
    },
    onSubmit: async ({ value }) => {
      let message = "";
      try {
        setIsLoading(true);
        if (!otpMeta?.token) throw new Error("OTP token is missing");

        if (otpPurpose === "updateIdentifier") {
          const res = await requestUpdateIdentifier({
            identifier: primaryIdentifier!,
            newIdentifier: value.newIdentifier!,
            purpose: otpPurpose,
            secret: otpMeta.token,
          });

          message = res.message;
        } else if (otpPurpose === "updatePassword") {
          const res = await resetPassword({
            identifier: primaryIdentifier!,
            purpose: otpPurpose,
            newPassword: value.newPassword!,
            secret: otpMeta.token,
          });

          message = res.message;
        } else if (otpPurpose === "updateMfa") {
          const res = await updateMfa({
            identifier: primaryIdentifier!,
            purpose: otpPurpose,
            preferredMfa: value.preferredMfa,
            secret: otpMeta.token,
          });
          message = res.message;
        }

        toast.success(message);
        form.reset();
        void refetchUser();
      } catch (error: any) {
        toast.error(error.message || "Operation failed");
      } finally {
        setOtpPurpose(undefined);
        setOtpMeta(undefined);
        setIdentifierType(undefined);
        setIsLoading(false);
      }
    },
  });

  const handleOpen = (purpose: OtpPurpose, type?: IdentifierType) => {
    if (type) setIdentifierType(type);
    setOtpMeta(undefined);
    setOtpPurpose(purpose);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!otpPurpose || !primaryIdentifier) return;

    if (otpMeta?.valid) return;

    const otpRequest = async () => {
      try {
        const res = await requestOtp({
          identifier: primaryIdentifier,
          purpose: otpPurpose,
        });
        toast.success(res.message);
      } catch (err: any) {
        toast.error("Failed to request OTP", {
          description: err?.message,
        });
      }
    };

    void otpRequest();
  }, [isOpen, otpPurpose, primaryIdentifier, otpMeta?.valid]);

  useEffect(() => {
    if (otpMeta?.valid && !otpMeta.token) {
      void refetchUser();
    }
  }, [otpMeta?.token, otpMeta?.valid, refetchUser]);

  return (
    <Form form={form} className="space-y-6">
      {/* Account Identifiers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="size-5" />
            Account Identifiers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Section */}
          <div className="space-y-4 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Address</p>
                  {user.email ? (
                    <>
                      <p className="text-muted-foreground text-sm">
                        {user.email}
                      </p>
                      <p className="text-xs mt-1">
                        Status:{" "}
                        <span
                          className={
                            user.isEmailVerified
                              ? "text-green-600"
                              : "text-amber-600"
                          }
                        >
                          {user.isEmailVerified ? "Verified" : "Unverified"}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No email added
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpen("updateIdentifier", "email")}
                disabled={isLoading}
              >
                {user.email ? "Change Email" : "Add Email"}
              </Button>
            </div>

            {otpMeta?.valid &&
              otpPurpose === "updateIdentifier" &&
              identifierType === "email" && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <InputField
                    form={form}
                    name="newIdentifier"
                    label={user.email ? "New Email" : "Email Address"}
                    type="email"
                    placeholder="Enter email address"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={isLoading}
                    >
                      {user.email ? "Change Email" : "Verify Email"}
                      {isLoading && <Loader2 className="animate-spin" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOtpMeta(undefined);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
          </div>

          {/* Phone Section */}
          <div className="space-y-4 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone Number</p>
                  {user.phone ? (
                    <>
                      <p className="text-muted-foreground text-sm">
                        {user.phone}
                      </p>
                      <p className="text-xs mt-1">
                        Status:{" "}
                        <span
                          className={
                            user.isPhoneVerified
                              ? "text-green-600"
                              : "text-amber-600"
                          }
                        >
                          {user.isPhoneVerified ? "Verified" : "Unverified"}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No phone number added
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpen("updateIdentifier", "phone")}
                disabled={isLoading}
              >
                {user.phone ? "Change Phone" : "Add Phone"}
              </Button>
            </div>

            {otpMeta?.valid &&
              otpPurpose === "updateIdentifier" &&
              identifierType === "phone" && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <InputField
                    form={form}
                    name="newIdentifier"
                    label={user.phone ? "New Phone Number" : "Phone Number"}
                    type="tel"
                    placeholder="Enter phone number"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={isLoading}
                    >
                      {user.phone ? "Change Phone" : "Verify Phone"}
                      {isLoading && <Loader2 className="animate-spin" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOtpMeta(undefined);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
          </div>

          {/* Primary Identifier Info */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Current login method:</strong>{" "}
              {primaryIdentifierType === "email" ? "Email" : "Phone number"}
              <br />
              <span className="text-xs">
                You can add both email and phone for additional security and
                recovery options.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Multi-Factor Authentication */}
          <div className="space-y-4">
            {/* MFA Status */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <p className="font-medium">Multi-Factor Authentication</p>
                <div className="text-sm text-muted-foreground">
                  {user.preferredMfa ? (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getStatusVariant("verified")}
                        className="text-green-700 bg-green-700/30"
                      >
                        Enabled
                      </Badge>
                      <Badge variant="secondary">
                        {user.preferredMfa === "email" && <Mail />}
                        {user.preferredMfa === "sms" && <Phone />}
                        {user.preferredMfa === "whatsapp" && <Phone />}
                        {user.preferredMfa === "authApp" && <Shield />}
                        {user.preferredMfa}
                      </Badge>
                    </div>
                  ) : (
                    <span>Disabled</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {user.preferredMfa ? (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpen("updateMfa")}
                    >
                      Change Method
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleOpen("disableMfa")}
                    >
                      Disable
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpen("enableMfa")}
                    disabled={isLoading}
                  >
                    Enable MFA
                  </Button>
                )}
              </div>
            </div>

            {otpMeta?.valid && otpPurpose === "updateMfa" && (
              <div className="space-y-4 p-4 border rounded-lg">
                <SelectField
                  form={form}
                  name="preferredMfa"
                  label="Select MFA Method"
                  options={MfaMethodEnum.options.filter(
                    (m) => m !== user.preferredMfa,
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    Save MFA Settings
                    {isLoading && <Loader2 className="animate-spin" />}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOtpMeta(undefined);
                      setOtpPurpose(undefined);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-muted-foreground text-sm">
                  Last changed: {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpen("updatePassword")}
                disabled={isLoading}
              >
                Change Password
              </Button>
            </div>

            {otpMeta?.valid && otpPurpose === "updatePassword" && (
              <div className="space-y-4 p-4 border rounded-lg">
                <InputField
                  form={form}
                  name="newPassword"
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                />
                <InputField
                  form={form}
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm new password"
                  validators={{
                    onChangeListenTo: ["newPassword"],
                    onChange: ({ value, fieldApi }) =>
                      value !== fieldApi.form.getFieldValue("newPassword")
                        ? { message: "Passwords do not match" }
                        : undefined,
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    Update Password
                    {isLoading && <Loader2 className="animate-spin" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOtpMeta(undefined);
                      setOtpPurpose(undefined);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Sessions */}
      <UserSessions />

      {/* OTP Modal */}
      {otpPurpose && (
        <OtpModal
          open={isOpen}
          setOpen={setIsOpen}
          setOtpMeta={setOtpMeta}
          identifier={primaryIdentifier!}
          purpose={otpPurpose}
        />
      )}
    </Form>
  );
};

export default AccountSection;
