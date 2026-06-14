'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Shield,
  ChevronDown,
  Sun
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navigationItems = [
    { label: 'Dashboard', href: '/admin', icon: BarChart3 },
    { label: 'Session Bookings', href: '/admin/session-bookings', icon: Calendar },
    { label: 'Users / Students', href: '/admin/students', icon: Users },
    { label: 'Ambassadors', href: '/admin/ambassadors', icon: Users }, // Mocked
    { label: 'Institutes', href: '/admin/institutes', icon: Users }, // Mocked
    { label: 'Employees', href: '/admin/employees', icon: Users }, // Mocked
    { label: 'Events', href: '/admin/events', icon: Calendar }, // Mocked
    { label: 'Registrations', href: '/admin/registrations', icon: Calendar }, // Mocked
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 }, // Mocked
    { label: 'Session Manager', href: '/admin/session-manager', icon: Calendar }, // Mocked
    { label: 'Security Center', href: '/admin/security-center', icon: Shield }, // Mocked
    { label: 'Settings', href: '/admin/settings', icon: Settings },
    { label: 'System Logs', href: '/admin/system-logs', icon: Settings }, // Mocked
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      
      {/* Floating Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0, width: sidebarOpen ? 280 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="liquid-glass glass-edge rounded-3xl m-4 h-[calc(100vh-2rem)] flex flex-col flex-shrink-0 z-20"
      >
        {/* Logo/Header */}
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center font-bold text-background shadow-lg shadow-gold-500/30">
                  TM
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-tight tracking-tight">TechMNHub</h1>
                  <p className="text-[10px] tracking-widest text-gold-500 font-semibold uppercase">Admin Panel</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar px-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!sidebarOpen ? item.label : undefined}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
                  active
                    ? 'text-gold-400'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-gold-500/10 border border-gold-500/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-gold-400 to-gold-600 rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'group-hover:scale-110'}`} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm font-medium whitespace-nowrap relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User / Profile Mini View */}
        <div className="p-4 mt-auto">
          <div className="liquid-glass rounded-2xl p-3 flex items-center gap-3 border-white/5">
            <div className="w-10 h-10 rounded-full bg-black border border-gold-500/30 flex items-center justify-center font-bold text-gold-500 shadow-inner">
              SA
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">Super Admin</p>
                <p className="text-xs text-muted-foreground truncate">superadmin@techmnhub.com</p>
              </div>
            )}
            {sidebarOpen && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-4 pr-4 pb-4">
        
        {/* Floating Topbar */}
        <header className="flex justify-between items-center mb-6 pl-2 gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="liquid-glass rounded-full px-4 py-2.5 flex items-center gap-3 border border-white/10 group focus-within:border-gold-500/50 focus-within:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all">
              <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-gold-400" />
              <input 
                placeholder="Search anything...          ⌘K" 
                className="bg-transparent border-none outline-none w-full text-sm text-white placeholder:text-muted-foreground" 
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative w-10 h-10 rounded-full liquid-glass flex items-center justify-center hover:bg-white/10 transition-colors">
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-gold-500 text-[10px] font-bold text-black flex items-center justify-center rounded-full border border-black">12</span>
            </button>
            {/* Shield */}
            <button className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center hover:bg-white/10 transition-colors">
              <Shield className="w-4 h-4 text-white" />
            </button>
            
            {/* Profile Pill */}
            <div className="liquid-glass rounded-full pl-2 pr-4 py-1.5 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors border border-white/10">
              <div className="w-8 h-8 rounded-full bg-black border border-gold-500/50 flex items-center justify-center text-xs font-bold text-gold-500">
                SA
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none text-white">Super Admin</span>
                <span className="text-[10px] text-muted-foreground">Super Administrator</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
            </div>

            {/* Theme Toggle */}
            <button className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center hover:bg-white/10 transition-colors ml-1">
              <Sun className="w-4 h-4 text-gold-400" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden rounded-3xl relative">
          {children}
        </div>
      </main>

    </div>
  );
};
