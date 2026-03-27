import type { AppPageProps } from "@workspace/contracts";
import VerifyAuthPage, {
  type VerifyAuthProps,
} from "@workspace/ui/shared/VerifyAuthPage";

const page = async ({ searchParams }: AppPageProps) => {
  const query = (await searchParams) as unknown as VerifyAuthProps;

  return <VerifyAuthPage {...query} />;
};

export default page;
