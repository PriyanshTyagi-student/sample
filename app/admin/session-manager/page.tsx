'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getLiveSessions, revokeSession, revokeAllSessions } from '@/lib/api-client';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassEmptyState } from '@/components/GlassEmptyState';
import { SkeletonTable } from '@/components/skeletons/SkeletonTable';
import { PermissionGate } from '@/components/PermissionGate';

export default function SessionManagerPage() {
  const [page, setPage] = useState(1);
  const [revoking, setRevoking] = useState(false);

  const { data: sessionsData, isLoading, refetch } = useQuery({
    queryKey: ['sessions', page],
    queryFn: () => getLiveSessions(page, 20),
  });

  const handleRevokeSession = async (sessionId: string) => {
    if (confirm('Revoke this session?')) {
      setRevoking(true);
      try {
        await revokeSession(sessionId);
        refetch();
      } catch (error) {
        console.error('Failed to revoke session:', error);
      } finally {
        setRevoking(false);
      }
    }
  };

  const handleRevokeAllSessions = async () => {
    if (confirm('Revoke all sessions except current? This will log out all users.')) {
      setRevoking(true);
      try {
        await revokeAllSessions(true);
        refetch();
      } catch (error) {
        console.error('Failed to revoke all sessions:', error);
      } finally {
        setRevoking(false);
      }
    }
  };

  return (
    <PermissionGate permissions={['session_manager.manage']} superAdminOnly>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Session Manager</h1>
            <p className="text-slate-400 mt-2">Monitor and revoke active sessions</p>
          </div>
          <GlassButton
            variant="danger"
            loading={revoking}
            onClick={handleRevokeAllSessions}
          >
            Revoke All Sessions
          </GlassButton>
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : sessionsData?.items?.length === 0 ? (
          <GlassEmptyState
            title="No active sessions"
            description="No users are currently logged in"
          />
        ) : (
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">User ID</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">IP Address</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Device</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Last Activity</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Created</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsData?.items?.map((session, index) => (
                    <motion.tr
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-700/50 hover:bg-slate-800/30"
                    >
                      <td className="py-3 px-4 text-slate-200 font-mono text-xs">{session.userId}</td>
                      <td className="py-3 px-4 text-slate-200 font-mono">{session.ip}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs">{session.device}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(session.lastActivity).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(session.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <GlassButton
                          size="sm"
                          variant="danger"
                          loading={revoking}
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          Revoke
                        </GlassButton>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </PermissionGate>
  );
}
