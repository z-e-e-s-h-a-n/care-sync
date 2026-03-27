import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { AppLayoutProps } from "@workspace/contracts";
import { FloatingCtas } from "@/components/FloatingCtas";

const Layout = ({ children }: AppLayoutProps) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingCtas />
    </>
  );
};

export default Layout;
