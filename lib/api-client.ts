// API Client for the TechMNHub Admin Dashboard
// This file contains all the API calls used in the admin dashboard

export interface DashboardMetrics {
  totalRevenue: number;
  activeRegistrations: number;
  liveEvents: number;
  institutes: number;
  sessionCounts: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  revenueTimeline: any[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  joinDate: Date;
  status: 'active' | 'inactive';
}

export interface SessionBooking {
  id: string;
  studentId: string;
  ambassadorId: string;
  sessionDate: Date;
  duration: number;
  topic: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface Ambassador {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  points: number;
  status: 'active' | 'inactive';
}

export interface Institute {
  id: string;
  name: string;
  location: string;
  studentCount?: number;
  status: 'active' | 'inactive';
}

export interface Event {
  id: string;
  name: string;
  date: string;
  status: 'draft' | 'published' | 'closed';
  registrations?: number;
}

export interface Registration {
  id: string;
  student: string;
  event: string;
  status: 'pending' | 'approved' | 'rejected' | 'checkedin';
  paymentStatus: 'pending' | 'completed' | 'failed';
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  description?: string;
}

export interface Session {
  id: string;
  userId: string;
  ip: string;
  device: string;
  lastActivity: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  result: 'success' | 'failure';
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', 'Bearer ' + token);
  }

  // Intercept and map endpoints
  let finalUrl = url;
  if (url.startsWith('/api/analytics')) finalUrl = url.replace('/api/analytics', '/api/admin/company-growth-analytics');
  if (url.startsWith('/api/logs')) finalUrl = url.replace('/api/logs', '/api/sessions/activities');
  if (url.startsWith('/api/security/blocked-users')) finalUrl = url.replace('/api/security/blocked-users', '/api/sessions/bans');
  if (url.startsWith('/api/session-bookings')) finalUrl = url.replace('/api/session-bookings', '/api/sessions');
  if (url.startsWith('/api/registrations')) finalUrl = url.replace('/api/registrations', '/api/events/registrations');
  if (url.startsWith('/api/institutes')) finalUrl = url.replace('/api/institutes', '/api/admin/institutes');
  if (url.startsWith('/api/ambassadors')) finalUrl = url.replace('/api/ambassadors', '/api/admin/ambassadors/active');
  if (url.startsWith('/api/students')) finalUrl = url.replace('/api/students', '/api/admin/users');

