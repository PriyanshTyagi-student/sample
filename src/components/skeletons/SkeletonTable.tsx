"use client";

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 bg-white/5">
        <div className="flex gap-4">
          <div className="h-4 w-12 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse flex-1" />
          <div className="h-4 w-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-white/5 px-6 py-4 last:border-b-0">
          <div className="flex gap-4 items-center">
            <div className="h-4 w-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
            <div className="h-4 w-40 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse flex-1" />
            <div className="h-4 w-16 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
