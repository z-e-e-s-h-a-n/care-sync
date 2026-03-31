import type { ReactNode } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";
import { cn } from "../lib/utils";

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  action?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  labelVariant?: "description" | "title";
  valueInContent?: boolean;
}

const StatCard = ({
  label,
  value,
  helper,
  action,
  className,
  headerClassName,
  contentClassName,
  labelClassName,
  valueClassName,
  labelVariant = "description",
  valueInContent = false,
}: StatCardProps) => {
  const defaultValueClassName =
    labelVariant === "description"
      ? "text-3xl font-semibold tracking-tight"
      : "text-2xl font-semibold";

  const renderLabel = () => {
    if (labelVariant === "title") {
      return (
        <CardTitle className={cn("text-base", labelClassName)}>
          {label}
        </CardTitle>
      );
    }

    return <CardDescription className={labelClassName}>{label}</CardDescription>;
  };

  const renderValue = (className?: string) => {
    if (labelVariant === "description") {
      return <CardTitle className={cn(className, valueClassName)}>{value}</CardTitle>;
    }

    return <div className={cn(className, valueClassName)}>{value}</div>;
  };

  return (
    <Card className={className}>
      <CardHeader className={headerClassName}>
        <div>
          {renderLabel()}
          {!valueInContent
            ? renderValue(cn("mt-2", defaultValueClassName))
            : null}
        </div>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      {valueInContent || helper ? (
        <CardContent
          className={cn(
            valueInContent ? "space-y-2" : "pt-0 text-sm text-muted-foreground",
            contentClassName,
          )}
        >
          {valueInContent ? renderValue(defaultValueClassName) : null}
          {helper ? (
            <div
              className={cn(
                valueInContent ? "text-sm text-muted-foreground" : undefined,
              )}
            >
              {helper}
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
};

export default StatCard;
