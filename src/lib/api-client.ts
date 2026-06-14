import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { extractArray, extractItem, extractMeta, extractPagination, extractError } from "@/utils/extractors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token
axiosInstance.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Typed API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ============== DASHBOARD ==============

export interface DashboardMetrics {
  totalUsers: number;
  totalStudents: number;
  totalAmbassadors: number;
  totalInstitutes: number;
  totalEmployees: number;
  totalEvents: number;
  totalRevenue: number;
  eventRegistrations: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const response = await axiosInstance.get("/admin/dashboard/metrics");
    const data = extractItem(response.data) || response.data;
    return {
      totalUsers: data.totalUsers || 0,
      totalStudents: data.totalStudents || 0,
      totalAmbassadors: data.totalAmbassadors || 0,
      totalInstitutes: data.totalInstitutes || 0,
      totalEmployees: data.totalEmployees || 0,
      totalEvents: data.totalEvents || 0,
      totalRevenue: data.totalRevenue || 0,
      eventRegistrations: data.eventRegistrations || 0,
      pendingBookings: data.pendingBookings || 0,
      confirmedBookings: data.confirmedBookings || 0,
      completedBookings: data.completedBookings || 0,
      cancelledBookings: data.cancelledBookings || 0,
    };
  } catch (error) {
    console.error("[API] Failed to fetch dashboard metrics:", error);
    throw error;
  }
}

// ============== STUDENTS ==============

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  institute: string;
  status: "active" | "suspended" | "inactive";
  createdAt: string;
}

export async function getStudents(
  page: number = 1,
  limit: number = 20,
  filters?: Record<string, any>
): Promise<PaginatedResponse<Student>> {
  try {
    const response = await axiosInstance.get("/admin/students", {
      params: { page, limit, ...filters },
    });
    const items = extractArray<Student>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch students:", error);
    throw error;
  }
}

