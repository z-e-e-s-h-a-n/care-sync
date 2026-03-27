import Link from "next/link";
import type { DoctorProfileResponse } from "@workspace/contracts/doctor";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import { formatPrice } from "@workspace/shared/utils";

interface DoctorCardProps {
  doctor: DoctorProfileResponse;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  return (
    <Card className="h-full rounded-3xl border-border/60 shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">
              {doctor.user?.displayName ?? doctor.slug ?? doctor.id}
            </p>
            <p className="text-sm text-muted-foreground">
              {doctor.specialty ?? "Care provider"}
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {doctor.verificationStatus}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {doctor.branch?.name ?? "Independent"}
          </Badge>
          <Badge variant="secondary">
            {doctor.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {doctor.bio ??
            "Professional profile details will appear here once published."}
        </p>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Experience</span>
            <span className="font-medium">
              {doctor.yearsExperience
                ? `${doctor.yearsExperience} years`
                : "Not listed"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Consultation</span>
            <span className="font-medium">
              {doctor.consultationFee
                ? formatPrice(doctor.consultationFee)
                : "Contact branch"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/doctors/${doctor.id}`}>View doctor</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;
