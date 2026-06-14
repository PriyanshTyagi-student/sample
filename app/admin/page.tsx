'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Users, Award, Building2, CalendarDays,
  Clock, CheckCircle2, CheckCircle,
  AlertTriangle, Plus, Send, FileText
} from 'lucide-react';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { getDashboardMetrics, getEvents, getSystemLogs, getSystemHealth } from '@/lib/api-client';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: getDashboardMetrics,
    retry: 1
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['topEvents'],
    queryFn: () => getEvents(1, 5, { sort: 'registrations', order: 'desc' }),
    retry: 1
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['recentLogs'],
    queryFn: () => getSystemLogs(1, 5),
    retry: 1
  });

  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: getSystemHealth,
    retry: 1
  });

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const safeMetrics = metrics || {
    totalRevenue: 0,
    activeRegistrations: 0,
    liveEvents: 0,
    institutes: 0,
    sessionCounts: { total: 0, pending: 0, confirmed: 0, completed: 0 },
    revenueTimeline: []
  };

  const revenueData = safeMetrics.revenueTimeline.map((t: any) => ({
    name: t.month.split('-')[1] || t.month,
    value: t.newRevenue || 0
  }));

  const topEvents = events?.items || [];
  const recentActivities = logs?.activities || logs?.items || [];
  const systemNodes = healthData?.nodes || [];

  return (
    <motion.div 
      className="text-white pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex justify-between items-end mb-6">
        <div>
          <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight mb-1">Command Center</motion.h1>
          <motion.p variants={itemVariants} className="text-muted-foreground">Everything is operating normally</motion.p>
        </div>
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm text-green-400">All Systems Operational</span>
        </motion.div>
      </div>

      {metricsError && (
        <motion.div variants={itemVariants} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <p>Failed to load dashboard data. Ensure the backend at localhost:5000 is running.</p>
        </motion.div>
      )}

      {/* Quick Action Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4 mb-6">
        <div className="liquid-glass rounded-xl p-4 border border-white/5 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => window.location.href = '#/events/new'}>
          <Plus className="w-5 h-5 text-gold-400" />
          <span className="font-semibold text-sm">New Event</span>
        </div>
        <div className="liquid-glass rounded-xl p-4 border border-white/5 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => alert('Send Announcement coming soon')}>
          <Send className="w-5 h-5 text-gold-400" />
          <span className="font-semibold text-sm">Send Announcement</span>
        </div>
        <Link href="/admin/institutes" className="liquid-glass rounded-xl p-4 border border-white/5 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
          <Building2 className="w-5 h-5 text-gold-400" />
          <span className="font-semibold text-sm">Add Institute</span>
        </Link>
        <div className="liquid-glass rounded-xl p-4 border border-white/5 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => alert('Generate Report coming soon')}>
          <FileText className="w-5 h-5 text-gold-400" />
          <span className="font-semibold text-sm">Generate Report</span>
        </div>
      </motion.div>

      {/* KPI Cards Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `$${safeMetrics.totalRevenue.toLocaleString()}`, sub: 'Monthly aggregate', icon: <Award className="w-5 h-5 text-gold-400" /> },
          { label: 'Active Registrations', value: safeMetrics.activeRegistrations, sub: 'Growing', icon: <Users className="w-5 h-5 text-gold-400" /> },
          { label: 'Live Events', value: safeMetrics.liveEvents, sub: 'Running normally', icon: <CalendarDays className="w-5 h-5 text-gold-400" /> },
          { label: 'Institutes Onboarded', value: safeMetrics.institutes, sub: 'Expanding network', icon: <Building2 className="w-5 h-5 text-gold-400" /> },
        ].map((kpi, i) => (
          <div key={i} className="liquid-glass liquid-glass-glow rounded-2xl p-4 border border-white/5 relative group overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-black border border-gold-500/20 group-hover:border-gold-500/50 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                {kpi.icon}
              </div>
              <span className="text-sm text-muted-foreground font-medium truncate">{kpi.label}</span>
            </div>
            <div className="text-3xl font-bold tracking-tight mb-1">
              {metricsLoading ? <span className="animate-pulse bg-white/20 h-8 w-16 rounded block" /> : kpi.value}
            </div>
            <div className="text-xs text-emerald-400">{kpi.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Middle Row */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <motion.div variants={itemVariants} className="col-span-2 liquid-glass liquid-glass-glow rounded-3xl p-6 border border-white/5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-lg">Revenue Analytics</h2>
            <span className="text-xs text-muted-foreground">Last 12 months</span>
          </div>
          
          <div className="flex-1 min-h-[250px] w-full relative">
            {metricsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground animate-pulse">Loading charts...</div>
            ) : revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#d4af37', borderRadius: '12px' }} 
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {revenueData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === revenueData.length - 1 ? '#d4af37' : '#997a00'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="liquid-glass liquid-glass-glow rounded-3xl p-6 border border-white/5 flex flex-col">
          <h2 className="font-semibold text-lg mb-6">Sessions Overview</h2>
          <div className="grid grid-cols-1 gap-4 flex-1">
            {[
              { label: 'Total Sessions', value: safeMetrics.sessionCounts.total, sub: 'All Bookings', icon: <Users className="w-5 h-5 text-gold-400" />, bg: 'bg-gold-500/10 border-gold-500/20' },
              { label: 'Pending Sessions', value: safeMetrics.sessionCounts.pending, sub: 'Needs Approval', icon: <Clock className="w-5 h-5 text-gold-400" />, bg: 'bg-yellow-500/10 border-yellow-500/20' },
              { label: 'Confirmed Sessions', value: safeMetrics.sessionCounts.confirmed, sub: 'Upcoming', icon: <CheckCircle2 className="w-5 h-5 text-blue-400" />, bg: 'bg-blue-500/10 border-blue-500/20' },
              { label: 'Completed Sessions', value: safeMetrics.sessionCounts.completed, sub: 'Successfully Delivered', icon: <CheckCircle className="w-5 h-5 text-green-400" />, bg: 'bg-green-500/10 border-green-500/20' },
            ].map((stat, i) => (
              <div key={i} className={`rounded-xl p-3 border ${stat.bg} flex justify-between items-center backdrop-blur-sm`}>
                <div className="flex gap-3 items-center">
                  <div className="p-2 rounded-lg bg-black/50 shadow-inner">{stat.icon}</div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                    <div className="text-[10px] text-muted-foreground/60">{stat.sub}</div>
                  </div>
                </div>
                <div className="font-bold text-lg">
                  {metricsLoading ? '-' : stat.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Event Performance */}
        <motion.div variants={itemVariants} className="liquid-glass liquid-glass-glow rounded-3xl p-6 border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold">Event Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-muted-foreground font-semibold pb-3">Event</th>
                  <th className="text-left text-xs text-muted-foreground font-semibold pb-3">Registrations</th>
                  <th className="text-left text-xs text-muted-foreground font-semibold pb-3">Revenue</th>
                  <th className="text-left text-xs text-muted-foreground font-semibold pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {eventsLoading ? (
                  <tr><td colSpan={4} className="py-4 text-center text-sm text-muted-foreground">Loading...</td></tr>
                ) : topEvents.length > 0 ? (
                  topEvents.map((e: any, i: number) => {
                    const statusLabel = e.isActive ? 'Live' : (e.isClosed ? 'Closed' : 'Upcoming');
                    const statusColor = statusLabel === 'Live' ? 'bg-emerald-500/20 text-emerald-400' : (statusLabel === 'Upcoming' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400');
                    return (
                      <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 text-xs font-bold">
                              {(e.title || e.name || 'E').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{e.title || e.name || 'Event'}</div>
                              <div className="text-[10px] text-muted-foreground">{e.date ? new Date(e.date).toLocaleDateString() : 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-sm">{e.studentRegistrations?.length || 0}</td>
                        <td className="py-3 text-sm text-muted-foreground">$0</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-[10px] ${statusColor}`}>{statusLabel}</span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr><td colSpan={4} className="py-4 text-center text-sm text-muted-foreground">No events found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="flex flex-col gap-6">
          {/* Recent Activities */}
          <motion.div variants={itemVariants} className="liquid-glass liquid-glass-glow rounded-3xl p-6 border border-white/5 flex-1">
            <h2 className="font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {logsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-white/10 rounded w-full"></div>
                  <div className="h-8 bg-white/10 rounded w-full"></div>
                </div>
              ) : recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity: any, i: number) => {
                  const isDanger = (activity.action || '').includes('failed') || (activity.action || '').includes('revoked');
                  return (
                    <div key={i} className="flex items-start gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${isDanger ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-300">
                          <strong className="text-white">{activity.actorRole || 'System'}</strong>: {activity.action || 'Performed an action'}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {new Date(activity.createdAt || Date.now()).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-sm text-muted-foreground">No recent activities available</div>
              )}
            </div>
          </motion.div>

          {/* System Health */}
          <motion.div variants={itemVariants} className="liquid-glass liquid-glass-glow rounded-3xl p-6 border border-white/5">
            <h2 className="font-semibold mb-6">System Health</h2>
            <div className="space-y-4">
              {healthLoading ? (
                <div className="text-sm text-muted-foreground">Loading telemetry...</div>
              ) : systemNodes.length > 0 ? (
                systemNodes.map((n: any, i: number) => {
                  const usage = n.metrics?.memoryUsage || 0;
                  const isHigh = usage > 80;
                  return (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-xs mb-2">
                        <span>{n.host || 'Node'}</span>
                        <span className={isHigh ? 'text-red-400' : 'text-green-400'}>{usage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isHigh ? 'bg-red-500' : 'bg-green-500'} rounded-full transition-all duration-1000`}
                          style={{ width: `${usage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-sm text-muted-foreground">No health data available.</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
    </motion.div>
  );
}
