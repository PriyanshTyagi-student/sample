'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GlassEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const GlassEmptyState: React.FC<GlassEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center">
      {Icon && <Icon className="w-16 h-16 text-white/30 mb-4" />}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/60 mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
