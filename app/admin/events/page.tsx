'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getEvents, createEvent, updateEvent, deleteEvent, publishEvent, unpublishEvent } from '@/lib/api-client';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassModal } from '@/components/glass/GlassModal';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassEmptyState } from '@/components/GlassEmptyState';
import { SkeletonTable } from '@/components/skeletons/SkeletonTable';
import { PermissionGate } from '@/components/PermissionGate';
import { useForm } from 'react-hook-form';

export default function EventsPage() {
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

  const { data: eventData, isLoading, refetch } = useQuery({
    queryKey: ['events', page, filters],
    queryFn: () => getEvents(page, 20, filters),
  });

  const onSubmit = async (data: any) => {
    try {
      if (editingId) {
        await updateEvent(editingId, data);
        setEditingId(null);
      } else {
        await createEvent(data);
      }
      refetch();
      reset();
      setCreateModal(false);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishEvent(id);
      refetch();
    } catch (error) {
      console.error('Failed to publish event:', error);
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishEvent(id);
      refetch();
    } catch (error) {
      console.error('Failed to unpublish event:', error);
    }
  };

  return (
    <PermissionGate permissions={['events.view']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Events</h1>
            <p className="text-slate-400 mt-2">Manage events and registrations</p>
          </div>
          <PermissionGate permissions={['events.manage']}>
            <GlassButton onClick={() => setCreateModal(true)}>Create Event</GlassButton>
          </PermissionGate>
        </div>

        <GlassCard>
          <div className="flex gap-4 flex-wrap">
            <GlassInput
              placeholder="Search events..."
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
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </GlassCard>

        {isLoading ? (
          <SkeletonTable />
        ) : eventData?.items?.length === 0 ? (
          <GlassEmptyState
            title="No events found"
            description="Create a new event to get started"
          />
        ) : (
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Registrations</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eventData?.items?.map((event: any, index: number) => (
                    <motion.tr
                      key={event.id || event._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-700/50 hover:bg-slate-800/30"
                    >
                      <td className="py-3 px-4 text-slate-200">{event.name}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-200">{event.registrations}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          event.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : event.status === 'draft'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <PermissionGate permissions={['events.manage']}>
                          <div className="flex gap-2 flex-wrap">
                            {event.status === 'draft' && (
                              <GlassButton
                                size="sm"
                                variant="secondary"
                                onClick={() => handlePublish(event.id)}
                              >
                                Publish
                              </GlassButton>
                            )}
                            {event.status === 'published' && (
                              <GlassButton
                                size="sm"
                                variant="secondary"
                                onClick={() => handleUnpublish(event.id)}
                              >
                                Unpublish
                              </GlassButton>
                            )}
                            <GlassButton
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setEditingId(event.id);
                                setCreateModal(true);
                              }}
                            >
                              Edit
                            </GlassButton>
                            <GlassButton
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(event.id)}
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
          title={editingId ? 'Edit Event' : 'Create Event'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <GlassInput placeholder="Event Name" {...register('name')} />
            <GlassInput placeholder="Date" type="date" {...register('date')} />
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
