import DoctorForm from "@/components/forms/DoctorForm";
import type { AppPageProps } from "@workspace/contracts";

const page = async ({ params }: AppPageProps<{ id: string }>) => {
  const { id } = await params;
  return <DoctorForm formType="update" entityId={id} />;
};

export default page;
