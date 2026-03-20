/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { toast } from "sonner";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useForm } from "@tanstack/react-form";
import { Loader2, User, Camera, Bell } from "lucide-react";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

import {
  userProfileSchema,
  type UserProfileType,
  type UserResponse,
} from "@workspace/contracts/user";
import { MessagingChannelEnum, ThemeModeEnum } from "@workspace/contracts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";

import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { Switch } from "@workspace/ui/components/switch";
import { Badge } from "@workspace/ui/components/badge";
import { InputField } from "@workspace/ui/components/input-field";
import { SelectField } from "@workspace/ui/components/select-field";

import { useMediaLibrary } from "@/hooks/media";

interface ProfileFormProps {
  user: UserResponse;
  onUpdate: UseMutateAsyncFunction<any, any, UserProfileType>;
  isUpdating: boolean;
}

const ProfileSection = ({ user, onUpdate, isUpdating }: ProfileFormProps) => {
  const { onMediaSelect } = useMediaLibrary();
  const [userImage, setUserImage] = useState(user.image);
  const { setTheme } = useTheme();

  const form = useForm({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || undefined,
      displayName: user.displayName,
      imageId: user.imageId ?? undefined,
      preferredTheme: user.preferredTheme,
      fallbackChannel: user.fallbackChannel,
      pushNotifications: user.pushNotifications,
      loginAlerts: user.loginAlerts,
    } as UserProfileType,
    validators: { onSubmit: userProfileSchema },
    onSubmit: async ({ value }) => {
      try {
        await onUpdate({ ...value, imageId: userImage?.id });
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

          <div className="flex-1 flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold">{user.displayName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>

              <div className="mt-2 flex gap-2">
                <Badge variant="secondary">{user.role}</Badge>
                <Badge variant="outline" className="text-green-600">
                  Email verified
                </Badge>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                {user.lastLoginAt && (
                  <p>
                    Last login:{" "}
                    {new Date(user.lastLoginAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onMediaSelect(setUserImage)}
            >
              <Camera className="mr-2 size-4" />
              Change photo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update how your name appears across the platform
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <InputField form={form} name="firstName" label="First Name" />
          <InputField form={form} name="lastName" label="Last Name" />
          <InputField
            form={form}
            name="displayName"
            label="Display Name"
            className="md:col-span-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences & Notifications</CardTitle>
          <CardDescription>
            Control appearance and notification behavior
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <form.Subscribe
              selector={(s) => ({ theme: s.values.preferredTheme })}
            >
              {({ theme }) => {
                if (theme) setTheme(theme);
                return (
                  <SelectField
                    form={form}
                    name="preferredTheme"
                    label="Theme"
                    options={ThemeModeEnum.options}
                  />
                );
              }}
            </form.Subscribe>

            <SelectField
              form={form}
              name="fallbackChannel"
              label="SMS Channel"
              options={MessagingChannelEnum.options}
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Bell className="size-4" />
                Push notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Important activity alerts
              </p>
            </div>

            <form.Field name="pushNotifications">
              {(field) => (
                <Switch
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
              )}
            </form.Field>
          </div>

          {/* Login Alerts */}
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Login Alerts</p>
              <p className="text-sm text-muted-foreground">
                New device login notifications
              </p>
            </div>

            <form.Field name="loginAlerts">
              {(field) => (
                <Switch
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
              )}
            </form.Field>
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          <Button size="lg" type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
};

export default ProfileSection;
