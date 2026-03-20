import { Text } from "@react-email/components";

interface GreetingProps {
  name?: string | null;
}

export const Greeting = ({ name }: GreetingProps) => (
  <Text className="text-base text-gray-900">
    Hello <strong>{name ?? "there"}</strong>,
  </Text>
);
