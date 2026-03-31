import type { ReactNode } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/card";
import { cn } from "../lib/utils";

interface SectionCardProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

const SectionCard = ({
  title,
  description,
  action,
  footer,
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  titleClassName,
  descriptionClassName,
}: SectionCardProps) => {
  const hasHeader = title || description || action;

  return (
    <Card className={className}>
      {hasHeader ? (
        <CardHeader className={headerClassName}>
          <div className="space-y-2">
            {title ? (
              <CardTitle className={titleClassName}>{title}</CardTitle>
            ) : null}
            {description ? (
              <CardDescription className={descriptionClassName}>
                {description}
              </CardDescription>
            ) : null}
          </div>
          {action ? <CardAction>{action}</CardAction> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
      {footer ? (
        <CardFooter className={footerClassName}>{footer}</CardFooter>
      ) : null}
    </Card>
  );
};

export default SectionCard;