export async function createStudent(data: Partial<Student>): Promise<Student> {
  try {
    const response = await axiosInstance.post("/admin/students", data);
    return extractItem<Student>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to create student:", error);
    throw error;
  }
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student> {
  try {
    const response = await axiosInstance.put(`/admin/students/${id}`, data);
    return extractItem<Student>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to update student:", error);
    throw error;
  }
}

export async function deleteStudent(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/admin/students/${id}`);
  } catch (error) {
    console.error("[API] Failed to delete student:", error);
    throw error;
  }
}

// ============== AMBASSADORS ==============

export interface Ambassador {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  points: number;
  referrals: number;
  conversionCount: number;
  rewardStatus: string;
  status: "active" | "suspended" | "terminated";
  createdAt: string;
}

export async function getAmbassadors(
  page: number = 1,
  limit: number = 20,
  filters?: Record<string, any>
): Promise<PaginatedResponse<Ambassador>> {
  try {
    const response = await axiosInstance.get("/admin/ambassadors", {
      params: { page, limit, ...filters },
    });
    const items = extractArray<Ambassador>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch ambassadors:", error);
    throw error;
  }
}

export async function approveAmbassador(id: string): Promise<Ambassador> {
  try {
    const response = await axiosInstance.post(`/admin/ambassadors/${id}/approve`);
    return extractItem<Ambassador>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to approve ambassador:", error);
    throw error;
  }
}

export async function rejectAmbassador(id: string): Promise<void> {
  try {
    await axiosInstance.post(`/admin/ambassadors/${id}/reject`);
  } catch (error) {
    console.error("[API] Failed to reject ambassador:", error);
    throw error;
  }
}

export async function terminateAmbassador(id: string): Promise<void> {
  try {
    await axiosInstance.post(`/admin/ambassadors/${id}/terminate`);
  } catch (error) {
    console.error("[API] Failed to terminate ambassador:", error);
    throw error;
  }
}

// ============== AUTHENTICATION ==============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    const data = extractItem<AuthResponse>(response.data) || response.data;
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    console.error("[API] Login failed:", message);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await axiosInstance.post("/auth/logout");
    localStorage.removeItem("auth_token");
  } catch (error) {
    console.error("[API] Logout failed:", error);
    localStorage.removeItem("auth_token");
  }
}

export async function getCurrentUser(): Promise<AuthResponse["user"]> {
  try {
    const response = await axiosInstance.get("/auth/me");
    return extractItem<AuthResponse["user"]>(response.data) || response.data.user;
  } catch (error) {
    console.error("[API] Failed to fetch current user:", error);
    throw error;
  }
}

// ============== SESSION BOOKINGS ==============

export interface SessionBooking {
  id: string;
  student: string;
  email: string;
  phone: string;
  sessionType: string;
  bookingDate: string;
  notes?: string;
  status: "pending" | "confirmed" | "rescheduled" | "completed" | "cancelled";
}

export async function getSessionBookings(
  page: number = 1,
  limit: number = 20,
  filters?: Record<string, any>
): Promise<PaginatedResponse<SessionBooking>> {
  try {
    const response = await axiosInstance.get("/admin/session-bookings", {
      params: { page, limit, ...filters },
    });
    const items = extractArray<SessionBooking>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch session bookings:", error);
    throw error;
  }
}

export async function confirmSessionBooking(id: string): Promise<SessionBooking> {
  try {
    const response = await axiosInstance.post(`/admin/session-bookings/${id}/confirm`);
    return extractItem<SessionBooking>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to confirm booking:", error);
    throw error;
  }
}

export async function rescheduleSessionBooking(
  id: string,
  newDate: string
): Promise<SessionBooking> {
  try {
    const response = await axiosInstance.post(`/admin/session-bookings/${id}/reschedule`, {
      newDate,
    });
    return extractItem<SessionBooking>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to reschedule booking:", error);
    throw error;
  }
}

export async function completeSessionBooking(id: string): Promise<SessionBooking> {
  try {
    const response = await axiosInstance.post(`/admin/session-bookings/${id}/complete`);
    return extractItem<SessionBooking>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to complete booking:", error);
    throw error;
  }
}

export async function cancelSessionBooking(id: string, reason?: string): Promise<void> {
  try {
    await axiosInstance.post(`/admin/session-bookings/${id}/cancel`, { reason });
  } catch (error) {
    console.error("[API] Failed to cancel booking:", error);
    throw error;
  }
}

// ============== INSTITUTES ==============

export interface Institute {
  id: string;
  name: string;
  location: string;
  studentCount: number;
  status: "active" | "inactive";
  createdAt: string;
}

export async function getInstitutes(
  page: number = 1,
  limit: number = 20,
  filters?: Record<string, any>
): Promise<PaginatedResponse<Institute>> {
  try {
    const response = await axiosInstance.get("/admin/institutes", {
      params: { page, limit, ...filters },
    });
    const items = extractArray<Institute>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch institutes:", error);
    throw error;
  }
}

export async function createInstitute(data: Partial<Institute>): Promise<Institute> {
  try {
    const response = await axiosInstance.post("/admin/institutes", data);
    return extractItem<Institute>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to create institute:", error);
    throw error;
  }
}

export async function updateInstitute(id: string, data: Partial<Institute>): Promise<Institute> {
  try {
    const response = await axiosInstance.put(`/admin/institutes/${id}`, data);
    return extractItem<Institute>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to update institute:", error);
    throw error;
  }
}

export async function deleteInstitute(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/admin/institutes/${id}`);
  } catch (error) {
    console.error("[API] Failed to delete institute:", error);
    throw error;
  }
}

// ============== AMBASSADORS ==============

export interface Ambassador {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  points: number;
  referrals: number;
  conversionCount: number;
  rewardStatus: string;
  status: "approved" | "pending" | "rejected" | "terminated";
  createdAt: string;
}

