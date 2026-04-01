"use client";

import Link from "next/link";

import AvailabilityEditor from "@/components/dashboard/AvailabilityEditor";
import PageIntro from "@/components/dashboard/PageIntro";
import { useDoctorAvailability } from "@/hooks/availability";
import { useMyDoctorProfile } from "@/hooks/doctor";
import { Button } from "@workspace/ui/components/button";
import SectionCard from "@workspace/ui/shared/SectionCard";

const DoctorAvailabilityPage = () => {
  const { data: doctorProfile } = useMyDoctorProfile();
  const { data } = useDoctorAvailability(doctorProfile?.id);

  return (
    <div className="space-y-6">
      <PageIntro
        title="Availability"
        description="Set weekly working hours and block dates so patients only see valid booking slots."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard
          title="Profile summary"
          action={
            <Button asChild variant="ghost">
              <Link href="/doctor/profile">Edit profile</Link>
            </Button>
          }
          className="shadow-sm"
          contentClassName="space-y-4 text-sm"
        >
          <div>
            <p className="text-muted-foreground">Doctor</p>
            <p className="font-medium">
              {doctorProfile?.user?.displayName ?? "Loading..."}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Specialty</p>
            <p className="font-medium">
              {doctorProfile?.specialty ?? "Not set"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Branch</p>
            <p className="font-medium">
              {doctorProfile?.branch?.name ?? "Unassigned"}
            </p>
          </div>
        </SectionCard>

        {doctorProfile?.id ? (
          <AvailabilityEditor doctorId={doctorProfile.id} initialValue={data} />
        ) : (
          <SectionCard
            className="shadow-sm"
            contentClassName="p-6 text-sm text-muted-foreground"
          >
            Loading doctor profile...
          </SectionCard>
        )}
      </div>
    </div>
  );
};

export default DoctorAvailabilityPage;
