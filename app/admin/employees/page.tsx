'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  resetEmployeeAccess,
  getAllPermissions,
  updateEmployeePermissions,
} from '@/lib/api-client';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassModal } from '@/components/glass/GlassModal';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassEmptyState } from '@/components/GlassEmptyState';
import { SkeletonTable } from '@/components/skeletons/SkeletonTable';
import { PermissionGate } from '@/components/PermissionGate';
import { useForm } from 'react-hook-form';
import { UserPlus, Shield, Key } from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'events', label: 'Events' },
  { id: 'registrations', label: 'Registrations' },
  { id: 'institutes', label: 'Institutes' },
  { id: 'students', label: 'Students' },
  { id: 'ambassadors', label: 'Ambassadors' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'financial', label: 'Financial' },
  { id: 'settings', label: 'Settings' }
];

export default function EmployeesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [permissionsModal, setPermissionsModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  
  const formPermissions = watch('permissions') || [];

  const { data: employeeData, isLoading, refetch } = useQuery({
    queryKey: ['employees', page, search],
    queryFn: () => getEmployees(page, 20, { search: search || undefined }),
  });

  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: getAllPermissions,
  });

  const onSubmit = async (data: any) => {
    try {
      if (editingId) {
        await updateEmployee(editingId, data);
        setEditingId(null);
      } else {
        await createEmployee(data);
      }
      refetch();
      reset();
      setCreateModal(false);
    } catch (error) {
      console.error('Failed to save employee:', error);
    }
  };

  const handlePermissionsUpdate = async () => {
    if (!selectedEmployee) return;
    try {
      await updateEmployeePermissions(selectedEmployee.id, selectedPermissions);
      refetch();
      setPermissionsModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Failed to update permissions:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure? This action cannot be undone.')) {
      try {
        await deleteEmployee(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const handleResetAccess = async (id: string) => {
    try {
      await resetEmployeeAccess(id);
      refetch();
    } catch (error) {
      console.error('Failed to reset access:', error);
    }
  };

  return (
    <PermissionGate permissions={['employees.manage']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Employees</h1>
            <p className="text-slate-400 mt-2">Manage employee accounts and view directory</p>
          </div>
          <PermissionGate superAdminOnly>
            <GlassButton onClick={() => {
              setEditingId(null);
              reset();
              setValue('permissions', []);
              setCreateModal(true);
            }}>
              <UserPlus className="w-4 h-4 mr-2" /> Add Employee
            </GlassButton>
          </PermissionGate>
        </div>

        <GlassCard>
          <GlassInput
            placeholder="Search employees..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 min-w-[200px]"
          />
        </GlassCard>

        {isLoading ? (
          <SkeletonTable />
        ) : employeeData?.items?.length === 0 ? (
          <GlassEmptyState
            title="No employees found"
            description="Create a new employee to get started"
          />
        ) : (
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Employee</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Access</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Department</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Joining Date</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(employeeData?.items || [])
                    .filter((emp: any) => emp.employeeId !== 'ADMIN-2026' && emp.role !== 'super_admin')
                    .map((employee: any, index: number) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-700/50 hover:bg-slate-800/30"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium border border-slate-700">
                            {employee.name ? employee.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="text-slate-200 font-medium">{employee.name}</div>
                            <div className="text-slate-400 text-xs">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200 capitalize">{employee.role?.replace('_', ' ')}</div>
                        <div className="text-slate-400 text-xs font-mono">{employee.employeeId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(employee.permissions || []).slice(0, 3).map((p: string) => (
                            <span key={p} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 capitalize">{p}</span>
                          ))}
                          {(employee.permissions || []).length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">+{employee.permissions.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{employee.department}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : (employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString() : 'N/A')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          employee.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : employee.status === 'suspended'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 flex-wrap">
                          <PermissionGate superAdminOnly>
                            <GlassButton
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setSelectedPermissions(employee.permissions);
                                setPermissionsModal(true);
                              }}
                            >
                              Permissions
                            </GlassButton>
                            <GlassButton
                              size="sm"
                              variant="secondary"
                              onClick={() => handleResetAccess(employee.id)}
                            >
                              Reset Access
                            </GlassButton>
                            <GlassButton
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(employee.id)}
                            >
                              Delete
                            </GlassButton>
                          </PermissionGate>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Create/Edit Modal */}
        <GlassModal
          isOpen={createModal}
          onClose={() => {
            setCreateModal(false);
            setEditingId(null);
            reset();
          }}
          title={editingId ? 'Edit Employee' : 'Create Employee'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <GlassInput placeholder="Employee ID (Optional)" {...register('employeeId')} />
              <GlassInput placeholder="Designation" {...register('designation')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <GlassInput placeholder="Name" {...register('name')} required />
              <GlassInput placeholder="Email" type="email" {...register('email')} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <GlassInput placeholder="Department" {...register('department')} required />
              <GlassInput placeholder="Role (e.g. employee, admin)" {...register('role')} required />
            </div>
            {!editingId && (
              <div className="grid grid-cols-2 gap-4">
                <GlassInput placeholder="Password" type="password" {...register('password')} />
              </div>
            )}
            
            <PermissionGate superAdminOnly>
              <div className="mt-6 border-t border-slate-700/50 pt-4">
                <h3 className="text-sm font-medium text-slate-200 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-gold-400" /> Module Access Permissions</h3>
                <div className="grid grid-cols-3 gap-3">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = formPermissions.includes(perm.id);
                    return (
                      <label key={perm.id} className="flex items-center gap-2 cursor-pointer bg-slate-800/30 p-2 rounded border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setValue('permissions', [...formPermissions, perm.id]);
                            } else {
                              setValue('permissions', formPermissions.filter((p: string) => p !== perm.id));
                            }
                          }}
                          className="w-4 h-4 rounded accent-gold-500 bg-slate-900 border-slate-700"
                        />
                        <span className="text-slate-300 text-sm">{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </PermissionGate>

            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-slate-700/50">
              <GlassButton
                variant="secondary"
                type="button"
                onClick={() => {
                  setCreateModal(false);
                  setEditingId(null);
                  reset();
                }}
              >
                Cancel
              </GlassButton>
              <GlassButton type="submit">Save Employee</GlassButton>
            </div>
          </form>
        </GlassModal>

        {/* Permissions Modal */}
        <GlassModal
          isOpen={permissionsModal}
          onClose={() => {
            setPermissionsModal(false);
            setSelectedEmployee(null);
          }}
          title={`Manage Permissions: ${selectedEmployee?.name}`}
        >
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {AVAILABLE_PERMISSIONS.map((perm) => (
              <label key={perm.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(perm.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPermissions([...selectedPermissions, perm.id]);
                    } else {
                      setSelectedPermissions(selectedPermissions.filter(p => p !== perm.id));
                    }
                  }}
                  className="w-5 h-5 rounded accent-gold-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="text-slate-200 text-sm font-medium">{perm.label}</div>
                  <div className="text-slate-400 text-xs">Grant access to the {perm.label} module</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <GlassButton
              variant="secondary"
              onClick={() => {
                setPermissionsModal(false);
                setSelectedEmployee(null);
              }}
            >
              Cancel
            </GlassButton>
            <GlassButton onClick={handlePermissionsUpdate}>Save Permissions</GlassButton>
          </div>
        </GlassModal>
      </div>
    </PermissionGate>
  );
}
