'use client';

import React from 'react';

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-white/10 text-white border-white/20',
    success: 'bg-green-500/10 text-green-200 border-green-500/30',
    warning: 'bg-yellow-500/10 text-yellow-200 border-yellow-500/30',
    danger: 'bg-red-500/10 text-red-200 border-red-500/30',
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-xl ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
