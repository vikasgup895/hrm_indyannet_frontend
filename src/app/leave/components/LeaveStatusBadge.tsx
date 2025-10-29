"use client";

import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Pause,
  RotateCcw,
  Ban,
} from "lucide-react";
import { useState } from "react";

export type LeaveStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "CANCELLED"
  | "DRAFT"
  | "REVIEW"
  | "EXPIRED";

interface LeaveStatusBadgeProps {
  status: LeaveStatus | string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "subtle" | "outline";
  showIcon?: boolean;
  className?: string;
}

export function LeaveStatusBadge({
  status,
  size = "md",
  variant = "solid",
  showIcon = true,
  className = "",
}: LeaveStatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();

  // 🎨 Unified theme-aware color config
  const statusConfig = {
    APPROVED: {
      colors: {
        solid: "bg-green-600 text-white border-green-600",
        subtle:
          "bg-green-500/10 text-green-500 border-green-400/30 dark:text-green-300 dark:border-green-500/40",
        outline: "bg-transparent text-green-500 border-green-500",
      },
      icon: CheckCircle2,
      label: "Approved",
      description: "Request has been approved",
    },
    PENDING: {
      colors: {
        solid: "bg-amber-500 text-white border-amber-500",
        subtle:
          "bg-amber-500/10 text-amber-500 border-amber-400/30 dark:text-amber-300 dark:border-amber-500/40",
        outline: "bg-transparent text-amber-500 border-amber-500",
      },
      icon: Clock,
      label: "Pending",
      description: "Awaiting approval",
    },
    REJECTED: {
      colors: {
        solid: "bg-red-600 text-white border-red-600",
        subtle:
          "bg-red-500/10 text-red-500 border-red-400/30 dark:text-red-300 dark:border-red-500/40",
        outline: "bg-transparent text-red-500 border-red-500",
      },
      icon: XCircle,
      label: "Rejected",
      description: "Request has been rejected",
    },
    CANCELLED: {
      colors: {
        solid: "bg-gray-500 text-white border-gray-500",
        subtle:
          "bg-gray-500/10 text-[var(--text-muted)] border-[var(--border-color)]",
        outline:
          "bg-transparent text-[var(--text-muted)] border-[var(--border-color)]",
      },
      icon: Ban,
      label: "Cancelled",
      description: "Request has been cancelled",
    },
    DRAFT: {
      colors: {
        solid: "bg-slate-600 text-white border-slate-600",
        subtle:
          "bg-slate-500/10 text-slate-500 border-slate-400/30 dark:text-slate-300 dark:border-slate-500/40",
        outline: "bg-transparent text-slate-500 border-slate-500",
      },
      icon: Pause,
      label: "Draft",
      description: "Request is in draft mode",
    },
    REVIEW: {
      colors: {
        solid: "bg-blue-600 text-white border-blue-600",
        subtle:
          "bg-blue-500/10 text-blue-500 border-blue-400/30 dark:text-blue-300 dark:border-blue-500/40",
        outline: "bg-transparent text-blue-500 border-blue-500",
      },
      icon: RotateCcw,
      label: "In Review",
      description: "Request is under review",
    },
    EXPIRED: {
      colors: {
        solid: "bg-orange-600 text-white border-orange-600",
        subtle:
          "bg-orange-500/10 text-orange-500 border-orange-400/30 dark:text-orange-300 dark:border-orange-500/40",
        outline: "bg-transparent text-orange-500 border-orange-500",
      },
      icon: AlertCircle,
      label: "Expired",
      description: "Request has expired",
    },
  };

  const sizeConfig = {
    sm: {
      badge: "px-2 py-0.5 text-xs",
      icon: "w-3 h-3",
      gap: "gap-1",
    },
    md: {
      badge: "px-3 py-1 text-xs",
      icon: "w-4 h-4",
      gap: "gap-1.5",
    },
    lg: {
      badge: "px-4 py-2 text-sm",
      icon: "w-4 h-4",
      gap: "gap-2",
    },
  };

  const config =
    statusConfig[normalizedStatus as keyof typeof statusConfig] ||
    statusConfig.PENDING;
  const Icon = config.icon;
  const colors = config.colors[variant];
  const sizes = sizeConfig[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colors} ${sizes.badge} ${
        showIcon ? sizes.gap : ""
      } transition-all duration-200 ${className}`}
      title={config.description}
    >
      {showIcon && <Icon className={sizes.icon} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
}

/* ────────────────────────────── */
/* Animated + Detailed Variants */
/* ────────────────────────────── */

export function AnimatedLeaveStatusBadge(props: LeaveStatusBadgeProps) {
  return (
    <div className="relative inline-block">
      <LeaveStatusBadge {...props} />
      {props.status.toUpperCase() === "PENDING" && (
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      )}
    </div>
  );
}

export function DetailedLeaveStatusBadge({
  status,
  timestamp,
  approver,
  ...props
}: LeaveStatusBadgeProps & {
  timestamp?: string;
  approver?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <LeaveStatusBadge status={status} {...props} />
      </div>

      {showTooltip && (timestamp || approver) && (
        <div className="absolute z-10 px-3 py-2 text-xs font-medium text-[var(--foreground)] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-lg -top-2 transform -translate-y-full left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="space-y-1">
            {timestamp && <div>Updated: {timestamp}</div>}
            {approver && <div>By: {approver}</div>}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--border-color)]"></div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────── */
/* Compact Status Dot */
/* ────────────────────────────── */

export function CompactStatusIndicator({
  status,
  className = "",
}: {
  status: LeaveStatus | string;
  className?: string;
}) {
  const normalizedStatus = status.toUpperCase();

  const colorMap = {
    APPROVED: "bg-green-500",
    PENDING: "bg-amber-500",
    REJECTED: "bg-red-500",
    CANCELLED: "bg-[var(--border-color)]",
    DRAFT: "bg-slate-500",
    REVIEW: "bg-blue-500",
    EXPIRED: "bg-orange-500",
  };

  const color =
    colorMap[normalizedStatus as keyof typeof colorMap] || colorMap.PENDING;

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${color} ${className}`}
      title={status}
      aria-label={`Status: ${status}`}
    />
  );
}

/* ────────────────────────────── */
/* Example Preview (Optional) */
/* ────────────────────────────── */

export function LeaveStatusBadgeExamples() {
  const statuses: LeaveStatus[] = [
    "APPROVED",
    "PENDING",
    "REJECTED",
    "CANCELLED",
    "DRAFT",
    "REVIEW",
    "EXPIRED",
  ];

  return (
    <div className="p-6 bg-[var(--background)] text-[var(--text-primary)] rounded-lg space-y-6 border border-[var(--border-color)]">
      <div>
        <h3 className="text-lg font-semibold mb-3">Standard Badges</h3>
        <div className="flex flex-wrap gap-3">
          {statuses.map((s) => (
            <LeaveStatusBadge key={s} status={s} variant="subtle" />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Animated Badge</h3>
        <AnimatedLeaveStatusBadge status="PENDING" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Compact Indicators</h3>
        <div className="flex items-center gap-3">
          {statuses.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <CompactStatusIndicator status={s} />
              <span className="text-sm text-[var(--text-muted)]">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
