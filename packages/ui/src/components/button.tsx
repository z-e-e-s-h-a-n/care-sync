import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "@workspace/ui/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        secondary: "",
        success: "",
        warning: "",
        info: "",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-xs hover:opacity-90 cta-shine",
      },
      appearance: {
        solid: "",
        soft: "",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-full",
      },
    },
    compoundVariants: [
      // default
      {
        variant: "default",
        appearance: "solid",
        className:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
      },
      {
        variant: "default",
        appearance: "soft",
        className: "bg-primary/10 text-primary hover:bg-primary/15",
      },

      // destructive
      {
        variant: "destructive",
        appearance: "solid",
        className:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90",
      },
      {
        variant: "destructive",
        appearance: "soft",
        className: "bg-destructive/10 text-destructive hover:bg-destructive/15",
      },

      // secondary
      {
        variant: "secondary",
        appearance: "solid",
        className:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
      },
      {
        variant: "secondary",
        appearance: "soft",
        className:
          "bg-secondary/10 text-secondary-foreground hover:bg-secondary/15",
      },

      // success
      {
        variant: "success",
        appearance: "solid",
        className:
          "bg-success text-success-foreground shadow-xs hover:bg-success/90",
      },
      {
        variant: "success",
        appearance: "soft",
        className: "bg-success/10 text-success hover:bg-success/15",
      },

      // warning
      {
        variant: "warning",
        appearance: "solid",
        className:
          "bg-warning text-warning-foreground shadow-xs hover:bg-warning/90",
      },
      {
        variant: "warning",
        appearance: "soft",
        className: "bg-warning/10 text-warning hover:bg-warning/15",
      },

      // info
      {
        variant: "info",
        appearance: "solid",
        className: "bg-info text-info-foreground shadow-xs hover:bg-info/90",
      },
      {
        variant: "info",
        appearance: "soft",
        className: "bg-info/10 text-info hover:bg-info/15",
      },

      // ignore appearance
      {
        variant: "outline",
        appearance: "solid",
        className:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      {
        variant: "outline",
        appearance: "soft",
        className:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      {
        variant: "ghost",
        appearance: "solid",
        className: "hover:bg-accent hover:text-accent-foreground",
      },
      {
        variant: "ghost",
        appearance: "soft",
        className: "hover:bg-accent hover:text-accent-foreground",
      },
      {
        variant: "link",
        appearance: "solid",
        className: "text-primary underline-offset-4 hover:underline",
      },
      {
        variant: "link",
        appearance: "soft",
        className: "text-primary underline-offset-4 hover:underline",
      },
      {
        variant: "gradient",
        appearance: "solid",
        className:
          "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-xs hover:opacity-90",
      },
      {
        variant: "gradient",
        appearance: "soft",
        className:
          "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-xs hover:opacity-90",
      },
    ],
    defaultVariants: {
      variant: "default",
      appearance: "solid",
      size: "default",
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
    asChild?: boolean;
    pulseDelay?: number;
    target?: React.HTMLAttributeAnchorTarget;
    href?: string;
    rel?: string;
    prefetch?: boolean;
  };

function Button({
  className,
  variant,
  appearance,
  size,
  asChild = false,
  href,
  pulseDelay,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  const classes = cn(
    pulseDelay && "cta-pulse",
    buttonVariants({ variant, appearance, size }),
    className,
  );

  return href ? (
    <Slot
      data-slot="button"
      className={classes}
      style={pulseDelay ? { animationDelay: `${pulseDelay}ms` } : undefined}
      {...props}
    >
      <Link href={href}>{props.children}</Link>
    </Slot>
  ) : (
    <Comp
      data-slot="button"
      type="button"
      className={classes}
      style={pulseDelay ? { animationDelay: `${pulseDelay}ms` } : undefined}
      {...props}
    />
  );
}

export { Button, buttonVariants, type ButtonVariants, type ButtonProps };
