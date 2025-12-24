import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatBadge {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "destructive" | "info";
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  badges?: StatBadge[];
  children?: React.ReactNode;
  gradient?: boolean;
  pattern?: boolean;
}

const variantStyles = {
  default: "bg-muted/80 text-muted-foreground",
  success: "bg-success/15 text-success border border-success/20",
  warning: "bg-warning/15 text-warning border border-warning/20",
  destructive: "bg-destructive/15 text-destructive border border-destructive/20",
  info: "bg-info/15 text-info border border-info/20",
};

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  badges,
  children,
  gradient = true,
  pattern = true,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-xl p-6 mb-6",
        gradient
          ? "bg-gradient-to-br from-card via-card to-accent/30 border border-border/50"
          : "bg-card border border-border/50"
      )}
    >
      {/* Background pattern */}
      {pattern && (
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="header-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#header-grid)" />
          </svg>
        </div>
      )}

      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left section: Icon + Title */}
        <div className="flex items-start gap-4">
          {Icon && (
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={cn(
                "p-3 rounded-xl bg-primary/10 shadow-soft",
                iconColor
              )}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          )}
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl font-heading font-bold text-foreground"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground mt-1"
              >
                {subtitle}
              </motion.p>
            )}
            
            {/* Stat badges */}
            {badges && badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2 mt-3"
              >
                {badges.map((badge, index) => (
                  <motion.span
                    key={badge.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      variantStyles[badge.variant || "default"]
                    )}
                  >
                    <span className="opacity-70">{badge.label}:</span>
                    <span className="font-semibold">{badge.value}</span>
                  </motion.span>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Right section: Actions */}
        {children && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 sm:gap-3"
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
