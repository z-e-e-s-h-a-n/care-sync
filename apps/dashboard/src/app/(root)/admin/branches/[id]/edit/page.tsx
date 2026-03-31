import BranchForm from "@/components/forms/BranchForm";
import type { AppPageProps } from "@workspace/contracts";

const page = async ({ params }: AppPageProps) => {
  const { id } = await params;

  return <BranchForm formType="update" entityId={id} />;
};

export default page;
