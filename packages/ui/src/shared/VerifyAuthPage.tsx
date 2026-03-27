"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CircleCheckIcon, LoaderCircle, OctagonXIcon } from "lucide-react";
import { validateOtp, verifyUpdateIdentifier } from "@workspace/sdk/auth";
import { cn } from "@workspace/ui/lib/utils";
import { Card, CardContent } from "@workspace/ui/components/card";
import type { OtpPurpose, OtpType } from "@workspace/contracts";

type VerificationStatus = "loading" | "success" | "error";
const VALID_PURPOSES = new Set(["verifyIdentifier", "updateIdentifier"]);

export interface VerifyAuthProps {
  identifier: string;
  newIdentifier?: string;
  purpose: OtpPurpose;
  secret: string;
  type?: OtpType;
}

function VerifyAuthPage({
  identifier,
  newIdentifier,
  purpose,
  secret,
  type,
}: VerifyAuthProps) {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>("loading");

  useEffect(() => {
    if (!VALID_PURPOSES.has(purpose)) {
      toast.error("Invalid verification purpose");
      router.replace("/auth/sign-in");
    }
  }, [purpose, router]);

  useEffect(() => {
    const verify = async () => {
      try {
        const isUpdateIdentifier =
          purpose === "updateIdentifier" && newIdentifier;

        const res = isUpdateIdentifier
          ? await verifyUpdateIdentifier({
              identifier,
              newIdentifier,
              purpose,
              secret,
              type,
            })
          : await validateOtp({ identifier, purpose, secret, type });

        toast.success(res.message);
        setStatus("success");

        setTimeout(() => {
          router.replace("/auth/sign-in");
        }, 1200);
      } catch {
        toast.error("Verification failed");
        setStatus("error");

        setTimeout(() => {
          router.replace("/auth/sign-in");
        }, 1200);
      }
    };

    void verify();
  }, [identifier, newIdentifier, purpose, secret, type, router]);

  const StatusConfig = {
    loading: {
      icon: LoaderCircle,
      message: "Verifying your request…",
      className: "",
    },
    success: {
      icon: CircleCheckIcon,
      message: "Verification successful. Redirecting…",
      className: "text-green-500",
    },
    error: {
      icon: OctagonXIcon,
      message: "This verification link is invalid or expired. Redirecting…",
      className: "text-destructive",
    },
  } as const;

  const { icon: Icon, message, className } = StatusConfig[status];

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardContent
        className={cn("flex-center flex-col gap-4 py-10", className)}
      >
        <Icon
          className={cn("size-8", status === "loading" && "animate-spin")}
        />
        <p className="text-center">{message}</p>
      </CardContent>
    </Card>
  );
}

export default VerifyAuthPage;
