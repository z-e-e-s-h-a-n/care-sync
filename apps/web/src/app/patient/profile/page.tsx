import PatientProfileForm from "@/components/shared/PatientProfileForm";

const ProfilePage = () => {
  return (
    <section className="section space-y-16">
      <div>
        <h1 className="text-3xl font-bold">Patient profile</h1>
        <p className="text-muted-foreground mt-2">
          Keep your emergency contact and health profile current so booking and
          follow-up stay smooth.
        </p>
      </div>

      <PatientProfileForm />
    </section>
  );
};

export default ProfilePage;
