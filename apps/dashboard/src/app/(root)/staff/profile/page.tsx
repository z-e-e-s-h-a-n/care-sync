import PageIntro from "@/components/dashboard/PageIntro";
import StaffForm from "@/components/forms/StaffForm";

const StaffProfilePage = () => {
  return (
    <div className="space-y-6">
      <PageIntro
        title="My profile"
        description="Keep your credentials, specialty, and branch assignment up to date."
      />
      <StaffForm formType="update" />
    </div>
  );
};

export default StaffProfilePage;
