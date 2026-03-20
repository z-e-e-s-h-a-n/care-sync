"use client";
import DashboardStats from "@/components/layout/DashboardStats";
import DashboardChart from "@/components/layout/DashboardChart";

const DashboardPage = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DashboardStats />
          <div className="px-4 lg:px-6">
            <DashboardChart />
          </div>
          {/* <DataTable data={data} /> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
