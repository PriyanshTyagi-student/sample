'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getAmbassadors, approveAmbassador, rejectAmbassador, terminateAmbassador } from '@/lib/api-client';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassTable } from '@/components/glass/GlassTable';
import { GlassModal } from '@/components/glass/GlassModal';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassEmptyState } from '@/components/GlassEmptyState';
import { SkeletonTable } from '@/components/skeletons/SkeletonTable';
import { PermissionGate } from '@/components/PermissionGate';

export default function AmbassadorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAmbassador, setSelectedAmbassador] = useState<any>(null);
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject' | 'terminate'; visible: boolean }>({ type: 'approve', visible: false });
  const [loading, setLoading] = useState(false);

  const filters = {
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };

  const { data: ambassadorData, isLoading, refetch } = useQuery({
    queryKey: ['ambassadors', page, filters],
    queryFn: () => getAmbassadors(page, 20, filters),
  });

  const handleAction = async (actionType: 'approve' | 'reject' | 'terminate') => {
    if (!selectedAmbassador) return;
    setLoading(true);
    try {
      if (actionType === 'approve') {
        await approveAmbassador(selectedAmbassador.id);
      } else if (actionType === 'reject') {
        await rejectAmbassador(selectedAmbassador.id);
      } else if (actionType === 'terminate') {
        await terminateAmbassador(selectedAmbassador.id);
      }
      refetch();
      setActionModal({ type: 'approve', visible: false });
      setSelectedAmbassador(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGate permissions={['ambassadors.view']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Ambassadors</h1>
          <p className="text-slate-400 mt-2">Manage ambassador accounts and approvals</p>
        </div>

        {/* Filters */}
        <GlassCard>
          <div className="flex gap-4 flex-wrap">
            <GlassInput
              placeholder="Search ambassadors..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 min-w-[200px]"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-50 backdrop-blur-xl hover:border-slate-600/50 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </GlassCard>

        {/* Table */}
        {isLoading ? (
          <SkeletonTable />
        ) : ambassadorData?.items?.length === 0 ? (
          <GlassEmptyState
            title="No ambassadors found"
            description="There are no ambassadors matching your criteria"
          />
        ) : (
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Referral Code</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Points</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Referrals</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Conversions</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ambassadorData?.items?.map((ambassador, index) => (
                    <motion.tr
                      key={ambassador.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-200">{ambassador.name}</td>
                      <td className="py-3 px-4 text-slate-400">{ambassador.email}</td>
                      <td className="py-3 px-4 text-slate-200 font-mono text-sm">{ambassador.referralCode}</td>
                      <td className="py-3 px-4 text-slate-200">{ambassador.points}</td>
                      <td className="py-3 px-4 text-slate-200">{ambassador.referrals}</td>
                      <td className="py-3 px-4 text-slate-200">{ambassador.conversionCount}</td>
                      <td className="py-3 px-4">
                        <GlassBadge
                          variant={
                            ambassador.status === 'approved'
                              ? 'success'
                              : ambassador.status === 'pending'
                              ? 'warning'
                              : 'error'
                          }
                        >
                          {ambassador.status}
                        </GlassBadge>
                      </td>
                      <td className="py-3 px-4">
                        {ambassador.status === 'pending' && (
                          <div className="flex gap-2">
                            <GlassButton
                              size="sm"
                              onClick={() => {
                                setSelectedAmbassador(ambassador);
                                setActionModal({ type: 'approve', visible: true });
                              }}
                            >
                              Approve
                            </GlassButton>
                            <GlassButton
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setSelectedAmbassador(ambassador);
                                setActionModal({ type: 'reject', visible: true });
                              }}
                            >
                              Reject
                            </GlassButton>
                          </div>
                        )}
                        {ambassador.status === 'approved' && (
                          <GlassButton
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setSelectedAmbassador(ambassador);
                              setActionModal({ type: 'terminate', visible: true });
                            }}
                          >
                            Terminate
                          </GlassButton>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50">
              <span className="text-slate-400 text-sm">
                Page {page} of {ambassadorData?.pages || 1}
              </span>
              <div className="flex gap-2">
                <GlassButton
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  disabled={page >= (ambassadorData?.pages || 1)}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Action Modal */}
        <GlassModal
          isOpen={actionModal.visible}
          onClose={() => {
            setActionModal({ type: 'approve', visible: false });
            setSelectedAmbassador(null);
          }}
          title={`${actionModal.type.charAt(0).toUpperCase() + actionModal.type.slice(1)} Ambassador`}
        >
          <div className="space-y-4">
            <p className="text-slate-300">
              Are you sure you want to {actionModal.type} {selectedAmbassador?.name}?
            </p>
            <div className="flex gap-2 justify-end">
              <GlassButton
                variant="secondary"
                onClick={() => {
                  setActionModal({ type: 'approve', visible: false });
                  setSelectedAmbassador(null);
                }}
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="danger"
                loading={loading}
                onClick={() => handleAction(actionModal.type)}
              >
                Confirm
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      </div>
    </PermissionGate>
  );
}
