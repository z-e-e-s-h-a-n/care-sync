import PageIntro from "@/components/dashboard/PageIntro";
import DoctorForm from "@/components/forms/DoctorForm";

const DoctorProfilePage = () => {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Doctor profile"
        description="Keep your public profile, consultation fee, and booking readiness up to date from the dashboard."
      />
      <DoctorForm formType="update" />
    </div>
  );
};

export default DoctorProfilePage;
