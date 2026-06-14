"use client";

import React from "react";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "pending"
  | "completed"
  | "cancelled";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-500/20 text-slate-200 border border-slate-500/30",
  success:
    "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
  warning:
    "bg-amber-500/20 text-amber-200 border border-amber-500/30",
  danger: "bg-red-500/20 text-red-200 border border-red-500/30",
  info: "bg-blue-500/20 text-blue-200 border border-blue-500/30",
  pending:
    "bg-orange-500/20 text-orange-200 border border-orange-500/30",
  completed:
    "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
  cancelled: "bg-slate-500/20 text-slate-200 border border-slate-500/30",
};

export interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function GlassBadge({
  children,
  variant = "default",
  className = "",
}: GlassBadgeProps) {
  return (
    <span
      className={`
        px-3 py-1 rounded-full text-xs font-medium
        backdrop-blur-sm inline-block
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
