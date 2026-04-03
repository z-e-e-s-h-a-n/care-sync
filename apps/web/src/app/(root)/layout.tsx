import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import type { AppLayoutProps } from "@workspace/contracts";

const Layout = ({ children }: AppLayoutProps) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
