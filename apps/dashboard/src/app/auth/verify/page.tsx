import VerifyAuthPage, { type VerifyAuthProps } from "./_client";
import type { AppPageProps } from "@workspace/contracts";

const page = async ({ searchParams }: AppPageProps) => {
  const query = (await searchParams) as unknown as VerifyAuthProps;

  return <VerifyAuthPage {...query} />;
};

export default page;
