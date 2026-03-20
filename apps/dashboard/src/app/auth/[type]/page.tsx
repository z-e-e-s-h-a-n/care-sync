import { notFound } from "next/navigation";
import AuthForm from "@/components/forms/AuthForm";
import type { AppPageProps, AuthFormType } from "@workspace/contracts";
import type { ValidateOtpType } from "@workspace/contracts/auth";

const page = async ({
  params,
  searchParams,
}: AppPageProps<{ type: AuthFormType }, ValidateOtpType>) => {
  const { type } = await params;
  const queryParams = await searchParams;

  if (
    !["sign-up", "sign-in", "reset-password", "set-password"].includes(type)
  ) {
    return notFound();
  }
  return <AuthForm formType={type} queryParams={queryParams} />;
};

export default page;
