"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSessionBookings,
  confirmSessionBooking,
  rescheduleSessionBooking,
  completeSessionBooking,
  cancelSessionBooking,
} from "@/lib/api-client";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassModal } from "@/components/glass/GlassModal";
import { GlassBadge } from "@/components/glass/GlassBadge";
import { GlassTable } from "@/components/glass/GlassTable";
import { GlassEmptyState } from "@/components/GlassEmptyState";
import { SkeletonTable } from "@/components/skeletons/SkeletonTable";
import { Search, FilterX, Calendar } from "lucide-react";

export default function SessionBookingsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalAction, setModalAction] = useState<
    "confirm" | "reschedule" | "complete" | "cancel" | null
  >(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const filters: Record<string, any> = {
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["session-bookings", page, limit, filters],
    queryFn: () => getSessionBookings(page, limit, filters),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmSessionBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-bookings"] });
      setModalAction(null);
      setSelectedBooking(null);
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: () => rescheduleSessionBooking(selectedBooking.id, rescheduleDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-bookings"] });
      setModalAction(null);
      setSelectedBooking(null);
      setRescheduleDate("");
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeSessionBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-bookings"] });
      setModalAction(null);
      setSelectedBooking(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelSessionBooking(selectedBooking.id, cancelReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-bookings"] });
      setModalAction(null);
      setSelectedBooking(null);
      setCancelReason("");
    },
  });

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      case "pending":
        return "pending";
      default:
        return "default";
    }
  };

  if (error) {
    return (
      <GlassCard className="p-6 border-red-500/30 bg-red-500/10">
        <p className="text-red-200">Failed to load session bookings. Please try again.</p>
      </GlassCard>
    );
  }

  return (
    <div>
      {/* Header with Filter button */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Session Bookings</h1>
        <GlassButton variant="secondary">
          <FilterX className="w-4 h-4" />
          Filter
        </GlassButton>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassInput
          placeholder="Search by student name..."
          icon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
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
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {(search || statusFilter) && (
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setPage(1);
            }}
          >
            Clear Filters
          </GlassButton>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable />
      ) : data && data.items.length > 0 ? (
        <>
          <GlassTable
            columns={[
              { key: "student" as const, label: "Student" },
              { key: "email" as const, label: "Email" },
              { key: "phone" as const, label: "Phone" },
              { key: "sessionType" as const, label: "Session Type" },
              { key: "bookingDate" as const, label: "Booking Date" },
              {
                key: "status" as const,
                label: "Status",
                render: (value) => (
                  <GlassBadge variant={statusBadgeVariant(value)}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </GlassBadge>
                ),
              },
              {
                key: "id" as const,
                label: "Actions",
                render: (_, row) => (
                  <div className="flex gap-2">
                    {row.status === "pending" && (
                      <GlassButton
                        size="sm"
                        variant="success"
                        onClick={() => {
                          setSelectedBooking(row);
                          setModalAction("confirm");
                        }}
                      >
                        Confirm
                      </GlassButton>
                    )}
                    {["pending", "confirmed"].includes(row.status) && (
                      <GlassButton
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedBooking(row);
                          setModalAction("reschedule");
                        }}
                      >
                        Reschedule
                      </GlassButton>
                    )}
                    {row.status === "confirmed" && (
                      <GlassButton
                        size="sm"
                        variant="success"
                        onClick={() => {
                          setSelectedBooking(row);
                          setModalAction("complete");
                        }}
                      >
                        Complete
                      </GlassButton>
                    )}
                    {["pending", "confirmed", "rescheduled"].includes(row.status) && (
                      <GlassButton
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setSelectedBooking(row);
                          setModalAction("cancel");
                        }}
                      >
                        Cancel
                      </GlassButton>
                    )}
                  </div>
                ),
              },
            ]}
            data={data.items}
          />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of{" "}
              {data.total} bookings
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
          icon={Calendar}
          title="No Session Bookings"
          description="There are no session bookings matching your filters."
        />
      )}

      {/* Modals */}
      <GlassModal
        isOpen={modalAction === "confirm" && !!selectedBooking}
        onClose={() => {
          setModalAction(null);
          setSelectedBooking(null);
        }}
        title="Confirm Booking"
        actions={
          <>
            <GlassButton
              variant="secondary"
              onClick={() => {
                setModalAction(null);
                setSelectedBooking(null);
              }}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="success"
              isLoading={confirmMutation.isPending}
              onClick={() => confirmMutation.mutate(selectedBooking.id)}
            >
              Confirm
            </GlassButton>
          </>
        }
      >
        <p className="text-slate-300">
          Are you sure you want to confirm this booking for{" "}
          <span className="font-semibold text-white">{selectedBooking?.student}</span>?
        </p>
      </GlassModal>

      <GlassModal
        isOpen={modalAction === "reschedule" && !!selectedBooking}
        onClose={() => {
          setModalAction(null);
          setSelectedBooking(null);
          setRescheduleDate("");
        }}
        title="Reschedule Booking"
        actions={
          <>
            <GlassButton
              variant="secondary"
              onClick={() => {
                setModalAction(null);
                setSelectedBooking(null);
                setRescheduleDate("");
              }}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              isLoading={rescheduleMutation.isPending}
              onClick={() => rescheduleMutation.mutate()}
              disabled={!rescheduleDate}
            >
              Reschedule
            </GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            Reschedule booking for{" "}
            <span className="font-semibold text-white">{selectedBooking?.student}</span>
          </p>
          <GlassInput
            type="datetime-local"
            label="New Date & Time"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
          />
        </div>
      </GlassModal>

      <GlassModal
        isOpen={modalAction === "complete" && !!selectedBooking}
        onClose={() => {
          setModalAction(null);
          setSelectedBooking(null);
        }}
        title="Complete Booking"
        actions={
          <>
            <GlassButton
              variant="secondary"
              onClick={() => {
                setModalAction(null);
                setSelectedBooking(null);
              }}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="success"
              isLoading={completeMutation.isPending}
              onClick={() => completeMutation.mutate(selectedBooking.id)}
            >
              Complete
            </GlassButton>
          </>
        }
      >
        <p className="text-slate-300">
          Mark this booking as completed for{" "}
          <span className="font-semibold text-white">{selectedBooking?.student}</span>?
        </p>
      </GlassModal>

      <GlassModal
        isOpen={modalAction === "cancel" && !!selectedBooking}
        onClose={() => {
          setModalAction(null);
          setSelectedBooking(null);
          setCancelReason("");
        }}
        title="Cancel Booking"
        actions={
          <>
            <GlassButton
              variant="secondary"
              onClick={() => {
                setModalAction(null);
                setSelectedBooking(null);
                setCancelReason("");
              }}
            >
              Keep Booking
            </GlassButton>
            <GlassButton
              variant="danger"
              isLoading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              Cancel Booking
            </GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            Cancel booking for{" "}
            <span className="font-semibold text-white">{selectedBooking?.student}</span>?
          </p>
          <GlassInput
            label="Cancellation Reason (optional)"
            placeholder="Enter reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
      </GlassModal>
    </div>
  );
}
