'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getRegistrations, approveRegistration, rejectRegistration, checkInRegistration, getEvents } from '@/lib/api-client';
import { Download, ScanLine, Search } from 'lucide-react';

export default function RegistrationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('');

  const filters = {
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    eventId: eventFilter || undefined,
  };

  const { data: regData, isLoading, refetch } = useQuery({
    queryKey: ['registrations', page, filters],
    queryFn: () => getRegistrations(page, 20, filters),
  });

  const { data: eventsRes } = useQuery({
    queryKey: ['events-list'],
    queryFn: () => getEvents(),
  });

  const registrations = regData?.items || [];
  const pendingCount = registrations.filter((r: any) => r.status === 'pending').length;
  const confirmedCount = registrations.filter((r: any) => r.status === 'approved' || r.status === 'checkedin').length;

  const events = Array.isArray(eventsRes?.items) ? eventsRes.items : [];

  const handleApprove = async (id: string) => {
    try {
      await approveRegistration(id);
      refetch();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectRegistration(id);
      refetch();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await checkInRegistration(id);
      refetch();
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  return (
    <PermissionGate permissions={['registrations.view']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Event Registrations</h1>
            <p className="text-slate-400 mt-2">{pendingCount} pending review &middot; {confirmedCount} confirmed</p>
          </div>
          <div className="flex gap-3">
            <GlassButton variant="secondary" onClick={() => alert('Export CSV coming soon')}><Download className="w-4 h-4 mr-2" /> Export CSV</GlassButton>
            <GlassButton variant="secondary" onClick={() => alert('Export PDF coming soon')}><Download className="w-4 h-4 mr-2" /> Export PDF</GlassButton>
            <GlassButton onClick={() => alert('Scanner integration coming soon')}><ScanLine className="w-4 h-4 mr-2" /> Attendance Scanner</GlassButton>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="liquid-glass liquid-glass-glow rounded-2xl p-4 border border-white/5 relative group overflow-hidden">
            <div className="text-sm text-muted-foreground font-medium mb-1">Total Registrations</div>
            <div className="text-2xl font-bold tracking-tight mb-1">{registrations.length}</div>
            <div className="text-xs text-emerald-400">Live total</div>
          </div>
          <div className="liquid-glass liquid-glass-glow rounded-2xl p-4 border border-white/5 relative group overflow-hidden">
            <div className="text-sm text-muted-foreground font-medium mb-1">Revenue Generated</div>
            <div className="text-2xl font-bold tracking-tight mb-1">₹{registrations.length * 1500}</div>
            <div className="text-xs text-emerald-400">Live summary</div>
          </div>
          <div className="liquid-glass liquid-glass-glow rounded-2xl p-4 border border-white/5 relative group overflow-hidden">
            <div className="text-sm text-muted-foreground font-medium mb-1">Seat Occupancy</div>
            <div className="text-2xl font-bold tracking-tight mb-1">{Math.min(100, Math.round((confirmedCount / Math.max(1, registrations.length)) * 100))}%</div>
            <div className="text-xs text-red-400">Capacity view</div>
          </div>
          <div className="liquid-glass liquid-glass-glow rounded-2xl p-4 border border-white/5 relative group overflow-hidden">
            <div className="text-sm text-muted-foreground font-medium mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold tracking-tight mb-1">{Math.round((confirmedCount / Math.max(1, registrations.length)) * 100)}%</div>
            <div className="text-xs text-emerald-400">Live summary</div>
          </div>
        </div>

        <GlassCard>
          <div className="flex gap-4 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search by name, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-50 outline-none focus:border-gold-500/50 transition-colors placeholder:text-slate-500"
              />
            </div>
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-50 backdrop-blur-xl outline-none"
            >
              <option value="">All Events</option>
              {events.map((e: any) => (
                <option key={e.id} value={e.id}>{e.title || e.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-50 backdrop-blur-xl outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Confirmed</option>
              <option value="rejected">Cancelled</option>
            </select>
          </div>
        </GlassCard>

        {isLoading ? (
          <SkeletonTable />
        ) : regData?.items?.length === 0 ? (
          <GlassEmptyState
            title="No registrations found"
            description="Registrations will appear here as students register for events"
          />
        ) : (
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Reg ID</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Mobile</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg: any, index: number) => {
                    let badgeColor = 'bg-slate-700/50 text-slate-400';
                    const status = (reg.paymentStatus?.toLowerCase() || reg.status?.toLowerCase() || '');
                    if (status === 'success' || status === 'paid' || status === 'approved' || status === 'checked_in') badgeColor = 'bg-emerald-500/20 text-emerald-400';
                    if (status === 'pending') badgeColor = 'bg-yellow-500/20 text-yellow-400';
                    if (status === 'rejected' || status === 'cancelled') badgeColor = 'bg-red-500/20 text-red-400';

                    return (
                      <motion.tr
                        key={reg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-700/50 hover:bg-slate-800/30"
                      >
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-xs font-mono text-slate-300">
                            {reg.id ? reg.id.substring(reg.id.length - 8).toUpperCase() : "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-200">{reg.student || "N/A"}</td>
                        <td className="py-3 px-4 text-slate-300">{reg.email || "N/A"}</td>
                        <td className="py-3 px-4 text-slate-300">{reg.mobile || "N/A"}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs capitalize ${badgeColor}`}>
                            {reg.status || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <PermissionGate permissions={['registrations.manage']}>
                            <div className="flex gap-2 flex-wrap">
                              {reg.status === 'pending' && (
                                <>
                                  <GlassButton size="sm" onClick={() => handleApprove(reg.id)}>Approve</GlassButton>
                                  <GlassButton size="sm" variant="danger" onClick={() => handleReject(reg.id)}>Reject</GlassButton>
                                </>
                              )}
                              {reg.status === 'approved' && (
                                <GlassButton size="sm" onClick={() => handleCheckIn(reg.id)}>Check In</GlassButton>
                              )}
                              <GlassButton size="sm" variant="secondary" onClick={() => alert('View coming soon')}>View</GlassButton>
                            </div>
                          </PermissionGate>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </PermissionGate>
  );
}
