import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

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
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-2 text-3xl font-semibold tracking-tight">
            {value}
          </CardTitle>
        </div>
        <Badge variant="secondary" className={toneClassMap[tone]}>
          Live
        </Badge>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        {helper}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
