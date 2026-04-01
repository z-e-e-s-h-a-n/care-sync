"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";

import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type ChartRow = Record<string, unknown>;

type RangeValue = "7d" | "14d" | "30d";

const RANGE_OPTIONS: Array<{ value: RangeValue; label: string; days: number }> = [
  { value: "30d", label: "Next 30 days", days: 30 },
  { value: "14d", label: "Next 14 days", days: 14 },
  { value: "7d", label: "Next 7 days", days: 7 },
];

export interface DashboardAreaChartCardProps {
  title: string;
  description: string;
  config: ChartConfig;
  data: ChartRow[];
  valueKey: string;
  gradientId: string;
  heightClassName?: string;
  datePayloadKey?: string;
  rangeMode?: "head" | "tail";
}

export interface DashboardBarChartCardProps {
  title: string;
  description: string;
  config: ChartConfig;
  data: ChartRow[];
  keys: [string, string];
  heightClassName?: string;
  datePayloadKey?: string;
}

export interface DashboardPieChartCardProps {
  title: string;
  description: string;
  data: { label: string; value: number }[];
  emptyMessage: string;
  formatLabel?: (value: string) => string;
}

interface DashboardChartProps {
  area: DashboardAreaChartCardProps;
  bar: DashboardBarChartCardProps;
  pie: DashboardPieChartCardProps;
}

export default function DashboardChart({ area, bar, pie }: DashboardChartProps) {
  const isMobile = useIsMobile();
  const showAreaRange = area.data.length > 7;

  const availableRanges = React.useMemo(() => {
    if (!showAreaRange) {
      return [{ value: "7d", label: `Next ${area.data.length} days`, days: area.data.length }];
    }

    return RANGE_OPTIONS.filter((range) => range.days <= area.data.length);
  }, [area.data.length, showAreaRange]);

  const [areaRange, setAreaRange] = React.useState<RangeValue>(
    availableRanges.some((range) => range.value === "14d") ? "14d" : "7d",
  );

  React.useEffect(() => {
    if (!showAreaRange) {
      return;
    }

    if (isMobile) {
      setAreaRange("7d");
    }
  }, [isMobile, showAreaRange]);

  const selectedAreaRangeDays =
    availableRanges.find((range) => range.value === areaRange)?.days ?? 7;
  const maxAreaDays = Math.min(selectedAreaRangeDays, area.data.length);
  const normalizedAreaData =
    area.rangeMode === "tail"
      ? area.data.slice(-maxAreaDays)
      : area.data.slice(0, maxAreaDays);

  const pieConfig = Object.fromEntries(
    pie.data.map((item, index) => [
      item.label,
      {
        label: pie.formatLabel ? pie.formatLabel(item.label) : item.label,
        color: CHART_COLORS[index % CHART_COLORS.length],
      },
    ]),
  ) satisfies ChartConfig;

  return (
    <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
      <Card className="@container/card shadow-sm">
        <CardHeader>
          <CardTitle>{area.title}</CardTitle>
          <CardDescription>{area.description}</CardDescription>
          <CardAction>
            {showAreaRange ? (
              <>
                <ToggleGroup
                  type="single"
                  value={areaRange}
                  onValueChange={(value) =>
                    value && setAreaRange(value as RangeValue)
                  }
                  variant="outline"
                  className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
                >
                  {availableRanges.map((range) => (
                    <ToggleGroupItem key={range.value} value={range.value}>
                      {range.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <Select
                  value={areaRange}
                  onValueChange={(value) => setAreaRange(value as RangeValue)}
                >
                  <SelectTrigger
                    className="flex w-40 @[767px]/card:hidden"
                    size="sm"
                    aria-label="Select a time range"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {availableRanges.map((range) => (
                      <SelectItem
                        key={range.value}
                        value={range.value}
                        className="rounded-lg"
                      >
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Next {area.data.length} days
              </span>
            )}
          </CardAction>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={area.config}
            className={area.heightClassName ?? "h-80 w-full"}
          >
            <AreaChart accessibilityLayer data={normalizedAreaData}>
              <defs>
                <linearGradient
                  id={area.gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${area.valueKey})`}
                    stopOpacity={0.75}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${area.valueKey})`}
                    stopOpacity={0.12}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(_, payload) =>
                      String(
                        payload?.[0]?.payload?.[
                          area.datePayloadKey ?? "date"
                        ] ?? "",
                      )
                    }
                  />
                }
              />
              <Area
                type="monotone"
                dataKey={area.valueKey}
                stroke={`var(--color-${area.valueKey})`}
                fill={`url(#${area.gradientId})`}
                strokeWidth={2.5}
                activeDot={{ r: 4 }}
              />
              <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{bar.title}</CardTitle>
            <CardDescription>{bar.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={bar.config}
              className={bar.heightClassName ?? "h-64 w-full"}
            >
              <BarChart accessibilityLayer data={bar.data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dashed"
                      labelFormatter={(_, payload) =>
                        String(
                          payload?.[0]?.payload?.[
                            bar.datePayloadKey ?? "date"
                          ] ?? "",
                        )
                      }
                    />
                  }
                />
                <Bar
                  dataKey={bar.keys[0]}
                  fill={`var(--color-${bar.keys[0]})`}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey={bar.keys[1]}
                  fill={`var(--color-${bar.keys[1]})`}
                  radius={[6, 6, 0, 0]}
                />
                <ChartLegend
                  content={<ChartLegendContent />}
                  verticalAlign="bottom"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{pie.title}</CardTitle>
            <CardDescription>{pie.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {pie.data.length ? (
              <>
                <ChartContainer config={pieConfig} className="h-56 w-full">
                  <PieChart accessibilityLayer>
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel nameKey="label" />}
                    />
                    <Pie
                      data={pie.data}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={52}
                      outerRadius={84}
                      paddingAngle={4}
                    >
                      {pie.data.map((item, index) => (
                        <Cell
                          key={item.label}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="grid gap-3">
                  {pie.data.map((item, index) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        <span>
                          {pie.formatLabel
                            ? pie.formatLabel(item.label)
                            : item.label}
                        </span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <DashboardEmptyState message={pie.emptyMessage} />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}