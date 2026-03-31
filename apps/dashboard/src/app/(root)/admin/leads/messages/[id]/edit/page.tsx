import ContactMessageForm from "@/components/forms/ContactMessageForm";
import type { AppPageProps } from "@workspace/contracts";

const EditContactMessagePage = async ({ params }: AppPageProps) => {
  const { id } = await params;
  return <ContactMessageForm entityId={id} formType="update" />;
};

export default EditContactMessagePage;
