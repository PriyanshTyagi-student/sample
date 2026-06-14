'use client';

import React from 'react';

export const SkeletonChart: React.FC = () => {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-1/3 mb-6"></div>
      <div className="flex items-end justify-between h-40 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-1 bg-white/10 rounded-t"></div>
        ))}
      </div>
    </div>
  );
};
