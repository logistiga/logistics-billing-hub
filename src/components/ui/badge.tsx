import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-soft",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 hover:shadow-soft",
        success: "border-transparent bg-success text-success-foreground shadow-xs hover:bg-success/90 hover:shadow-soft",
        warning: "border-transparent bg-warning text-warning-foreground shadow-xs hover:bg-warning/90 hover:shadow-soft",
        info: "border-transparent bg-info text-info-foreground shadow-xs hover:bg-info/90 hover:shadow-soft",
        outline: "text-foreground border-border hover:bg-accent hover:border-accent-foreground/20",
        ghost: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
        gradient: "border-transparent gradient-primary text-primary-foreground shadow-xs hover:shadow-colored",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
