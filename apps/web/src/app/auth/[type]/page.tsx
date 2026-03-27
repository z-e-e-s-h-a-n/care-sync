import { notFound } from "next/navigation";
import type { ValidateOtpType } from "@workspace/contracts/auth";
import type { AppPageProps, AuthFormType } from "@workspace/contracts";
import { AuthForm } from "@workspace/ui/forms/AuthForm";

const page = async ({
  params,
  searchParams,
}: AppPageProps<{ type: AuthFormType }, ValidateOtpType>) => {
  const { type } = await params;
  const queryParams = await searchParams;

  if (
    !["sign-in", "sign-up", "reset-password", "set-password"].includes(type)
  ) {
    return notFound();
  }
  return <AuthForm appType="web" formType={type} queryParams={queryParams} />;
};

export default page;
