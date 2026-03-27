"use client";

import Link from "next/link";

import AvailabilityEditor from "@/components/dashboard/AvailabilityEditor";
import PageIntro from "@/components/dashboard/PageIntro";
import { useDoctorAvailability, useMyDoctorProfile } from "@/hooks/healthcare";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

const DoctorAvailabilityPage = () => {
  const doctorQuery = useMyDoctorProfile();
  const doctor = doctorQuery.data;
  const availabilityQuery = useDoctorAvailability(doctor?.id);

  return (
    <div className="space-y-6">
      <PageIntro
        title="Availability"
        description="Set weekly working hours and block dates so patients only see valid booking slots."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Profile summary</CardTitle>
            <Button asChild variant="ghost">
              <Link href="/doctor/profile">Edit profile</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Doctor</p>
              <p className="font-medium">{doctor?.user?.displayName ?? "Loading..."}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Specialty</p>
              <p className="font-medium">{doctor?.specialty ?? "Not set"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Branch</p>
              <p className="font-medium">{doctor?.branch?.name ?? "Unassigned"}</p>
            </div>
          </CardContent>
        </Card>

        {doctor?.id ? (
          <AvailabilityEditor doctorId={doctor.id} initialValue={availabilityQuery.data} />
        ) : (
          <Card className="shadow-sm">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading doctor profile...
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DoctorAvailabilityPage;
