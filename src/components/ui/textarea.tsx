// ============================================
// GitTy — Textarea Component
// ============================================
"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-zinc-300"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl bg-surface-100 border border-surface-400/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50",
            "transition-all duration-200 resize-none min-h-[100px]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500/50 focus:ring-red-500/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export { Textarea };
