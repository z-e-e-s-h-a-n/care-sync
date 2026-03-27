"use client";

import Link from "next/link";

import DoctorCard from "@/components/DoctorCard";
import { useDoctors } from "@/hooks/healthcare";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import SectionHeader from "@/components/SectionHeader";

const HomePage = () => {
  const doctorsQuery = useDoctors({
    page: 1,
    limit: 3,
    sortBy: "displayName",
    sortOrder: "asc",
    searchBy: "displayName",
    verificationStatus: "verified",
    isAvailable: true,
  });

  const doctors = doctorsQuery.data?.doctors ?? [];

  return (
    <>
      <section className="section-wrapper relative overflow-hidden ">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.14),transparent_24%)]" />
        <div className="section-container grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="relative space-y-7">
            <div className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800">
              Patient booking, messaging, and care follow-up in one place
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
                Find trusted doctors and book care with less friction.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-foreground/60">
                CareSync gives patients a cleaner path from provider discovery
                to confirmed booking, secure payment history, and direct care
                conversations.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link href="/doctors">Browse doctors</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-7"
              >
                <Link href="/store">Our Products</Link>
              </Button>
            </div>
          </div>

          <Card className="rounded-4xl border-border/60 bg-secondary shadow-xl backdrop-blur">
            <CardContent className="grid gap-6 p-8">
              <div className="rounded-3xl bg-slate-950 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-teal-300">
                  Care Journey
                </p>
                <p className="mt-4 text-3xl font-semibold text-primary-foreground">
                  Discovery to follow-up
                </p>
                <p className="mt-2 text-sm text-primary-foreground/50">
                  Search providers, book your slot, chat before the visit, and
                  keep payment history organized.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-border/60 bg-muted/30 p-4">
                  <p className="text-3xl font-semibold">24/7</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Doctor discovery and booking access.
                  </p>
                </div>
                <div className="rounded-3xl border border-border/60 bg-muted/30 p-4">
                  <p className="text-3xl font-semibold">1 place</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Appointments, payments, and messages together.
                  </p>
                </div>
                <div className="rounded-3xl border border-border/60 bg-muted/30 p-4">
                  <p className="text-3xl font-semibold">Direct</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Secure patient-to-doctor communication.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section-wrapper section-container">
        <SectionHeader
          subtitle="Featured Providers"
          title=" Start with a trusted doctor"
          href="/doctors"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
