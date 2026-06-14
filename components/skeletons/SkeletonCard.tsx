'use client';

import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
      <div className="h-8 bg-white/10 rounded w-1/2 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-white/10 rounded w-full"></div>
        <div className="h-4 bg-white/10 rounded w-5/6"></div>
      </div>
    </div>
  );
};
