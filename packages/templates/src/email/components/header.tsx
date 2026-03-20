import { Heading, Text } from "@react-email/components";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => (
  <>
    <Heading className="text-xl font-semibold text-gray-900 mb-1">
      {title}
    </Heading>
    {subtitle && <Text className="text-sm text-gray-500 mb-6">{subtitle}</Text>}
  </>
);
