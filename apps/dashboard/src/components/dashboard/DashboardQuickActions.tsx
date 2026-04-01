import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { MoveRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export interface DashboardQuickAction {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface DashboardFocusItem {
  label: string;
  value: React.ReactNode;
}

interface DashboardQuickActionsProps {
  title: string;
  description: string;
  actions: DashboardQuickAction[];
  focusItems: DashboardFocusItem[];
}

export default function DashboardQuickActions({
  title,
  description,
  actions,
  focusItems,
}: DashboardQuickActionsProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-2xl border border-border/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <MoveRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-4 font-medium">{action.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {action.description}
              </p>
            </Link>
          );
        })}
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3 border-t pt-6">
        {focusItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}