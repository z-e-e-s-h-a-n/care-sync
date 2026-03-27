"use client";

import PatientProfileForm from "@/components/PatientProfileForm";
import ProfileCompletionCard from "@/components/ProfileCompletionCard";
import { useMyPatientProfile } from "@/hooks/healthcare";

const ProfilePage = () => {
  const profileQuery = useMyPatientProfile();

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Profile</p>
        <h1 className="text-4xl font-semibold tracking-tight">Patient profile</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Keep your emergency contact and health profile current so booking and follow-up stay smooth.
        </p>
      </div>

      <ProfileCompletionCard profile={profileQuery.data} />
      <PatientProfileForm />
    </div>
  );
};

export default ProfilePage;
