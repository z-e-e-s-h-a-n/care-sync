import {
  Html,
  Body,
  Container,
  Hr,
  Text,
  Preview,
  Tailwind,
} from "@react-email/components";
import { appName } from "@workspace/shared/constants";

interface LayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export const Layout = ({ children, previewText }: LayoutProps) => (
  <Html>
    {previewText && <Preview>{previewText}</Preview>}
    <Tailwind>
      <Body className="bg-gray-50 font-sans">
        <Container className="mx-auto max-w-150 bg-white rounded-lg border border-gray-200 p-8 my-8">
          {children}
          <Hr className="my-8 border-gray-200" />
          <Text className="text-xs text-gray-500">
            Sent by <strong>{appName.default}</strong>
            <br />© {new Date().getFullYear()} {appName.default}
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