export async function getAmbassadors(
  page: number = 1,
  limit: number = 20,
  filters?: Record<string, any>
): Promise<PaginatedResponse<Ambassador>> {
  try {
    const response = await axiosInstance.get("/admin/ambassadors", {
      params: { page, limit, ...filters },
    });
    const items = extractArray<Ambassador>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch ambassadors:", error);
    throw error;
  }
}

export async function approveAmbassador(id: string): Promise<Ambassador> {
  try {
    const response = await axiosInstance.post(`/admin/ambassadors/${id}/approve`);
    return extractItem<Ambassador>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to approve ambassador:", error);
    throw error;
  }
}

export async function rejectAmbassador(id: string, reason?: string): Promise<void> {
  try {
    await axiosInstance.post(`/admin/ambassadors/${id}/reject`, { reason });
  } catch (error) {
    console.error("[API] Failed to reject ambassador:", error);
    throw error;
  }
}

export async function terminateAmbassador(id: string, reason?: string): Promise<void> {
  try {
    await axiosInstance.post(`/admin/ambassadors/${id}/terminate`, { reason });
  } catch (error) {
    console.error("[API] Failed to terminate ambassador:", error);
    throw error;
  }
}

// ============== EMPLOYEES ==============

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  role: string;
  access: string;
  permissions: string[];
  status: "active" | "inactive" | "suspended";
  joiningDate: string;
  lastLogin: string;
}

export async function getEmployees(
  page: number = 1,
  limit: number = 20,
  filters?: Record<string, any>
): Promise<PaginatedResponse<Employee>> {
  try {
    const response = await axiosInstance.get("/admin/employees", {
      params: { page, limit, ...filters },
    });
    const items = extractArray<Employee>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch employees:", error);
    throw error;
  }
}

export async function createEmployee(data: Partial<Employee>): Promise<Employee> {
  try {
    const response = await axiosInstance.post("/admin/employees", data);
    return extractItem<Employee>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to create employee:", error);
    throw error;
  }
}

export async function updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
  try {
    const response = await axiosInstance.put(`/admin/employees/${id}`, data);
    return extractItem<Employee>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to update employee:", error);
    throw error;
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/admin/employees/${id}`);
  } catch (error) {
    console.error("[API] Failed to delete employee:", error);
    throw error;
  }
}

export async function resetEmployeeAccess(id: string): Promise<Employee> {
  try {
    const response = await axiosInstance.post(`/admin/employees/${id}/reset-access`);
    return extractItem<Employee>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to reset employee access:", error);
    throw error;
  }
}

// ============== EVENTS ==============

export interface ReferralCode {
  code: string;
  discountType: "flat" | "percentage";
  flatDiscount?: number;
  percentageDiscount?: number;
  usageCount: number;
  maxUsage: number;
  expiryDate: string;
  active: boolean;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  status: "draft" | "published" | "closed" | "archived";
  registrations: number;
  createdAt: string;
  referralCodes?: ReferralCode[];
}

export async function getEvents(
  page: number = 1,
  limit: number = 20,
  filters?: Record<string, any>
): Promise<PaginatedResponse<Event>> {
  try {
    const response = await axiosInstance.get("/admin/events", {
      params: { page, limit, ...filters },
    });
    const items = extractArray<Event>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch events:", error);
    throw error;
  }
}

export async function createEvent(data: Partial<Event>): Promise<Event> {
  try {
    const response = await axiosInstance.post("/admin/events", data);
    return extractItem<Event>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to create event:", error);
    throw error;
  }
}

export async function updateEvent(id: string, data: Partial<Event>): Promise<Event> {
  try {
    const response = await axiosInstance.put(`/admin/events/${id}`, data);
    return extractItem<Event>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to update event:", error);
    throw error;
  }
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/admin/events/${id}`);
  } catch (error) {
    console.error("[API] Failed to delete event:", error);
    throw error;
  }
}

export async function publishEvent(id: string): Promise<Event> {
  try {
    const response = await axiosInstance.post(`/admin/events/${id}/publish`);
    return extractItem<Event>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to publish event:", error);
    throw error;
  }
}

