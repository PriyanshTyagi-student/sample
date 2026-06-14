'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  getBlockedIPs,
  getBlockedUsers,
  getBlockedEmails,
  unblockIP,
  unblockUser,
  unblockEmail,
} from '@/lib/api-client';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassEmptyState } from '@/components/GlassEmptyState';
import { SkeletonTable } from '@/components/skeletons/SkeletonTable';
import { PermissionGate } from '@/components/PermissionGate';

export default function SecurityCenterPage() {
  const [tab, setTab] = useState<'ips' | 'users' | 'emails'>('ips');
  const [ipPage, setIpPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [emailPage, setEmailPage] = useState(1);

  const { data: ipData, isLoading: ipLoading, refetch: refetchIPs } = useQuery({
    queryKey: ['blockedIPs', ipPage],
    queryFn: () => getBlockedIPs(ipPage, 20),
  });

  const { data: userData, isLoading: userLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['blockedUsers', userPage],
    queryFn: () => getBlockedUsers(userPage, 20),
  });

  const { data: emailData, isLoading: emailLoading, refetch: refetchEmails } = useQuery({
    queryKey: ['blockedEmails', emailPage],
    queryFn: () => getBlockedEmails(emailPage, 20),
  });

  const handleUnblockIP = async (id: string) => {
    if (confirm('Unblock this IP?')) {
      try {
        await unblockIP(id);
        refetchIPs();
      } catch (error) {
        console.error('Failed to unblock IP:', error);
      }
    }
  };

  const handleUnblockUser = async (id: string) => {
    if (confirm('Unblock this user?')) {
      try {
        await unblockUser(id);
        refetchUsers();
      } catch (error) {
        console.error('Failed to unblock user:', error);
      }
    }
  };

  const handleUnblockEmail = async (id: string) => {
    if (confirm('Unblock this email?')) {
      try {
        await unblockEmail(id);
        refetchEmails();
      } catch (error) {
        console.error('Failed to unblock email:', error);
      }
    }
  };

  return (
    <PermissionGate permissions={['security.manage']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Security Center</h1>
          <p className="text-slate-400 mt-2">Manage traffic control and security policies</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {['ips', 'users', 'emails'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t as 'ips' | 'users' | 'emails');
                if (t === 'ips') setIpPage(1);
                if (t === 'users') setUserPage(1);
                if (t === 'emails') setEmailPage(1);
              }}
              className={`px-4 py-2 rounded-lg backdrop-blur-xl font-medium transition-all ${
                tab === t
                  ? 'bg-white/20 border border-white/30 text-white'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-800/70'
              }`}
            >
              {t === 'ips' ? 'Blocked IPs' : t === 'users' ? 'Blocked Users' : 'Blocked Emails'}
            </button>
          ))}
        </div>

        {/* Blocked IPs Tab */}
        {tab === 'ips' && (
          ipLoading ? (
            <SkeletonTable />
          ) : ipData?.length === 0 ? (
            <GlassEmptyState title="No blocked IPs" description="All IP addresses are allowed" />
          ) : (
            <GlassCard>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">IP Address</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Ban Reason</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Blocked By</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(ipData) ? ipData : [])?.map((ip, idx) => (
                      <motion.tr key={ip.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-slate-200 font-mono">{ip.ip}</td>
                        <td className="py-3 px-4 text-slate-400">{ip.banReason}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{ip.createdBy}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{new Date(ip.createdDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <GlassButton size="sm" variant="danger" onClick={() => handleUnblockIP(ip.id)}>
                            Unblock
                          </GlassButton>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )
        )}

        {/* Blocked Users Tab */}
        {tab === 'users' && (
          userLoading ? (
            <SkeletonTable />
          ) : userData?.length === 0 ? (
            <GlassEmptyState title="No blocked users" description="All users are allowed" />
          ) : (
            <GlassCard>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">User ID</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Ban Reason</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Blocked By</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(userData) ? userData : [])?.map((user, idx) => (
                      <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-slate-200 font-mono text-xs">{user.userId}</td>
                        <td className="py-3 px-4 text-slate-400">{user.banReason}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{user.createdBy}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{new Date(user.createdDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <GlassButton size="sm" variant="danger" onClick={() => handleUnblockUser(user.id)}>
                            Unblock
                          </GlassButton>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )
        )}

        {/* Blocked Emails Tab */}
        {tab === 'emails' && (
          emailLoading ? (
            <SkeletonTable />
          ) : emailData?.length === 0 ? (
            <GlassEmptyState title="No blocked emails" description="All emails are allowed" />
          ) : (
            <GlassCard>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Ban Reason</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Blocked By</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(emailData) ? emailData : [])?.map((email, idx) => (
                      <motion.tr key={email.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-slate-200">{email.email}</td>
                        <td className="py-3 px-4 text-slate-400">{email.banReason}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{email.createdBy}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{new Date(email.createdDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <GlassButton size="sm" variant="danger" onClick={() => handleUnblockEmail(email.id)}>
                            Unblock
                          </GlassButton>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )
        )}
      </div>
    </PermissionGate>
  );
}
