"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudents, updateStudent, deleteStudent } from "@/lib/api-client";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassTable } from "@/components/glass/GlassTable";
import { GlassEmptyState } from "@/components/GlassEmptyState";
import { SkeletonTable } from "@/components/skeletons/SkeletonTable";
import { Search, Filter, UserPlus, Mail, Phone, Building, Calendar, Users } from "lucide-react";

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [instituteFilter, setInstituteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [modalAction, setModalAction] = useState<"view" | "edit" | "delete" | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const filters: Record<string, any> = {
    ...(search && { search }),
    ...(instituteFilter && { institute: instituteFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["students", page, limit, filters],
    queryFn: () => getStudents(page, limit, filters),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateStudent(selectedStudent.id, editForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setModalAction(null);
      setSelectedStudent(null);
      setEditForm({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudent(selectedStudent.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setModalAction(null);
      setSelectedStudent(null);
    },
  });

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "suspended":
        return "danger";
      case "inactive":
        return "cancelled";
      default:
        return "default";
    }
  };

  if (error) {
    return (
      <GlassCard className="p-6 border-red-500/30 bg-red-500/10">
        <p className="text-red-200">Failed to load students. Please try again.</p>
      </GlassCard>
    );
  }

  return (
    <div>
      {/* Header with Add Student button */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Students</h1>
        <GlassButton variant="primary" icon={<UserPlus className="w-4 h-4" />}>
          Add Student
        </GlassButton>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <GlassInput
          placeholder="Search by name or email..."
          icon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <GlassInput
          placeholder="Institute..."
          value={instituteFilter}
          onChange={(e) => {
            setInstituteFilter(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
        {(search || instituteFilter || statusFilter) && (
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch("");
              setInstituteFilter("");
              setStatusFilter("");
              setPage(1);
            }}
          >
            Clear
          </GlassButton>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable />
      ) : error ? (
        <GlassCard className="p-6 border-red-500/30 bg-red-500/10">
          <p className="text-red-200">Failed to load students. Please try again.</p>
        </GlassCard>
      ) : data && data.items && data.items.length > 0 ? (
        <>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Institute</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Join Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items?.map((student, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-white">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-white/80">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-white/80">{student.phone || "—"}</td>
                      <td className="px-6 py-4 text-sm text-white/80">{student.institution || "—"}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${student.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/80">{new Date(student.joinDate || '').toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of{" "}
              {data.total} students
            </p>
            <div className="flex gap-2">
              <GlassButton
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </GlassButton>
              <GlassButton
                variant="secondary"
                size="sm"
                disabled={page >= data.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </GlassButton>
            </div>
          </div>
        </>
      ) : (
        <GlassEmptyState
          icon={Users}
          title="No Students Found"
          description="There are no students matching your filters."
        />
      )}

      {/* View/Edit Modal */}
      <GlassModal
        isOpen={modalAction === "view" && !!selectedStudent}
        onClose={() => {
          setModalAction(null);
          setSelectedStudent(null);
          setEditForm({});
        }}
        title="Student Details"
        actions={
          <>
            <GlassButton
              variant="secondary"
              onClick={() => {
                setModalAction(null);
                setSelectedStudent(null);
                setEditForm({});
              }}
            >
              Close
            </GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400">Name</p>
            <p className="text-white font-medium">{selectedStudent?.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Email</p>
            <p className="text-white font-medium">{selectedStudent?.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Phone</p>
            <p className="text-white font-medium">{selectedStudent?.phone}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Institute</p>
            <p className="text-white font-medium">{selectedStudent?.institute}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Status</p>
            <GlassBadge variant={statusBadgeVariant(selectedStudent?.status)}>
              {selectedStudent?.status.charAt(0).toUpperCase() + selectedStudent?.status.slice(1)}
            </GlassBadge>
          </div>
          <div>
            <p className="text-xs text-slate-400">Created</p>
            <p className="text-white font-medium">
              {new Date(selectedStudent?.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </GlassModal>

      {/* Delete Modal */}
      <GlassModal
        isOpen={modalAction === "delete" && !!selectedStudent}
        onClose={() => {
          setModalAction(null);
          setSelectedStudent(null);
        }}
        title="Suspend Student"
        actions={
          <>
            <GlassButton
              variant="secondary"
              onClick={() => {
                setModalAction(null);
                setSelectedStudent(null);
              }}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => {
                const newData = { ...selectedStudent, status: "suspended" };
                updateStudent(selectedStudent.id, newData).then(() => {
                  queryClient.invalidateQueries({ queryKey: ["students"] });
                  setModalAction(null);
                  setSelectedStudent(null);
                });
              }}
            >
              Suspend
            </GlassButton>
          </>
        }
      >
        <p className="text-slate-300">
          Are you sure you want to suspend <span className="font-semibold text-white">{selectedStudent?.name}</span>?
          They will not be able to book sessions.
        </p>
      </GlassModal>
    </div>
  );
}
