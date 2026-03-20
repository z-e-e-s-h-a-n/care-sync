/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "./button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp";
import { useState } from "react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { requestOtp, validateOtp } from "@workspace/sdk/auth";
import { useRouter } from "next/navigation";
import type { RequestOtpType } from "@workspace/contracts/auth";

export interface OtpMeta {
  token?: string;
  valid?: boolean;
}

interface OtpModalProps extends RequestOtpType {
  open: boolean;
  setOpen: (o: boolean) => void;
  setOtpMeta: (m?: OtpMeta) => void;
  redirectUrl?: string;
}

const OtpModal = ({
  identifier,
  purpose,
  open,
  setOpen,
  setOtpMeta,
  redirectUrl,
}: OtpModalProps) => {
  const [secret, setSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await validateOtp({ identifier, purpose, secret });
      toast.success(res.message);

      setOtpMeta({ valid: true, token: res.meta?.secret });
      setOpen(false);
      if (redirectUrl) router.push(redirectUrl);
    } catch (err: any) {
      console.log("Failed to verify OTP", err.message);
      toast.error("Failed to verify OTP", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
      setSecret("");
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const res = await requestOtp({ identifier, purpose });
      setSecret("");
      toast.success(res.message);
    } catch (err: any) {
      console.log("Failed to Request OTP", err.message);
      toast.error("Failed to Request OTP", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="space-y-6 rounded-4xl">
        <AlertDialogHeader className="flex flex-col items-center">
          <AlertDialogTitle>Enter You OTP</AlertDialogTitle>
          <AlertDialogDescription>
            We&apos;ve sent a code to{" "}
            <span className="text-primary">{identifier}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <InputOTP maxLength={6} value={secret} onChange={setSecret}>
          <InputOTPGroup className="flex w-full justify-between gap-2 sm:gap-4!">
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="flex-center size-12 gap-5 rounded-xl! border-border/50 text-3xl font-medium text-primary shadow-drop-1 md:size-16!"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <AlertDialogFooter className="flex-col! w-full gap-4">
          <Button
            disabled={isLoading || secret.length !== 6}
            onClick={handleSubmit}
            className="rounded-4xl"
            size="lg"
          >
            Verify Otp
            {isLoading && <LoaderCircle className="animate-spin" />}
          </Button>
          <AlertDialogDescription className="flex-center gap-1">
            Didn&apos;t get a code?
            <button
              className="text-sm text-primary cursor-pointer"
              onClick={handleResendOTP}
              disabled={isLoading}
            >
              Resend OTP
            </button>
          </AlertDialogDescription>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;
