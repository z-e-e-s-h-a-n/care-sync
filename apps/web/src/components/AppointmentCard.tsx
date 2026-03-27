import Link from "next/link";
import type { AppointmentResponse } from "@workspace/contracts/appointment";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";

interface AppointmentCardProps {
  appointment: AppointmentResponse;
}

const formatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  const latestPayment = appointment.payments?.[0];

  return (
    <Card className="rounded-3xl border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-lg">{appointment.appointmentNumber}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {appointment.doctor?.user?.displayName ?? "Doctor"} · {" "}
            {appointment.doctor?.specialty ?? "Care provider"}
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {appointment.status}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Scheduled</span>
          <span className="font-medium">
            {formatter.format(new Date(appointment.scheduledStartAt))}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Channel</span>
          <span className="font-medium capitalize">{appointment.channel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Branch</span>
          <span className="font-medium">
            {appointment.branch?.name ?? "Branch not assigned"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Payment</span>
          <span className="font-medium capitalize">
            {latestPayment?.status ?? "pending setup"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/appointments/${appointment.id}`}>Details</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/messages/${appointment.id}`}>Messages</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AppointmentCard;
