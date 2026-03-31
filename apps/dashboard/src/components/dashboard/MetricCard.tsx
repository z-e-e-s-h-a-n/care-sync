import { Badge } from "@workspace/ui/components/badge";
import StatCard from "@workspace/ui/shared/StatCard";

interface MetricCardProps {
  label: string;
  value: string | number;
  helper: string;
  tone?: "default" | "success" | "warning";
}

const toneClassMap = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
} satisfies Record<NonNullable<MetricCardProps["tone"]>, string>;

const MetricCard = ({
  label,
  value,
  helper,
  tone = "default",
}: MetricCardProps) => {
  return (
    <StatCard
      label={label}
      value={value}
      helper={helper}
      className="border-border/60 shadow-sm"
      action={
        <Badge variant="secondary" className={toneClassMap[tone]}>
          Live
        </Badge>
      }
    />
  );
};

export default MetricCard;
