"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: SidebarItem[];
  disabled?: boolean;
}

export interface GlassSidebarProps {
  items: SidebarItem[];
  logo?: ReactNode;
  footer?: ReactNode;
}

export function GlassSidebar({ items, logo, footer }: GlassSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-screen backdrop-blur-xl bg-white/5 border-r border-white/10 flex flex-col overflow-y-auto"
    >
      {/* Logo */}
      {logo && (
        <div className="px-6 py-6 border-b border-white/10">
          {logo}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {items.map((item) => (
          <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-6 border-t border-white/10">
          {footer}
        </div>
      )}
    </motion.div>
  );
}

function NavItem({
  item,
  isActive,
}: {
  item: SidebarItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <div className="px-4 py-2.5 rounded-lg flex items-center gap-3 text-slate-500 opacity-50 cursor-not-allowed">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{item.label}</span>
      </div>
    );
  }

  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          px-4 py-2.5 rounded-lg flex items-center gap-3
          transition-all duration-200
          ${
            isActive
              ? "bg-blue-500/20 border border-blue-500/30 text-blue-200"
              : "text-slate-300 hover:bg-white/10 hover:border-white/20 border border-transparent"
          }
        `}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{item.label}</span>
      </motion.div>
    </Link>
  );
}
