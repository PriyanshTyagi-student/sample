'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getSystemLogs } from '@/lib/api-client';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassEmptyState } from '@/components/GlassEmptyState';
import { SkeletonTable } from '@/components/skeletons/SkeletonTable';
import { PermissionGate } from '@/components/PermissionGate';

export default function SystemLogsPage() {
  const [page, setPage] = useState(1);
  const [logTypeFilter, setLogTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filters = {
    logType: logTypeFilter !== 'all' ? logTypeFilter : undefined,
    search: search || undefined,
  };

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['logs', page, filters],
    queryFn: () => getSystemLogs(page, 50, filters),
  });

  const getResultColor = (result: string) => {
    return result === 'success'
      ? 'bg-emerald-500/20 text-emerald-400'
      : 'bg-red-500/20 text-red-400';
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'audit':
        return 'bg-blue-500/20 text-blue-400';
      case 'authentication':
        return 'bg-orange-500/20 text-orange-400';
      case 'security':
        return 'bg-red-500/20 text-red-400';
      case 'system':
        return 'bg-slate-500/20 text-slate-400';
      default:
        return 'bg-slate-700/50 text-slate-400';
    }
  };

  return (
    <PermissionGate permissions={['system_logs.view']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">System Logs</h1>
          <p className="text-slate-400 mt-2">View audit logs, security events, and system activities</p>
        </div>

        <GlassCard>
          <div className="flex gap-4 flex-wrap">
            <GlassInput
              placeholder="Search logs..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 min-w-[200px]"
            />
            <select
              value={logTypeFilter}
              onChange={(e) => {
                setLogTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-50 backdrop-blur-xl"
            >
              <option value="all">All Types</option>
              <option value="audit">Audit Logs</option>
              <option value="authentication">Authentication</option>
              <option value="system">System Events</option>
              <option value="security">Security Events</option>
            </select>
          </div>
        </GlassCard>

        {isLoading ? (
          <SkeletonTable />
        ) : logsData?.items?.length === 0 ? (
          <GlassEmptyState
            title="No logs found"
            description="No system logs match your search criteria"
          />
        ) : (
          <GlassCard>
            <div className="space-y-2">
              {logsData?.items?.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLogTypeColor(log.logType)}`}>
                          {log.logType}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-slate-200 font-medium mb-1">{log.action}</div>
                      <div className="text-slate-400 text-sm mb-2">
                        <span className="text-slate-500">User:</span> {log.user}
                      </div>
                      {log.details && (
                        <div className="text-slate-400 text-xs bg-slate-900/50 p-2 rounded border border-slate-700/50 mb-2 font-mono break-all">
                          {log.details}
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getResultColor(log.result)}`}>
                      {log.result}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50">
              <span className="text-slate-400 text-sm">
                Page {page} of {logsData?.pages || 1}
              </span>
            </div>
          </GlassCard>
        )}
      </div>
    </PermissionGate>
  );
}
