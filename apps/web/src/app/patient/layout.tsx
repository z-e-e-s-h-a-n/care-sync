import type { AppLayoutProps } from "@workspace/contracts";
import DashboardLayout from "@workspace/ui/shared/DashboardLayout";
import PatientOverviewSkeleton from "@/components/skeletons/PatientOverviewSkeleton";

const Layout = ({ children }: AppLayoutProps) => {
  return (
    <DashboardLayout appType="web" skeleton={<PatientOverviewSkeleton />}>
      {children}
    </DashboardLayout>
  );
};

export default Layout;
