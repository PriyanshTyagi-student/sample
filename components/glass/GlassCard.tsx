'use client';

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 ${className}`}
    >
      {children}
    </div>
  );
};
