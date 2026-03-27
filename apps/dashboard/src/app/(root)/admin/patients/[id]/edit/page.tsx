import PatientForm from "@/components/forms/PatientForm";
import type { AppPageProps } from "@workspace/contracts";

const page = async ({ params }: AppPageProps<{ id: string }>) => {
  const { id } = await params;
  return <PatientForm formType="update" entityId={id} />;
};

export default page;
