import BranchForm from "@/components/forms/BranchForm";
import type { AppPageProps } from "@workspace/contracts";

const page = async ({ params }: AppPageProps<{ id: string }>) => {
  const { id } = await params;
  return <BranchForm formType="update" entityId={id} />;
};

export default page;
