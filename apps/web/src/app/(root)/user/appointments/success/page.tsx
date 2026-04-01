"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image";
import type { AppPageProps } from "@workspace/contracts";
import React from "react";
import { formatDate } from "@workspace/shared/utils";
import { Button } from "@workspace/ui/components/button";
import { useAppointment } from "@/hooks/healthcare";
import { IconCalendar } from "@tabler/icons-react";

const RequestSuccess = ({ searchParams }: AppPageProps) => {
  const { appointmentId } = React.use(searchParams);
  const { data: appointment } = useAppointment(appointmentId as string);

  if (!appointment) return null;

  return (
    <section className="section space-y-8">
      <section className="flex flex-col items-center">
        <Image src="/gifs/success.gif" height={300} width={280} alt="success" />
        <h2 className="mb-6 max-w-150 text-center text-3xl md:text-4xl">
          Your <span className="text-green-500">appointment request</span> has
          been successfully submitted!
        </h2>
        <p>We&apos;ll be in touch shortly to confirm.</p>
      </section>

      <section className="flex w-full flex-col items-center gap-8 rounded-2xl bg-card p-8 md:m-auto md:w-fit md:flex-row">
        <p>Requested appointment details:</p>
        <div className="flex items-center gap-3">
          <Image
            src="/images/dr-cruz.png"
            alt="doctor"
            width={100}
            height={100}
            className="size-6"
          />
          <p className="whitespace-nowrap">Dr. Sarah Khan</p>
        </div>
        <div className="flex items-center gap-2">
          <IconCalendar className="size-4" />
          <p>
            {formatDate(appointment.scheduledStartAt, { mode: "datetime" })}
          </p>
        </div>
      </section>
    </section>
  );
};

export default RequestSuccess;
