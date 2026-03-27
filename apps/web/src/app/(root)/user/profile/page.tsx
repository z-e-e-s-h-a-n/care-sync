"use client";

import PatientProfileForm from "@/components/PatientProfileForm";
import SectionHeader from "@/components/SectionHeader";

const ProfilePage = () => {
  return (
    <section className="section-wrapper section-container">
      <SectionHeader
        subtitle="Profile"
        title="Patient profile"
        description="Keep your emergency contact and health profile current so booking and follow-up stay smooth."
      />

      <PatientProfileForm />
    </section>
  );
};

export default ProfilePage;