  const res = await fetch(finalUrl, { ...options, headers });
  
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  
  return res;
}

// Dashboard metrics API
export async function getDashboardMetrics(): Promise<any> {
  try {
    const [statsRes, growthRes, sessionsRes] = await Promise.all([
      fetchWithAuth('/api/admin/stats'),
      fetchWithAuth('/api/admin/company-growth-analytics'),
      fetchWithAuth('/api/sessions')
    ]);

    if (!statsRes.ok || !growthRes.ok || !sessionsRes.ok) {
      throw new Error('Failed to fetch dashboard metrics');
    }

    const statsData = await statsRes.json();
    const growthData = await growthRes.json();
    const sessionsData = await sessionsRes.json();

    const stats = statsData.data || {};
    const growth = growthData.data || {};
    const summary = growth.summary || {};
    const timeline = growth.timeline || [];
    const sessionBookings = sessionsData.data || sessionsData || [];

    return {
      totalRevenue: summary.revenue?.total || 0,
      activeRegistrations: summary.registrations?.total || stats.total || 0,
      liveEvents: 1, // Parity with legacy hardcode
      institutes: summary.institutes?.total || 0,
      sessionCounts: {
        total: sessionBookings.length,
        pending: sessionBookings.filter((b: any) => b.status === 'pending').length,
        confirmed: sessionBookings.filter((b: any) => b.status === 'confirmed').length,
        completed: sessionBookings.filter((b: any) => b.status === 'completed').length
      },
      revenueTimeline: timeline
    };
  } catch (error) {
    console.warn('Error fetching metrics:', error);
    throw error;
  }
}

export async function getSystemHealth(): Promise<any> {
  try {
    const res = await fetchWithAuth('/api/site/telemetry/nodes', {
      headers: { 'x-performance-key': '7xTN5aqUwWGzhDJs' }
    });
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  } catch (error) {
    console.warn('Error fetching health:', error);
    throw error;
  }
}

// Students API
export async function getStudents(page?: number, limit?: number, filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
    const qs = params.toString();
    const res = await fetchWithAuth(`/api/students${qs ? '?' + qs : ''}`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  } catch (err) {
    console.warn('Error fetching students:', err);
    throw err;
  }
}
export async function updateStudent(id: string, data: any) {
  const res = await fetchWithAuth(`/api/students/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update student');
  return res.json();
}
export async function deleteStudent(id: string) {
  const res = await fetchWithAuth(`/api/students/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete student');
}

// Session Bookings API
export async function getSessionBookings(page?: number, limit?: number, filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
    const qs = params.toString();
    const res = await fetchWithAuth(`/api/session-bookings${qs ? '?' + qs : ''}`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    const data = await res.json();
    return {
      items: data.bookings || [],
      total: data.bookings?.length || 0,
      stats: { pending: 0, confirmed: 0, completed: 0 }
    };
  } catch (err) {
    console.warn('Error fetching bookings:', err);
    throw err;
  }
}
export async function confirmSessionBooking(id: string) {
  const res = await fetchWithAuth(`/api/session-bookings/${id}/confirm`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to confirm booking');
  return res.json();
}
export async function rescheduleSessionBooking(id: string, newDate: string) {
  const res = await fetchWithAuth(`/api/session-bookings/${id}/reschedule`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newDate }) });
  if (!res.ok) throw new Error('Failed to reschedule booking');
  return res.json();
}
export async function completeSessionBooking(id: string) {
  const res = await fetchWithAuth(`/api/session-bookings/${id}/complete`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to complete booking');
  return res.json();
}
export async function cancelSessionBooking(id: string, reason?: string) {
  const res = await fetchWithAuth(`/api/session-bookings/${id}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
  if (!res.ok) throw new Error('Failed to cancel booking');
}

// Ambassadors API
export async function getAmbassadors(page?: number, limit?: number, filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    const qs = params.toString();
    const res = await fetchWithAuth(`/api/ambassadors${qs ? '?' + qs : ''}`);
    if (!res.ok) throw new Error('Failed to fetch ambassadors');
    return res.json();
  } catch (err) {
    console.warn('Error fetching ambassadors:', err);
    throw err;
  }
}
export async function approveAmbassador(id: string) {
  const res = await fetchWithAuth(`/api/ambassadors/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to approve ambassador');
  return res.json();
}
export async function rejectAmbassador(id: string, reason?: string) {
  const res = await fetchWithAuth(`/api/ambassadors/${id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
  if (!res.ok) throw new Error('Failed to reject ambassador');
}
export async function terminateAmbassador(id: string, reason?: string) {
  const res = await fetchWithAuth(`/api/ambassadors/${id}/terminate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
  if (!res.ok) throw new Error('Failed to terminate ambassador');
}

// Institutes API
export async function getInstitutes(page?: number, limit?: number, filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    const qs = params.toString();
    const res = await fetchWithAuth(`/api/institutes${qs ? '?' + qs : ''}`);
    if (!res.ok) throw new Error('Failed to fetch institutes');
    return res.json();
  } catch (err) {
    console.warn('Error fetching institutes:', err);
    throw err;
  }
}
export async function createInstitute(data: any) {
  const res = await fetchWithAuth('/api/institutes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create institute');
  return res.json();
}
export async function updateInstitute(id: string, data: any) {
  const res = await fetchWithAuth(`/api/institutes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update institute');
  return res.json();
}
export async function deleteInstitute(id: string) {
  const res = await fetchWithAuth(`/api/institutes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete institute');
}

// Events API
export async function getEvents(page?: number, limit?: number, filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    const qs = params.toString();
    const res = await fetchWithAuth(`/api/events${qs ? '?' + qs : ''}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  } catch (err) {
    console.warn('Error fetching events:', err);
    throw err;
  }
}
export async function createEvent(data: any) {
  const res = await fetchWithAuth('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create event');
  return res.json();
}
export async function updateEvent(id: string, data: any) {
  const res = await fetchWithAuth(`/api/events/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update event');
  return res.json();
}
export async function deleteEvent(id: string) {
  const res = await fetchWithAuth(`/api/events/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete event');
}
export async function publishEvent(id: string) {
  const res = await fetchWithAuth(`/api/events/${id}/publish`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to publish event');
  return res.json();
}
export async function unpublishEvent(id: string) {
  const res = await fetchWithAuth(`/api/events/${id}/unpublish`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to unpublish event');
  return res.json();
}

// Registrations API
export async function getRegistrations(page?: number, limit?: number, filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    if (filters) {
      if (filters.search) params.append('q', String(filters.search));
      if (filters.status && filters.status !== 'all') params.append('status', String(filters.status));
    }
    const qs = params.toString();
    const res = await fetchWithAuth(`/api/events/registrations${qs ? '?' + qs : ''}`);
    if (!res.ok) throw new Error('Failed to fetch registrations');
    const data = await res.json();
    const items = (data.items || []).map((item: any) => ({
      id: item._id,
      student: item.fullName || 'N/A',
      email: item.email || '',
      mobile: item.mobile || '',
      school: item.school || item.college || '',
      className: item.className || item.courseYear || '',
      city: item.city || '',
      passName: item.passName || '',
      event: item.eventShortName || item.passName || 'Zonex 2026',
      status: item.registrationStatus || 'pending',
      paymentStatus: item.paymentStatus || 'pending',
      registrationDate: item.createdAt || new Date().toISOString()
    }));
    return {
      items,
      total: data.pagination?.total || items.length
    };
  } catch (err) {
    console.warn('Error fetching registrations:', err);
    throw err;
  }
}
export async function approveRegistration(id: string) {
  const res = await fetchWithAuth(`/api/events/registrations/${id}`, { 
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationStatus: 'approved' }) 
  });
  if (!res.ok) throw new Error('Failed to approve registration');
  return res.json();
}
export async function rejectRegistration(id: string, reason?: string) {
  const res = await fetchWithAuth(`/api/events/registrations/${id}`, { 
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ registrationStatus: 'rejected', reason }) 
  });
  if (!res.ok) throw new Error('Failed to reject registration');
}
export async function checkInRegistration(id: string) {
  const res = await fetchWithAuth(`/api/events/registrations/${id}`, { 
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkedIn: true }) 
  });
  if (!res.ok) throw new Error('Failed to check in registration');
  return res.json();
}

// Analytics API
export async function getAnalyticsData(startDate?: string, endDate?: string): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString();
    const res = await fetchWithAuth(`/api/analytics${qs ? '?' + qs : ''}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    const data = await res.json();
    return {
      bookingData: (data.timeline || []).map((t: any) => ({ name: t.month, value: t.newSessions || 0 })),
      userGrowthData: (data.timeline || []).map((t: any) => ({ name: t.month, value: t.newRegistrations || 0 }))
    };
  } catch (err) {
    console.warn('Error fetching analytics:', err);
    throw err;
  }
}

// Permissions API
export async function getAllPermissions() {
  return [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'events', name: 'Events' },
    { id: 'registrations', name: 'Registrations' },
    { id: 'institutes', name: 'Institutes' },
    { id: 'students', name: 'Students' },
    { id: 'ambassadors', name: 'Ambassadors' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'financial', name: 'Financial' },
    { id: 'settings', name: 'Settings' }
  ];
}

// Sessions API
export async function getLiveSessions(page?: number, limit?: number) {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  const qs = params.toString();
  const res = await fetchWithAuth(`/api/sessions/live${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch live sessions');
  const data = await res.json();
  return {
    items: data.sessions || [],
    total: data.sessions?.length || 0
  };
}
export async function revokeSession(id: string) {
  const res = await fetchWithAuth(`/api/sessions/${id}/revoke`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to revoke session');
}
export async function revokeAllSessions(excludeCurrentSession: boolean = true) {
  const res = await fetchWithAuth('/api/sessions/revoke-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ excludeCurrentSession }) });
  if (!res.ok) throw new Error('Failed to revoke all sessions');
}

// System Logs API
export async function getSystemLogs(page?: number, limit?: number, filters?: Record<string, any>) {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
  const qs = params.toString();
  const res = await fetchWithAuth(`/api/logs${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

// Employees API
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
}
export async function getEmployees(page?: number, limit?: number, filters?: Record<string, any>) {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  const qs = params.toString();
  const res = await fetchWithAuth(`/api/admin/employees${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch employees');
  const data = await res.json();
  const items = (data.items || data || []).filter((emp: any) => 
    emp.empId !== 'ADMIN-2026' && 
    emp.name !== 'ADMIN-2026' && 
    emp.role !== 'super_admin'
  ).map((emp: any) => ({
    id: emp._id,
    employeeId: emp.empId || '',
    name: emp.name || '',
    email: emp.email || '',
    department: emp.department || 'N/A',
    role: emp.role || 'employee',
    status: emp.accountStatus || 'active',
    lastLogin: emp.lastLogin || null,
    permissions: emp.permissions || []
  }));
  return { items, total: data.pagination?.total || items.length };
}
export async function createEmployee(data: any) {
  const res = await fetchWithAuth('/api/admin/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create employee');
  return res.json();
}
export async function updateEmployee(id: string, data: any) {
  const res = await fetchWithAuth(`/api/admin/employees/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update employee');
  return res.json();
}
export async function updateEmployeePermissions(id: string, permissions: string[]) {
  const res = await fetchWithAuth(`/api/admin/employees/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ permissions }) });
  if (!res.ok) throw new Error('Failed to update permissions');
  return res.json();
}
export async function deleteEmployee(id: string) {
  const res = await fetchWithAuth(`/api/admin/employees/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete employee');
}

// Security Center API
export interface BlockedUser {
  id: string;
  email: string;
  reason: string;
  blockedAt: string;
}
export interface BlockedIP {
  id: string;
  ipAddress: string;
  reason: string;
  blockedAt: string;
}
export async function getBlockedUsers() {
  const res = await fetchWithAuth('/api/sessions/bans');
  if (!res.ok) throw new Error('Failed to fetch blocked users');
  const data = await res.json();
  return (data.filters || []).filter((f: any) => f.filterType === 'user').map((f: any) => ({
    id: f._id, userId: f.filterKey, banReason: f.logNote, createdBy: 'System', createdDate: f.createdAt
  }));
}
export async function unblockUser(id: string) {
  const res = await fetchWithAuth(`/api/security/blocked-users/${id}/unblock`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to unblock user');
}
export async function getBlockedIPs() {
  const res = await fetchWithAuth('/api/sessions/bans');
  if (!res.ok) throw new Error('Failed to fetch blocked IPs');
  const data = await res.json();
  return (data.filters || []).filter((f: any) => f.filterType === 'ip').map((f: any) => ({
    id: f._id, ipAddress: f.filterKey, reason: f.logNote, createdBy: 'System', createdDate: f.createdAt
  }));
}
export async function unblockIP(id: string) {
  const res = await fetchWithAuth(`/api/security/blocked-ips/${id}/unblock`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to unblock IP');
}
export async function getBlockedEmails() {
  const res = await fetchWithAuth('/api/sessions/bans');
  if (!res.ok) throw new Error('Failed to fetch blocked emails');
  const data = await res.json();
  return (data.filters || []).filter((f: any) => f.filterType === 'email').map((f: any) => ({
    id: f._id, email: f.filterKey, reason: f.logNote, createdBy: 'System', createdDate: f.createdAt
  }));
}
export async function unblockEmail(email: string) {
  const res = await fetchWithAuth(`/api/security/blocked-emails/${encodeURIComponent(email)}/unblock`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to unblock email');
}
export async function resetEmployeeAccess(id: string) {
  const res = await fetchWithAuth(`/api/employees/${id}/reset-access`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset access');
}
