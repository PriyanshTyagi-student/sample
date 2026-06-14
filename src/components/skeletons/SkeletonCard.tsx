"use client";

export function SkeletonCard() {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 shadow-2xl">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="h-4 w-24 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse mb-2" />
          <div className="h-8 w-32 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
        </div>
        <div className="h-10 w-10 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-full bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
      </div>
    </div>
  );
}
