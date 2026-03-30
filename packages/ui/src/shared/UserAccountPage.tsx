"use client";

import { Loader2, Shield, User } from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

import useUser from "@workspace/ui/hooks/use-user";
import AccountSection from "@workspace/ui/shared/UserAccountSection";
import ProfileSection from "@workspace/ui/shared/UserProfileSection";

const UserAccountPage = () => {
  const { currentUser, isLoading, updateProfile, isUpdatePending } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <section className="section space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile, security, and preferences
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="size-4" />
            Account & Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-2">
          <ProfileSection
            user={currentUser}
            onUpdate={updateProfile}
            isUpdating={isUpdatePending}
          />
        </TabsContent>

        <TabsContent value="account" className="mt-2">
          <AccountSection user={currentUser} />
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default UserAccountPage;
