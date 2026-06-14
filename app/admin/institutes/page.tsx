'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getInstitutes, createInstitute, updateInstitute, deleteInstitute } from '@/lib/api-client';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassTable } from '@/components/glass/GlassTable';
import { GlassModal } from '@/components/glass/GlassModal';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassEmptyState } from '@/components/GlassEmptyState';
import { SkeletonTable } from '@/components/skeletons/SkeletonTable';
import { PermissionGate } from '@/components/PermissionGate';
import { useForm } from 'react-hook-form';

export default function InstitutesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createModal, setCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm();

  const filters = {
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };

  const { data: instituteData, isLoading, refetch } = useQuery({
    queryKey: ['institutes', page, filters],
    queryFn: () => getInstitutes(page, 20, filters),
  });

  const onSubmit = async (data: any) => {
    try {
      if (editingId) {
        await updateInstitute(editingId, data);
        setEditingId(null);
      } else {
        await createInstitute(data);
      }
      refetch();
      reset();
      setCreateModal(false);
    } catch (error) {
      console.error('Failed to save institute:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this institute?')) {
      try {
        await deleteInstitute(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete institute:', error);
      }
    }
  };

  return (
    <PermissionGate permissions={['institutes.view']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Institutes</h1>
            <p className="text-slate-400 mt-2">Manage educational institutes</p>
          </div>
          <PermissionGate permissions={['institutes.manage']}>
            <GlassButton onClick={() => setCreateModal(true)}>Create Institute</GlassButton>
          </PermissionGate>
        </div>

        <GlassCard>
          <div className="flex gap-4 flex-wrap">
            <GlassInput
              placeholder="Search institutes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 min-w-[200px]"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-50 backdrop-blur-xl"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </GlassCard>

        {isLoading ? (
          <SkeletonTable />
        ) : instituteData?.items?.length === 0 ? (
          <GlassEmptyState
            title="No institutes found"
            description="Create a new institute to get started"
          />
        ) : (
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Location</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Students</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Created</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instituteData?.items?.map((institute, index) => (
                    <motion.tr
                      key={institute.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-700/50 hover:bg-slate-800/30"
                    >
                      <td className="py-3 px-4 text-slate-200">{institute.name}</td>
                      <td className="py-3 px-4 text-slate-400">{institute.location}</td>
                      <td className="py-3 px-4 text-slate-200">{institute.studentCount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          institute.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}>
                          {institute.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm">{new Date(institute.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <PermissionGate permissions={['institutes.manage']}>
                          <div className="flex gap-2">
                            <GlassButton
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setEditingId(institute.id);
                                setCreateModal(true);
                              }}
                            >
                              Edit
                            </GlassButton>
                            <GlassButton
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(institute.id)}
                            >
                              Delete
                            </GlassButton>
                          </div>
                        </PermissionGate>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        <GlassModal
          isOpen={createModal}
          onClose={() => {
            setCreateModal(false);
            setEditingId(null);
            reset();
          }}
          title={editingId ? 'Edit Institute' : 'Create Institute'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <GlassInput placeholder="Name" {...register('name')} />
            <GlassInput placeholder="Location" {...register('location')} />
            <div className="flex gap-2 justify-end">
              <GlassButton
                variant="secondary"
                onClick={() => {
                  setCreateModal(false);
                  setEditingId(null);
                  reset();
                }}
              >
                Cancel
              </GlassButton>
              <GlassButton type="submit">Save</GlassButton>
            </div>
          </form>
        </GlassModal>
      </div>
    </PermissionGate>
  );
}
