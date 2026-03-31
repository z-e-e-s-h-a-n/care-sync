import type { LucideIcon } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

const STAT_ACCENTS = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
} as const;

const buildSparkline = (values: number[]) =>
  values.length ? values : [0, 0, 0, 0, 0, 0, 0];

interface OverviewStatCardProps {
  label: string;
  value: string | number;
  helper: string;
  badge: string;
  trendLabel: string;
  bars: number[];
  icon: LucideIcon;
  tone?: keyof typeof STAT_ACCENTS;
}

const OverviewStatCard = ({
  label,
  value,
  helper,
  badge,
  trendLabel,
  bars,
  icon: Icon,
  tone = "default",
}: OverviewStatCardProps) => {
  const normalizedBars = buildSparkline(bars);
  const maxBarValue = Math.max(...normalizedBars, 0);

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <span
              className={`flex size-11 items-center justify-center rounded-2xl ${STAT_ACCENTS[tone]}`}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <CardDescription>{label}</CardDescription>
              <CardTitle className="mt-2 text-3xl font-semibold tracking-tight">
                {value}
              </CardTitle>
            </div>
          </div>
          <CardAction>
            <Badge variant="secondary" className={STAT_ACCENTS[tone]}>
              {badge}
            </Badge>
          </CardAction>
        </div>
      </CardHeader>
      <CardFooter className="items-end justify-between gap-4 border-t border-border/50 pt-4">
        <div className="space-y-1.5">
          <div className="text-sm font-medium">{trendLabel}</div>
          <p className="max-w-56 text-sm text-muted-foreground">{helper}</p>
        </div>
        <div className="flex h-14 items-end gap-1.5">
          {normalizedBars.map((bar, index) => (
            <span
              key={`${label}-${index}`}
              className="w-2 rounded-full"
              style={{
                height: `${maxBarValue > 0 ? Math.max(18, Math.round((bar / maxBarValue) * 52)) : 22}px`,
                background:
                  "linear-gradient(180deg, rgba(59,130,246,0.88) 0%, rgba(59,130,246,0.18) 100%)",
              }}
            />
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default OverviewStatCard;
