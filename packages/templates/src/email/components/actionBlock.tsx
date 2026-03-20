import { Section, Text, Button } from "@react-email/components";
import { NumericCode } from "./numericCode";
import { diffInMinutes } from "@workspace/shared/utils";
import type { Otp } from "@workspace/db/browser";

interface ActionBlockProps {
  link: string;
  label: string;
  otp?: Otp;
}

export const ActionBlock = ({ link, label, otp }: ActionBlockProps) => (
  <Section className="my-7 text-center">
    {otp?.type === "numericCode" ? (
      <>
        <Text className="text-sm text-gray-500">
          Use the verification code below
        </Text>
        <NumericCode code={otp.secret} />
        <Text className="text-xs text-gray-500 text-center">
          This code expires in {diffInMinutes(otp.expiresAt)} minutes.
        </Text>
        <Button
          href={link}
          className="inline-block px-5 py-3 bg-rose-600 text-white rounded-lg font-semibold no-underline"
        >
          {label}
        </Button>
      </>
    ) : (
      <Button
        href={link}
        className="inline-block px-5 py-3 bg-rose-600 text-white rounded-lg font-semibold no-underline"
      >
        {label}
      </Button>
    )}
  </Section>
);

