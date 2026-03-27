"use client";

import Link from "next/link";
import type { PatientProfileResponse } from "@workspace/contracts/patient";

import { formatPatientFieldLabel, getPatientProfileCompletion } from "@/lib/patient";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

interface ProfileCompletionCardProps {
  profile?: PatientProfileResponse | null;
  compact?: boolean;
}

const ProfileCompletionCard = ({
  profile,
  compact = false,
}: ProfileCompletionCardProps) => {
  const completion = getPatientProfileCompletion(profile);

  return (
    <Card className="rounded-[2rem] border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>
            {compact ? "Profile readiness" : "Complete your booking profile"}
          </CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {completion.isReadyForBooking
              ? "Your core patient details are ready for appointment booking."
              : "Add your core health and emergency details so booking stays smooth."}
          </p>
        </div>
        <Badge variant={completion.isReadyForBooking ? "secondary" : "outline"}>
          {completion.percent}% complete
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              completion.isReadyForBooking ? "bg-teal-600" : "bg-amber-500"
            }`}
            style={{ width: `${completion.percent}%` }}
          />
        </div>

        {!completion.isReadyForBooking && (
          <div className="space-y-2">
            <p className="font-medium">Still needed before booking:</p>
            <ul className="space-y-1 text-muted-foreground">
              {completion.missingFields.map((field) => (
                <li key={field}>• {formatPatientFieldLabel(field)}</li>
              ))}
            </ul>
          </div>
        )}

        <Button asChild className={compact ? "w-full" : undefined}>
          <Link href="/profile">
            {completion.isReadyForBooking ? "Review profile" : "Complete profile"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionCard;
