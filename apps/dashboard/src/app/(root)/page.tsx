"use client";

import { redirect } from "next/navigation";

import useUser from "@workspace/ui/hooks/use-user";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";

const DashboardEntryPage = () => {
  const { currentUser, isLoading } = useUser();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (currentUser?.role === "doctor") {
    redirect("/doctor");
  }

  redirect("/admin");
};

export default DashboardEntryPage;
