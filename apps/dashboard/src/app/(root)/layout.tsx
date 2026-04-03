import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import type { AppLayoutProps } from "@workspace/contracts";
import DashboardLayout from "@workspace/ui/shared/DashboardLayout";

const Layout = ({ children }: AppLayoutProps) => {
  return (
    <DashboardLayout appType="dashboard" skeleton={<DashboardSkeleton />}>
      {children}
    </DashboardLayout>
  );
};

export default Layout;
