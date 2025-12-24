import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  iconColor?: string;
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "info";
  delay?: number;
  compact?: boolean;
}

const variantStyles = {
  default: {
    icon: "bg-muted text-muted-foreground",
    card: "",
  },
  primary: {
    icon: "bg-primary/10 text-primary",
    card: "hover:border-primary/30",
  },
  success: {
    icon: "bg-success/10 text-success",
    card: "hover:border-success/30",
  },
  warning: {
    icon: "bg-warning/10 text-warning",
    card: "hover:border-warning/30",
  },
  destructive: {
    icon: "bg-destructive/10 text-destructive",
    card: "hover:border-destructive/30",
  },
  info: {
    icon: "bg-info/10 text-info",
    card: "hover:border-info/30",
  },
};

export function StatCard({
  title,
  value,
  unit,
  change,
  trend,
  icon: Icon,
  iconColor,
  variant = "default",
  delay = 0,
  compact = false,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "hover-lift cursor-default border-border/50 bg-card overflow-hidden group",
          styles.card
        )}
      >
        <CardContent className={cn("relative", compact ? "p-4" : "p-6")}>
          {/* Subtle hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              {Icon && (
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={cn(
                    "p-2.5 rounded-xl transition-shadow duration-300 group-hover:shadow-soft",
                    iconColor || styles.icon
                  )}
                >
                  <Icon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
                </motion.div>
              )}

              {change && (
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-sm font-medium",
                    trend === "up" && "text-success",
                    trend === "down" && "text-destructive",
                    trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {change}
                  {trend === "up" && <TrendingUp className="h-3.5 w-3.5" />}
                  {trend === "down" && <TrendingDown className="h-3.5 w-3.5" />}
                </div>
              )}
            </div>

            <div className={cn(compact ? "mt-3" : "mt-4")}>
              <p className={cn("font-bold font-heading", compact ? "text-xl" : "text-2xl")}>
                {value}
              </p>
              {unit && (
                <p className="text-xs text-muted-foreground">{unit}</p>
              )}
            </div>

            <p className={cn("text-muted-foreground", compact ? "text-xs mt-1" : "text-sm mt-2")}>
              {title}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function StatCardGrid({ children, columns = 4 }: StatCardGridProps) {
  const colsClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", colsClass[columns])}>
      {children}
    </div>
  );
}
