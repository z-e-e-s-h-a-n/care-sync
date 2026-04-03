"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { FieldDescription } from "@workspace/ui/components/field";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { Form } from "@workspace/ui/components/form";
import Link from "next/link";
import { GalleryVerticalEnd, LoaderCircle } from "lucide-react";
import OtpModal, { type OtpMeta } from "@workspace/ui/components/otp-modal";
import { useEffect, useMemo, useState } from "react";
import {
  requestOtp,
  resetPassword,
  signIn,
  signUp,
  validateOtp,
} from "@workspace/sdk/auth";
import { useRouter } from "next/navigation";
import { InputField } from "@workspace/ui/components/input-field";
import z from "zod";
import {
  nameSchema,
  passwordSchema,
  identifierSchema,
  type AuthFormType,
  type OtpPurpose,
} from "@workspace/contracts";
import Image from "next/image";
import { appName } from "@workspace/shared/constants";
import type {
  SignInType,
  SignUpType,
  ValidateOtpType,
} from "@workspace/contracts/auth";
import SocialAuthField from "./SocialAuthField";

type AppType = "web" | "dashboard";

interface AuthFormProps {
  formType: AuthFormType;
  className?: string;
  queryParams: ValidateOtpType;
  appType: AppType;
}

export function AuthForm({
  className,
  formType,
  queryParams,
  appType,
}: AuthFormProps) {
  const { purpose, secret, type } = queryParams;

  const [identifier, setIdentifier] = useState(queryParams.identifier);
  const [isOpen, setIsOpen] = useState(false);
  const [otpMeta, setOtpMeta] = useState<OtpMeta>();
  const [isLoading, setIsLoading] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>(purpose);
  const [redirectUrl, setRedirectUrl] = useState<string>();

  const router = useRouter();

  const isWeb = appType === "web";
  const isDashboard = appType === "dashboard";
  const isSignIn = formType === "sign-in";
  const isSignUp = formType === "sign-up";
  const isPasswordFlow = formType.includes("password");
  const isSetPassword = formType === "set-password";

  const showSignupFields = isWeb && isSignUp;
  const allowSignup = isWeb;

  const schema = useMemo(
    () =>
      z.object({
        identifier: identifierSchema,
        ...((isSignIn || isSignUp || (isSetPassword && otpMeta?.valid)) && {
          password: passwordSchema,
        }),
        ...(showSignupFields && {
          firstName: nameSchema,
          lastName: nameSchema.optional(),
        }),
        ...(formType === "reset-password" &&
          otpMeta?.valid && {
            password: passwordSchema,
          }),
      }),
    [
      formType,
      isSignIn,
      isSignUp,
      isSetPassword,
      otpMeta?.valid,
      showSignupFields,
    ],
  );

  const form = useForm({
    defaultValues: {
      identifier,
      password: formType.includes("sign") ? "" : undefined,
      confirmPassword: isSignUp || !isSignIn ? "" : undefined,
      firstName: "",
      lastName: undefined,
      rememberDevice: true,
    } as (SignInType & SignUpType) & {
      confirmPassword?: string;
      rememberDevice?: boolean;
    },
    validators: {
      onSubmit: schema as any,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      try {
        let message = `${formType} successfully!`;

        if (isSignUp && allowSignup) {
          setOtpPurpose("verifyIdentifier");
          const res = await signUp(value as SignUpType);
          message = res.message;
          setRedirectUrl("/auth/sign-in");
          setIsOpen(true);
        } else if (isSignIn) {
          const res = await signIn({
            ...value,
            password: value.password!,
          });

          message = res.message;

          if (isWeb) {
            setRedirectUrl("/");
          } else {
            setRedirectUrl(`/${res.data.role}`);
          }

          if (res.action === "verifyMfa") {
            setOtpPurpose("verifyMfa");
            setIsOpen(true);
          }
        } else if (isPasswordFlow) {
          if (!otpMeta?.token) {
            const nextPurpose: OtpPurpose =
              formType === "set-password" ? "setPassword" : "resetPassword";

            setOtpPurpose(nextPurpose);

            const res = await requestOtp({
              identifier,
              purpose: nextPurpose,
            });

            message = res.message;
            setIsOpen(true);
          } else {
            const res = await resetPassword({
              identifier,
              purpose: otpPurpose,
              secret: otpMeta.token,
              newPassword: value.password!,
            });

            message = res.message;
            setRedirectUrl("/auth/sign-in");
          }
        }

        toast.success(message);
      } catch (err: any) {
        if (err?.action === "verifyIdentifier") {
          setOtpPurpose("verifyIdentifier");
          setRedirectUrl("/auth/sign-in");
          setIsOpen(true);
        }

        toast.error(`${formType} Error`, {
          description: err?.message,
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  const formIdentifier = useStore(
    form.store,
    (state) => state.values.identifier,
  );

  useEffect(() => {
    if (!secret) return;

    const verifySecret = async () => {
      try {
        const res = await validateOtp({
          identifier,
          purpose: otpPurpose,
          secret,
          type,
        });

        setOtpMeta({
          valid: true,
          token: res.data?.secret,
        });

        toast.success(res.message);
      } catch (err: any) {
        toast.error("Failed to verify Otp", {
          description: err?.message,
        });
      }
    };

    void verifySecret();
  }, [identifier, otpPurpose, secret, type]);

  useEffect(() => {
    if (otpMeta?.valid) {
      form.reset({
        firstName: "",
        lastName: undefined,
        identifier,
        password: "",
        confirmPassword: "",
      });
    }
  }, [identifier, form, otpMeta?.valid]);

  useEffect(() => {
    if (redirectUrl && !isOpen) {
      router.push(redirectUrl);
    }
  }, [redirectUrl, isOpen, router]);

  useEffect(() => {
    if (formIdentifier) {
      setIdentifier(formIdentifier);
    }
  }, [formIdentifier]);

  const heading = (() => {
    if (isSignUp && isWeb) return "Create your account";
    if (isSignIn) return "Welcome Back";
    return formType.split("-").join(" ");
  })();

  const subheading = (() => {
    if (isSignUp && isWeb) return "Create your care-sync account";
    if (isSignIn) return `Login to your ${appName.default} account`;
    return "Enter your identifier to continue";
  })();

  const submitLabel = (() => {
    if (isSignUp && isWeb) return "Create Account";
    if (isSignIn) return "Login";
    if (otpMeta?.valid) return formType.split("-").join(" ");
    return "Send Otp";
  })();

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form form={form} className="py-6 px-4 md:p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              {isSignIn && (
                <Link
                  href="#"
                  className="flex flex-col items-center gap-2 font-medium"
                >
                  <GalleryVerticalEnd className="size-6" />
                  <span className="sr-only">{appName.default}</span>
                </Link>
              )}

              <h1 className="text-2xl font-bold capitalize">{heading}</h1>

              <p className="text-muted-foreground text-sm text-balance">
                {subheading}
              </p>
            </div>

            {showSignupFields && (
              <div className="grid grid-cols-2 gap-4">
                <InputField form={form} name="firstName" label="First Name" />
                <InputField form={form} name="lastName" label="Last Name" />
              </div>
            )}

            <InputField
              form={form}
              name="identifier"
              label="Email / Phone"
              type="text"
              disabled={!!otpMeta?.valid}
            />

            <div
              className={cn(
                "grid gap-4",
                showSignupFields ? "grid-cols-2" : "",
              )}
            >
              {(!isPasswordFlow || !!otpMeta?.valid) && (
                <>
                  <InputField
                    form={form}
                    name="password"
                    type="password"
                    placeholder="Password"
                    label={
                      <>
                        <span>Password</span>
                        {isSignIn && (
                          <Link
                            href="reset-password"
                            className="ml-auto text-sm text-muted-foreground underline-offset-2 hover:underline"
                          >
                            Forgot your password?
                          </Link>
                        )}
                      </>
                    }
                  />

                  {!isSignIn && (
                    <InputField
                      form={form}
                      name="confirmPassword"
                      type="password"
                      label="Confirm Password"
                      validators={{
                        onChangeListenTo: ["password"],
                        onChange: ({ value, fieldApi }) => {
                          if (
                            value !== fieldApi.form.getFieldValue("password")
                          ) {
                            return { message: "Passwords do not match" };
                          }
                          return undefined;
                        },
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {isSignIn && (
              <InputField
                form={form}
                type="checkbox"
                name="rememberDevice"
                label="Remember Me"
              />
            )}

            <form.Subscribe selector={(state: any) => state.canSubmit}>
              {(canSubmit: boolean) => (
                <Button
                  size="lg"
                  disabled={!canSubmit || isLoading}
                  type="submit"
                  className="capitalize"
                >
                  {submitLabel}
                  {isLoading && <LoaderCircle className="animate-spin" />}
                </Button>
              )}
            </form.Subscribe>

            <SocialAuthField />

            <FieldDescription className="flex-center gap-2">
              {isDashboard && isSignIn ? (
                <span>Need access? Contact an administrator.</span>
              ) : isSignUp ? (
                <>
                  <span>Already have an account?</span>
                  <Link href="sign-in">Sign in</Link>
                </>
              ) : isSignIn && isWeb ? (
                <>
                  <span>Don't have an account?</span>
                  <Link href="sign-up">Sign Up</Link>
                </>
              ) : (
                <>
                  <span>Back to Sign in</span>
                  <Link href="sign-in">Sign in</Link>
                </>
              )}
            </FieldDescription>
          </Form>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80"
              alt="Child in a warm, supportive learning environment"
              fill
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-6 text-white">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/75">
                {appName.default}
              </p>
              <h2 className="max-w-xs text-2xl font-semibold leading-tight">
                Thoughtful care for every child and family.
              </h2>
              <p className="max-w-sm text-sm leading-6 text-white/80">
                Secure access to appointments, updates, and support from one place.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <OtpModal
        open={isOpen}
        setOpen={setIsOpen}
        identifier={identifier}
        purpose={otpPurpose}
        redirectUrl={redirectUrl}
        setOtpMeta={setOtpMeta}
      />

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
