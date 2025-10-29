"use client";

import { CheckCircle, XCircle, Eye, Calendar, RefreshCw } from "lucide-react";
import { LeaveStatusBadge } from "./LeaveStatusBadge";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
  days?: number;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    department?: string;
  };
  appliedDate?: string;
  policy?: {
    name: string;
  };
}

interface LeaveTableProps {
  leaves: LeaveRequest[];
  role: string;
  onApprove?: (id: string, status: LeaveStatus) => Promise<void> | void; // allow async
  onView?: (leave: LeaveRequest) => void;
  loading?: boolean;
}

export default function LeaveTable({
  leaves,
  role,
  onApprove,
  onView,
  loading = false,
}: LeaveTableProps) {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate duration
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const isAdmin = role === "ADMIN" || role === "HR" || role === "MANAGER";

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm transition-colors">
        <div className="p-8 text-center">
          <RefreshCw className="w-8 h-8 text-[var(--text-muted)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border-color)]">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">
          Leave Requests
        </h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {leaves.length} total requests
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--background)]/30">
              {isAdmin && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)]">
                  Employee
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)]">
                Leave Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)]">
                Duration
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)]">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--text-muted)]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-color)]">
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <tr
                  key={leave.id}
                  className="hover:bg-[var(--hover-bg)] transition-colors duration-150"
                >
                  {/* Employee Info (Admin only) */}
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">
                            {leave.employee?.firstName?.[0]}
                            {leave.employee?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)] text-sm">
                            {leave.employee?.firstName}{" "}
                            {leave.employee?.lastName}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {leave.employee?.department || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Leave Type */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-500 border border-blue-700/30 dark:bg-blue-500/10 dark:text-blue-300">
                    {leave.policy?.name || "-"}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-[var(--text-primary)]">
                        {formatDate(leave.startDate)} -{" "}
                        {formatDate(leave.endDate)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {calculateDuration(leave.startDate, leave.endDate)}{" "}
                        {calculateDuration(leave.startDate, leave.endDate) === 1
                          ? "day"
                          : "days"}
                      </p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <LeaveStatusBadge
                      status={leave.status}
                      size="sm"
                      variant="subtle"
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* View */}
                      <button
                        onClick={() => onView?.(leave)}
                        className="p-2 text-[var(--text-muted)] hover:text-blue-500 hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Admin Actions */}
                      {isAdmin && leave.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => onApprove?.(leave.id, "APPROVED")}
                            className="p-2 text-green-500 hover:text-green-400 hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
                            title="Approve request"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onApprove?.(leave.id, "REJECTED")}
                            className="p-2 text-red-500 hover:text-red-400 hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
                            title="Reject request"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isAdmin ? 5 : 4}
                  className="px-6 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[var(--background)] border border-[var(--border-color)] rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                        No leave requests found
                      </p>
                      <p className="text-[var(--text-muted)]">
                        Leave requests will appear here once submitted.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
