"use client";

import { redirect } from "next/navigation";

import useUser from "@workspace/ui/hooks/use-user";

const DashboardEntryPage = () => {
  const { currentUser, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading workspace...
      </div>
    );
  }

  if (currentUser?.role === "doctor") {
    redirect("/doctor");
  }

  redirect("/admin");
};

export default DashboardEntryPage;
