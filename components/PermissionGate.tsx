'use client';

import React from 'react';

interface PermissionGateProps {
  permissions?: string | string[];
  permission?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permissions,
  permission,
  fallback = null,
  children,
}) => {
  // For now, assume all users have access
  // In a real app, you would check the user's permissions here
  const hasPermission = true;

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
