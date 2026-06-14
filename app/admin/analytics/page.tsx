'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getAnalyticsData } from '@/lib/api-client';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassEmptyState } from '@/components/GlassEmptyState';
import { SkeletonChart } from '@/components/skeletons/SkeletonChart';
import { PermissionGate } from '@/components/PermissionGate';

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', startDate, endDate],
    queryFn: () => getAnalyticsData(startDate, endDate),
  });

  const chartContainerClass = 'h-64 bg-slate-800/30 rounded-lg border border-slate-700/50 flex items-center justify-center text-slate-400';

  return (
    <PermissionGate permissions={['analytics.view']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Analytics</h1>
          <p className="text-slate-400 mt-2">View system analytics and statistics</p>
        </div>

        {/* Date Filters */}
        <GlassCard>
          <div className="flex gap-4">
            <GlassInput
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <GlassInput
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </div>
        </GlassCard>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonChart key={i} />
            ))}
          </div>
        ) : !analytics ? (
          <GlassEmptyState
            title="No analytics data"
            description="Check your date range and try again"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <GlassCard>
                <h3 className="text-lg font-semibold text-slate-50 mb-4">Revenue Over Time</h3>
                <div className={chartContainerClass}>
                  [Chart: Revenue Trends]
                </div>
              </GlassCard>
            </motion.div>

            {/* Registration Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard>
                <h3 className="text-lg font-semibold text-slate-50 mb-4">Registration Trends</h3>
                <div className={chartContainerClass}>
                  [Chart: Registration Trends]
                </div>
              </GlassCard>
            </motion.div>

            {/* Institute Growth */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard>
                <h3 className="text-lg font-semibold text-slate-50 mb-4">Institute Growth</h3>
                <div className={chartContainerClass}>
                  [Chart: Institute Growth]
                </div>
              </GlassCard>
            </motion.div>

            {/* Ambassador Growth */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard>
                <h3 className="text-lg font-semibold text-slate-50 mb-4">Ambassador Growth</h3>
                <div className={chartContainerClass}>
                  [Chart: Ambassador Growth]
                </div>
              </GlassCard>
            </motion.div>

            {/* Event Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard>
                <h3 className="text-lg font-semibold text-slate-50 mb-4">Event Performance</h3>
                <div className={chartContainerClass}>
                  [Chart: Event Performance]
                </div>
              </GlassCard>
            </motion.div>

            {/* User Growth */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassCard>
                <h3 className="text-lg font-semibold text-slate-50 mb-4">User Growth</h3>
                <div className={chartContainerClass}>
                  [Chart: User Growth]
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
