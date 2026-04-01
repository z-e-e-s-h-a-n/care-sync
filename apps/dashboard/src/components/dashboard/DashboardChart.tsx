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

type HistoryRangeValue = "7d" | "30d" | "90d";

const HISTORY_RANGES: Array<{
  value: HistoryRangeValue;
  label: string;
  days: number;
}> = [
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "7d", label: "Last 7 days", days: 7 },
];

function isIsoDay(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatIsoDay(value: string) {
  const date = new Date(`${value}T00:00:00Z`);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function addIsoDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function weekdayShort(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function safeNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

function buildWeekdayForecast(options: {
  history: ChartRow[];
  dateKey: string;
  valueKey: string;
  days: number;
}) {
  const { history, dateKey, valueKey, days } = options;

  const weekdayBuckets: Array<{ total: number; count: number }> = Array.from(
    { length: 7 },
    () => ({ total: 0, count: 0 }),
  );

  for (const row of history) {
    const iso = row[dateKey];
    if (!isIsoDay(iso)) {
      continue;
    }

    const weekday = new Date(`${iso}T00:00:00Z`).getUTCDay();
    const bucket = weekdayBuckets[weekday];
    if (!bucket) continue;

    const value = safeNumber(row[valueKey]);
    bucket.total += value;
    bucket.count += 1;
  }

  const averages = weekdayBuckets.map((bucket) =>
    bucket.count ? bucket.total / bucket.count : 0,
  );

  const lastRow = history.at(-1);
  const lastIso = lastRow?.[dateKey];

  if (!isIsoDay(lastIso)) {
    return [];
  }

  return Array.from({ length: days }, (_, index) => {
    const iso = addIsoDays(lastIso, index + 1);
    const weekday = new Date(`${iso}T00:00:00Z`).getUTCDay();

    return {
      label: weekdayShort(iso),
      [dateKey]: iso,
      [valueKey]: Math.max(0, Math.round(averages[weekday] ?? 0)),
    } as ChartRow;
  });
}

export interface DashboardAreaChartCardProps {
  title: string;
  description: string;
  config: ChartConfig;
  data: ChartRow[];
  valueKey: string;
  gradientId: string;
  heightClassName?: string;
  dateKey?: string;
  secondaryValueKey?: string;
  forecastDays?: number;
}

export interface DashboardBarChartCardProps {
  title: string;
  description: string;
  config: ChartConfig;
  data: ChartRow[];
  keys: [string, string];
  heightClassName?: string;
  dateKey?: string;
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

  const availableRanges = React.useMemo(() => {
    const max = area.data.length;
    return HISTORY_RANGES.filter((range) => range.days <= max);
  }, [area.data.length]);

  const [historyRange, setHistoryRange] = React.useState<HistoryRangeValue>(
    availableRanges.some((range) => range.value === "30d") ? "30d" : "7d",
  );

  React.useEffect(() => {
    if (isMobile) {
      setHistoryRange("7d");
    }
  }, [isMobile]);

  const historyDays =
    availableRanges.find((range) => range.value === historyRange)?.days ?? 7;

  const dateKey = area.dateKey ?? "date";
  const historySlice = area.data.slice(-Math.min(historyDays, area.data.length));

  const combinedAreaData = React.useMemo(() => {
    if (!area.secondaryValueKey) {
      return historySlice;
    }

    const secondaryKey = area.secondaryValueKey;
    const baseHistory = historySlice.map((row, index) => {
      if (index !== historySlice.length - 1) {
        return { ...row, [secondaryKey]: null };
      }

      return {
        ...row,
        [secondaryKey]: safeNumber(row[area.valueKey]),
      };
    });

    const forecastDays = area.forecastDays ?? 14;
    const forecastHistory = area.data.slice(-Math.min(28, area.data.length));
    const forecastPoints = buildWeekdayForecast({
      history: forecastHistory,
      dateKey,
      valueKey: secondaryKey,
      days: forecastDays,
    }).map((row) => ({ ...row, [area.valueKey]: null }));

    return [...baseHistory, ...forecastPoints];
  }, [
    area.data,
    area.forecastDays,
    area.secondaryValueKey,
    area.valueKey,
    dateKey,
    historySlice,
  ]);

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
            <ToggleGroup
              type="single"
              value={historyRange}
              onValueChange={(value) =>
                value && setHistoryRange(value as HistoryRangeValue)
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
              value={historyRange}
              onValueChange={(value) => setHistoryRange(value as HistoryRangeValue)}
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
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={area.config}
            className={area.heightClassName ?? "aspect-auto h-80 w-full"}
          >
            <AreaChart accessibilityLayer data={combinedAreaData}>
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
                    stopOpacity={0.8}
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
                dataKey={dateKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                tickFormatter={(value) =>
                  isIsoDay(value)
                    ? new Date(`${value}T00:00:00Z`).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )
                    : String(value)
                }
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="min-w-40"
                    indicator="dot"
                    labelFormatter={(value) =>
                      isIsoDay(value) ? formatIsoDay(value) : String(value)
                    }
                  />
                }
              />
              <Area
                type="monotone"
                dataKey={area.valueKey}
                stroke={`var(--color-${area.valueKey})`}
                fill={`url(#${area.gradientId})`}
                strokeWidth={2}
                activeDot={{ r: 4 }}
                connectNulls={false}
              />
              {area.secondaryValueKey ? (
                <Area
                  type="monotone"
                  dataKey={area.secondaryValueKey}
                  stroke={`var(--color-${area.secondaryValueKey})`}
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  activeDot={{ r: 3 }}
                  connectNulls
                />
              ) : null}
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
              className={bar.heightClassName ?? "aspect-auto h-64 w-full"}
            >
              <BarChart accessibilityLayer data={bar.data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey={bar.dateKey ?? "date"}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) =>
                    isIsoDay(value)
                      ? new Date(`${value}T00:00:00Z`).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : String(value)
                  }
                />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      className="min-w-44"
                      indicator="dashed"
                      labelFormatter={(value) =>
                        isIsoDay(value) ? formatIsoDay(value) : String(value)
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