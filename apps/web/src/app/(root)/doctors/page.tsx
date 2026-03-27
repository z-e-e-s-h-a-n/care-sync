"use client";

import { useState } from "react";

import DoctorCard from "@/components/DoctorCard";
import { useDoctors } from "@/hooks/healthcare";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import SectionHeader from "@/components/SectionHeader";

const DoctorsPage = () => {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");

  const { data } = useDoctors({
    page: 1,
    limit: 24,
    sortBy: "displayName",
    sortOrder: "asc",
    searchBy: "displayName",
    search: search || undefined,
    specialty: specialty || undefined,
    verificationStatus: "verified",
    isAvailable: true,
  });

  const doctors = data?.doctors ?? [];

  return (
    <>
      <section className="section-wrapper">
        <div className="section-container space-y-8">
          <SectionHeader
            subtitle="Doctors"
            title="Browse care providers"
            description=" Discover verified doctors, review specialties, and move into booking from a cleaner patient-first directory."
          />

          <div className="grid gap-4 rounded-4xl border border-border bg-secondary p-5 md:grid-cols-[1fr_220px_auto]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by doctor name"
            />
            <Input
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              placeholder="Filter by specialty"
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setSpecialty("");
              }}
            >
              Reset filters
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>

          {!doctors.length && (
            <div className="rounded-4xl border border-dashed border-border/60 p-8 text-sm text-muted-foreground">
              No doctors matched your current filters.
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default DoctorsPage;
