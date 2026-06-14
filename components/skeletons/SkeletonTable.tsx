'use client';

import React from 'react';

export const SkeletonTable: React.FC = () => {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-pulse">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex gap-4">
        <div className="h-4 bg-white/10 rounded flex-1"></div>
        <div className="h-4 bg-white/10 rounded flex-1"></div>
        <div className="h-4 bg-white/10 rounded flex-1"></div>
      </div>

      {/* Rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border-b border-white/5 px-6 py-4 flex gap-4">
          <div className="h-4 bg-white/10 rounded flex-1"></div>
          <div className="h-4 bg-white/10 rounded flex-1"></div>
          <div className="h-4 bg-white/10 rounded flex-1"></div>
        </div>
      ))}
    </div>
  );
};
