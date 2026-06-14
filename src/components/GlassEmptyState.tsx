"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface GlassEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function GlassEmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: GlassEmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-96 px-4">
      <div className="max-w-sm text-center">
        {/* Icon container */}
        <div className="flex justify-center mb-6">
          <div className="p-6 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
            <Icon className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-semibold text-white mb-2 text-balance">{title}</h3>

        {/* Description */}
        <p className="text-slate-400 mb-8 text-balance">{description}</p>

        {/* Action buttons */}
        {(action || secondaryAction) && (
          <div className="flex gap-3 justify-center flex-wrap">
            {action && (
              <button
                onClick={action.onClick}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                {action.label}
              </button>
            )}
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-all duration-200 border border-white/20 hover:border-white/30"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