export async function unpublishEvent(id: string): Promise<Event> {
  try {
    const response = await axiosInstance.post(`/admin/events/${id}/unpublish`);
    return extractItem<Event>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to unpublish event:", error);
    throw error;
  }
}

export async function addReferralCode(eventId: string, code: ReferralCode): Promise<Event> {
  try {
    const response = await axiosInstance.post(`/admin/events/${eventId}/referral-codes`, code);
    return extractItem<Event>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to add referral code:", error);
    throw error;
  }
}

// ============== REGISTRATIONS ==============

export interface Registration {
  id: string;
  student: string;
  event: string;
  status: "pending" | "approved" | "rejected" | "checkedin";
  paymentStatus: "pending" | "completed" | "failed";
  registrationDate: string;
}

export async function getRegistrations(
  page: number = 1,
  limit: number = 20,
  filters?: Record<string, any>
): Promise<PaginatedResponse<Registration>> {
  try {
    const response = await axiosInstance.get("/admin/registrations", {
      params: { page, limit, ...filters },
    });
    const items = extractArray<Registration>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch registrations:", error);
    throw error;
  }
}

export async function approveRegistration(id: string): Promise<Registration> {
  try {
    const response = await axiosInstance.post(`/admin/registrations/${id}/approve`);
    return extractItem<Registration>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to approve registration:", error);
    throw error;
  }
}

export async function rejectRegistration(id: string, reason?: string): Promise<void> {
  try {
    await axiosInstance.post(`/admin/registrations/${id}/reject`, { reason });
  } catch (error) {
    console.error("[API] Failed to reject registration:", error);
    throw error;
  }
}

export async function checkInRegistration(id: string): Promise<Registration> {
  try {
    const response = await axiosInstance.post(`/admin/registrations/${id}/checkin`);
    return extractItem<Registration>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to check in registration:", error);
    throw error;
  }
}

// ============== ANALYTICS ==============

export interface AnalyticsData {
  revenueOverTime: { date: string; amount: number }[];
  registrationTrends: { month: string; count: number }[];
  instituteGrowth: { month: string; count: number }[];
  ambassadorGrowth: { month: string; count: number }[];
  eventPerformance: { event: string; registrations: number; revenue: number }[];
  userGrowth: { month: string; count: number }[];
}

export async function getAnalyticsData(
  startDate?: string,
  endDate?: string
): Promise<AnalyticsData> {
  try {
    const response = await axiosInstance.get("/admin/analytics", {
      params: { startDate, endDate },
    });
    return extractMeta<AnalyticsData>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to fetch analytics:", error);
    throw error;
  }
}

// ============== PERMISSIONS ==============

export interface Permission {
  id: string;
  name: string;
  module: string;
  description?: string;
}

export async function getAllPermissions(): Promise<Permission[]> {
  try {
    const response = await axiosInstance.get("/admin/permissions");
    return extractArray<Permission>(response.data);
  } catch (error) {
    console.error("[API] Failed to fetch permissions:", error);
    throw error;
  }
}

export async function updateEmployeePermissions(
  employeeId: string,
  permissions: string[]
): Promise<Employee> {
  try {
    const response = await axiosInstance.put(
      `/admin/employees/${employeeId}/permissions`,
      { permissions }
    );
    return extractItem<Employee>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to update employee permissions:", error);
    throw error;
  }
}

// ============== SESSION MANAGER ==============

export interface Session {
  id: string;
  userId: string;
  ip: string;
  device: string;
  userAgent: string;
  lastActivity: string;
  createdAt: string;
}

