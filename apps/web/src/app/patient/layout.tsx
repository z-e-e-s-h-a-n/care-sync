import type { AppLayoutProps } from "@workspace/contracts";
import DashboardLayout from "@workspace/ui/shared/DashboardLayout";

const Layout = ({ children }: AppLayoutProps) => {
  return <DashboardLayout appType="web">{children}</DashboardLayout>;
};

export default Layout;
