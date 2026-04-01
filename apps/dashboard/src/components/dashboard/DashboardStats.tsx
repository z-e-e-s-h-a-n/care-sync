import DashboardStatCard, {
  type DashboardStatCardProps,
} from "@/components/dashboard/DashboardStatCard";

interface DashboardStatsProps {
  stats: DashboardStatCardProps[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <DashboardStatCard key={stat.label} {...stat} />
      ))}
    </section>
  );
}