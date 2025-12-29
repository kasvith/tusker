import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "error" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-accent text-white": variant === "default",
          "bg-bg-elevated text-text-secondary": variant === "secondary",
          "bg-success/20 text-success": variant === "success",
          "bg-warning/20 text-warning": variant === "warning",
          "bg-error/20 text-error": variant === "error",
          "border border-border-default text-text-secondary": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
