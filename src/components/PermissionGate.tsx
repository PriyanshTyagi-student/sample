"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { AlertCircle } from "lucide-react";

export interface PermissionGateProps {
  children: ReactNode;
  permissions?: string | string[];
  requireAll?: boolean;
  superAdminOnly?: boolean;
  fallback?: ReactNode;
}

export function PermissionGate({
  children,
  permissions,
  requireAll = false,
  superAdminOnly = false,
  fallback,
}: PermissionGateProps) {
  const { hasPermission, isSuperAdmin, checkPermissions, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return fallback || <AccessDeniedFallback message="Please log in to access this page" />;
  }

  // Check Super Admin requirement
  if (superAdminOnly && !isSuperAdmin()) {
    return fallback || <AccessDeniedFallback message="Super Admin access required" />;
  }

  // Check permissions
  if (permissions) {
    const permArray = Array.isArray(permissions) ? permissions : [permissions];

    if (requireAll) {
      if (!checkPermissions(permArray)) {
        return fallback || <AccessDeniedFallback message="Insufficient permissions" />;
      }
    } else {
      if (!permArray.some((perm) => hasPermission(perm))) {
        return fallback || <AccessDeniedFallback message="Insufficient permissions" />;
      }
    }
  }

  return <>{children}</>;
}

function AccessDeniedFallback({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="max-w-md w-full">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-orange-500/10 border border-orange-500/20">
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-300 mb-6">{message}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-all duration-200 border border-white/20 hover:border-white/30"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
