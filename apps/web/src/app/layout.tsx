import "@workspace/ui/globals.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import ProviderWrapper from "@workspace/ui/provider-wrapper";
import type { AppLayoutProps } from "@workspace/contracts";

const primaryFont = Plus_Jakarta_Sans({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const secondaryFont = Inter({
  variable: "--font-secondary",
  subsets: ["latin"],
});

const RootLayout = ({ children }: AppLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${primaryFont.variable} ${secondaryFont.variable} font-sans antialiased`}
      >
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
