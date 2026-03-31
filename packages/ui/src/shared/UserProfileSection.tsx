"use client";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2, User, Camera, Bell } from "lucide-react";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

import {
  userProfileSchema,
  type UserProfileType,
  type UserResponse,
} from "@workspace/contracts/user";
import { ThemeModeEnum, type ThemeMode } from "@workspace/contracts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";

import { Form, FormSection } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { InputField } from "@workspace/ui/components/input-field";
import { SelectField } from "@workspace/ui/components/select-field";
import { SwitchField } from "@workspace/ui/components/switch-field";

import { useMediaLibrary } from "@workspace/ui/hooks/use-media";
import { useNotificationActions } from "@workspace/ui/hooks/use-notification";
import { useTheme } from "@workspace/ui/hooks/use-theme";
import { getStatusVariant } from "@workspace/ui/lib/utils";

interface ProfileFormProps {
  user: UserResponse;
  onUpdate: UseMutateAsyncFunction<any, any, UserProfileType>;
  isUpdating: boolean;
}

const ProfileSection = ({ user, onUpdate, isUpdating }: ProfileFormProps) => {
  const { onMediaSelect } = useMediaLibrary();
  const [userImage, setUserImage] = useState(user.avatar);
  const { syncTheme } = useTheme();
  const { updatePushNotificationsAsync, isPushPending } =
    useNotificationActions();

  const form = useForm({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || undefined,
      displayName: user.displayName,
      avatarId: user.avatarId ?? undefined,
      preferredTheme: user.preferredTheme,
      pushNotifications: user.pushNotifications,
      loginAlerts: user.loginAlerts,
    } as UserProfileType & {
      pushNotifications?: boolean;
    },
    listeners: {
      onChange: ({ formApi }) => {
        const userTheme = formApi.getFieldValue("preferredTheme");
        syncTheme(userTheme as ThemeMode);
      },
    },
    validators: { onSubmit: userProfileSchema },
    onSubmit: async ({ value }) => {
      try {
        await onUpdate({ ...value, avatarId: userImage?.id });
        toast.success("Profile updated successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to update profile");
      }
    },
  });

  return (
    <Form form={form}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Profile Overview
          </CardTitle>
          <CardDescription>
            Your public profile and account metadata
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col md:flex-row gap-6">
          <Avatar className="size-28 shrink-0">
            <AvatarImage src={userImage?.url} />
            <AvatarFallback className="text-3xl uppercase">
              {user.firstName[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex flex-col items-start gap-4 sm:flex-row justify-between">
            <div>
              <p className="text-lg font-semibold">{user.displayName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>

              <div className="mt-2 flex gap-2">
                <Badge variant="info">{user.role}</Badge>
                <Badge variant={getStatusVariant("verified")}>
                  Email verified
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onMediaSelect(setUserImage)}
              >
                <Camera className="mr-2 size-4" />
                Change photo
              </Button>

              <div className="text-xs text-muted-foreground">
                <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                {user.lastLoginAt && (
                  <p>
                    Last login:{" "}
                    {new Date(user.lastLoginAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FormSection
        title="Basic Information"
        description="Update how your name appears across the platform"
      >
        <InputField form={form} name="firstName" label="First Name" />
        <InputField form={form} name="lastName" label="Last Name" />
        <InputField
          form={form}
          name="displayName"
          label="Display Name"
          className="md:col-span-2"
        />
      </FormSection>

      <FormSection
        title="Preferences & Notifications"
        description="Control appearance and notification behavior"
        className="md:grid-cols-1"
        footer={
          <div className="flex w-full justify-end">
            <Button
              size="lg"
              type="submit"
              disabled={isUpdating || isPushPending}
            >
              {isUpdating || isPushPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        }
      >
          <SelectField
            form={form}
            name="preferredTheme"
            label="Theme"
            options={ThemeModeEnum.options}
          />

          <SwitchField
            form={form}
            name="pushNotifications"
            disabled={isPushPending}
            label={
              <span className="flex items-center gap-2">
                <Bell className="size-4" />
                Push Notifications
              </span>
            }
            desc="Important activity alerts"
            handleChange={async (checked, commit) => {
              try {
                await updatePushNotificationsAsync(Boolean(checked));
                commit(Boolean(checked));
              } catch (error: any) {
                toast.error(
                  error.message || "Failed to configure push notifications",
                );
              }
            }}
          />

          <SwitchField
            form={form}
            name="loginAlerts"
            label="Login Alerts"
            desc="New device login notifications"
          />
      </FormSection>
    </Form>
  );
};

export default ProfileSection;
