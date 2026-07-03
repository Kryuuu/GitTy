// ============================================
// GitTy — Card Component
// ============================================
import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient";
  hover?: boolean;
}

export function Card({
  className,
  variant = "default",
  hover = false,
  children,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-surface-100 border border-surface-300/50",
    glass: "glass-card",
    gradient: "gradient-border bg-surface-100",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        variants[variant],
        hover &&
          "transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/5 hover:border-surface-400/70 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-zinc-400 mt-1", className)} {...props}>
      {children}
    </p>
  );
}
