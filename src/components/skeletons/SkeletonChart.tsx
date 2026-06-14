"use client";

export function SkeletonChart() {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 shadow-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="h-5 w-40 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse mb-2" />
        <div className="h-3 w-60 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
      </div>

      {/* Chart area */}
      <div className="h-64 flex items-end gap-3 justify-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-slate-700 to-slate-600 rounded-t animate-pulse"
            style={{
              height: `${30 + Math.random() * 70}%`,
            }}
          />
        ))}
      </div>

      {/* Legend skeleton */}
      <div className="mt-6 flex gap-4 justify-center flex-wrap">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse" />
            <div className="h-3 w-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
