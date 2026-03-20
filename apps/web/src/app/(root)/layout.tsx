import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
