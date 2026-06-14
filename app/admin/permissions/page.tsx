'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getAllPermissions } from '@/lib/api-client';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassEmptyState } from '@/components/GlassEmptyState';
import { SkeletonCard } from '@/components/skeletons/SkeletonCard';
import { PermissionGate } from '@/components/PermissionGate';

export default function PermissionsPage() {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: getAllPermissions,
  });

  const groupedPermissions = permissions
    ? permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
      }, {} as Record<string, typeof permissions>)
    : {};

  return (
    <PermissionGate permissions={['permissions.manage']} superAdminOnly>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Permissions</h1>
          <p className="text-slate-400 mt-2">Manage granular permissions for employees</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : !permissions || permissions.length === 0 ? (
          <GlassEmptyState
            title="No permissions found"
            description="Contact your system administrator"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedPermissions).map(([module, perms], moduleIndex) => (
              <motion.div
                key={module}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: moduleIndex * 0.05 }}
              >
                <GlassCard>
                  <h3 className="text-lg font-semibold text-slate-50 mb-4 capitalize">{module}</h3>
                  <div className="space-y-3">
                    {perms.map((perm) => (
                      <div
                        key={perm.id}
                        className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                      >
                        <div className="font-medium text-slate-200">{perm.name}</div>
                        {perm.description && (
                          <div className="text-sm text-slate-400 mt-1">{perm.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-200 text-sm">
            Permissions are assigned to employees on the Employees page. This page shows all available permissions grouped by module.
          </p>
        </div>
      </div>
    </PermissionGate>
  );
}
