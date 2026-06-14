"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { GlassSidebar, SidebarItem } from "@/components/glass/GlassSidebar";
import { GlassButton } from "@/components/glass/GlassButton";
import { PermissionGate } from "@/components/PermissionGate";
import {
  BarChart3,
  Calendar,
  Users,
  UserCheck,
  Building,
  Briefcase,
  Zap,
  ClipboardList,
  LineChart,
  Lock,
  Monitor,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  actions?: ReactNode;
}

export function AdminLayout({ children, pageTitle, actions }: AdminLayoutProps) {
  const { user, logout, hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Build sidebar items based on permissions
  const sidebarItems: SidebarItem[] = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: BarChart3,
    },
    {
      label: "Session Bookings",
      href: "/admin/session-bookings",
      icon: Calendar,
      disabled: !hasPermission("session_bookings.view"),
    },
    {
      label: "Students",
      href: "/admin/students",
      icon: Users,
      disabled: !hasPermission("students.view"),
    },
    {
      label: "Ambassadors",
      href: "/admin/ambassadors",
      icon: UserCheck,
      disabled: !hasPermission("ambassadors.view"),
    },
    {
      label: "Institutes",
      href: "/admin/institutes",
      icon: Building,
      disabled: !hasPermission("institutes.view"),
    },
    {
      label: "Employees",
      href: "/admin/employees",
      icon: Briefcase,
      disabled: !hasPermission("employees.view"),
    },
    {
      label: "Events",
      href: "/admin/events",
      icon: Zap,
      disabled: !hasPermission("events.view"),
    },
    {
      label: "Registrations",
      href: "/admin/registrations",
      icon: ClipboardList,
      disabled: !hasPermission("registrations.view"),
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: LineChart,
      disabled: !hasPermission("analytics.view"),
    },
    {
      label: "Permissions",
      href: "/admin/permissions",
      icon: Lock,
      disabled: !hasPermission("permissions.manage"),
    },
    {
      label: "Session Manager",
      href: "/admin/session-manager",
      icon: Monitor,
      disabled: !hasPermission("session_manager.manage"),
    },
    {
      label: "Security Center",
      href: "/admin/security-center",
      icon: Shield,
      disabled: !hasPermission("security.manage"),
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      disabled: !hasPermission("settings.manage"),
    },
    {
      label: "System Logs",
      href: "/admin/system-logs",
      icon: LineChart,
      disabled: !hasPermission("system_logs.view"),
    },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      {sidebarOpen && (
        <GlassSidebar
          items={sidebarItems}
          logo={
            <div>
              <h1 className="text-xl font-bold text-white">TechMNHub</h1>
              <p className="text-xs text-slate-400">Admin Dashboard</p>
            </div>
          }
          footer={
            <div className="space-y-2">
              <div className="text-sm">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-slate-200 font-medium truncate">{user?.email}</p>
              </div>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                icon={<LogOut className="w-4 h-4" />}
                className="w-full justify-center"
              >
                Logout
              </GlassButton>
            </div>
          }
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="backdrop-blur-xl bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-slate-300" />
              ) : (
                <Menu className="w-5 h-5 text-slate-300" />
              )}
            </button>
            {pageTitle && <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
