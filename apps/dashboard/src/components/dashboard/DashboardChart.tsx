"use client";

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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type ChartRow = Record<string, unknown>;

export interface DashboardAreaChartCardProps {
  title: string;
  description: string;
  config: ChartConfig;
  data: ChartRow[];
  valueKey: string;
  gradientId: string;
  heightClassName?: string;
  datePayloadKey?: string;
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
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{area.title}</CardTitle>
          <CardDescription>{area.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={area.config}
            className={area.heightClassName ?? "h-80 w-full"}
          >
            <AreaChart accessibilityLayer data={area.data}>
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