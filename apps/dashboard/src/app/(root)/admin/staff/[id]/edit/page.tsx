import StaffForm from "@/components/forms/StaffForm";
import type { AppPageProps } from "@workspace/contracts";

const page = async ({ params }: AppPageProps<{ id: string }>) => {
  const { id } = await params;
  return <StaffForm formType="update" entityId={id} />;
};

export default page;