export async function getLiveSessions(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Session>> {
  try {
    const response = await axiosInstance.get("/admin/sessions/live", {
      params: { page, limit },
    });
    const items = extractArray<Session>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch live sessions:", error);
    throw error;
  }
}

export async function revokeSession(sessionId: string): Promise<void> {
  try {
    await axiosInstance.post(`/admin/sessions/${sessionId}/revoke`);
  } catch (error) {
    console.error("[API] Failed to revoke session:", error);
    throw error;
  }
}

export async function revokeAllSessions(excludeCurrentSession: boolean = true): Promise<void> {
  try {
    await axiosInstance.post("/admin/sessions/revoke-all", {
      excludeCurrentSession,
    });
  } catch (error) {
    console.error("[API] Failed to revoke all sessions:", error);
    throw error;
  }
}

// ============== SECURITY CENTER ==============

export interface BlockedIP {
  id: string;
  ip: string;
  banReason: string;
  createdBy: string;
  createdDate: string;
  status: "active" | "inactive";
}

export interface BlockedUser {
  id: string;
  userId: string;
  banReason: string;
  createdBy: string;
  createdDate: string;
  status: "active" | "inactive";
}

export interface BlockedEmail {
  id: string;
  email: string;
  banReason: string;
  createdBy: string;
  createdDate: string;
  status: "active" | "inactive";
}

export async function getBlockedIPs(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<BlockedIP>> {
  try {
    const response = await axiosInstance.get("/admin/security/blocked-ips", {
      params: { page, limit },
    });
    const items = extractArray<BlockedIP>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch blocked IPs:", error);
    throw error;
  }
}

export async function blockIP(ip: string, reason: string): Promise<BlockedIP> {
  try {
    const response = await axiosInstance.post("/admin/security/blocked-ips", { ip, reason });
    return extractItem<BlockedIP>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to block IP:", error);
    throw error;
  }
}

export async function unblockIP(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/admin/security/blocked-ips/${id}`);
  } catch (error) {
    console.error("[API] Failed to unblock IP:", error);
    throw error;
  }
}

export async function getBlockedUsers(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<BlockedUser>> {
  try {
    const response = await axiosInstance.get("/admin/security/blocked-users", {
      params: { page, limit },
    });
    const items = extractArray<BlockedUser>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch blocked users:", error);
    throw error;
  }
}

export async function blockUser(userId: string, reason: string): Promise<BlockedUser> {
  try {
    const response = await axiosInstance.post("/admin/security/blocked-users", {
      userId,
      reason,
    });
    return extractItem<BlockedUser>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to block user:", error);
    throw error;
  }
}

export async function unblockUser(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/admin/security/blocked-users/${id}`);
  } catch (error) {
    console.error("[API] Failed to unblock user:", error);
    throw error;
  }
}

export async function getBlockedEmails(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<BlockedEmail>> {
  try {
    const response = await axiosInstance.get("/admin/security/blocked-emails", {
      params: { page, limit },
    });
    const items = extractArray<BlockedEmail>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch blocked emails:", error);
    throw error;
  }
}

export async function blockEmail(email: string, reason: string): Promise<BlockedEmail> {
  try {
    const response = await axiosInstance.post("/admin/security/blocked-emails", {
      email,
      reason,
    });
    return extractItem<BlockedEmail>(response.data) || response.data;
  } catch (error) {
    console.error("[API] Failed to block email:", error);
    throw error;
  }
}

export async function unblockEmail(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/admin/security/blocked-emails/${id}`);
  } catch (error) {
    console.error("[API] Failed to unblock email:", error);
    throw error;
  }
}

// ============== SYSTEM LOGS ==============

export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  result: "success" | "failure";
  logType: "audit" | "authentication" | "system" | "security";
}

export async function getSystemLogs(
  page: number = 1,
  limit: number = 50,
  filters?: Record<string, any>
): Promise<PaginatedResponse<SystemLog>> {
  try {
    const response = await axiosInstance.get("/admin/logs", {
      params: { page, limit, ...filters },
    });
    const items = extractArray<SystemLog>(response.data);
    const pagination = extractPagination(response.data);
    return {
      items,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
    };
  } catch (error) {
    console.error("[API] Failed to fetch system logs:", error);
    throw error;
  }
}

// Export axios instance for custom requests
export default axiosInstance;
