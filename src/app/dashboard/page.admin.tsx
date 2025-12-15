/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building,
  Wallet,
  CalendarCheck,
  ClipboardList,
  Briefcase,
  UserPlus,
  AlertTriangle,
  TrendingUp,
  Activity,
  Gift,
} from "lucide-react";
import { useDashboardData } from "./hooks/useDashboard";

export default function DashboardAdmin() {
  const { dashboard, isLoading, error } = useDashboardData();

  useEffect(() => {
    if (error) console.error("Failed to load dashboard data:", error);
  }, [error]);

  if (isLoading)
    return (
      <div className="p-6 text-[var(--text-muted)] text-center bg-[var(--background)] min-h-screen transition-colors duration-300">
        Loading admin dashboard...
      </div>
    );

  const stats = dashboard?.stats || {};
  const deptCounts = dashboard?.departmentCounts || [];
  const upcomingBirthdays = dashboard?.upcomingBirthdays || [];
  const newJoiners = dashboard?.newJoiners || [];
  const workAnniversaries = dashboard?.workAnniversaries || [];
  const holidays = dashboard?.upcomingHolidays || [];
  const leaveAvailability = dashboard?.leaveAvailability || {};

  return (
    <div className="min-h-screen p-6 bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-300">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Admin Dashboard
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Overview of workforce, payroll, and HR activity
        </p>
      </header>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link href="/employees">
          <StatCard
            icon={<Users className="text-blue-500" size={22} />}
            title="Active Employees"
            value={stats.totalEmployees || 0}
            isClickable
          />
        </Link>

        <Link href="/leave">
          <StatCard
            icon={<ClipboardList className="text-yellow-500" size={22} />}
            title="Pending Leave Requests"
            value={stats.activeLeaveRequests || 0}
            isClickable
          />
        </Link>

        <Link href="/payroll">
          <StatCard
            icon={<Wallet className="text-green-500" size={22} />}
            title="Pending Payroll Runs"
            value={stats.pendingPayrolls || 0}
            isClickable
          />
        </Link>

        <StatCard
          icon={<Building className="text-purple-500" size={22} />}
          title="Departments"
          value={deptCounts.length}
        />
      </section>

      {/* Main Grid */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Department Overview */}
        <DashboardCard title="Department Headcount" icon={Briefcase}>
          <div className="space-y-2 text-sm">
            {deptCounts.map((dept: any, i: number) => (
              <div
                key={i}
                className="flex justify-between border-b border-[var(--border-color)] pb-1"
              >
                <span className="text-[var(--text-muted)]">
                  {dept.department}
                </span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {dept.count}
                </span>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Upcoming Birthdays */}
        <DashboardCard title="Upcoming Birthdays" icon={Gift}>
          {upcomingBirthdays.length > 0 ? (
            <div className="space-y-3 text-sm">
              {upcomingBirthdays.map((b: any) => (
                <div key={b.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {b.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {b.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{b.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">
              No upcoming birthdays
            </p>
          )}
        </DashboardCard>

        {/* Work Anniversaries */}
        <DashboardCard title="Work Anniversaries" icon={TrendingUp}>
          {workAnniversaries.length > 0 ? (
            <div className="space-y-3 text-sm">
              {workAnniversaries.map((a: any) => (
                <div key={a.id}>
                  <p className="font-medium text-[var(--text-primary)]">
                    {a.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {a.years} years • {a.date}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">
              No anniversaries this month
            </p>
          )}
        </DashboardCard>

        {/* New Joiners */}
        <DashboardCard title="New Joiners" icon={UserPlus}>
          {newJoiners.length > 0 ? (
            <div className="space-y-3 text-sm">
              {newJoiners.map((emp: any) => (
                <div key={emp.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {emp.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {emp.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {emp.role} • {emp.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">
              No new hires recently
            </p>
          )}
        </DashboardCard>

        {/* Upcoming Holidays */}
        <DashboardCard title="Upcoming Holidays" icon={CalendarCheck}>
          {holidays.length > 0 ? (
            <div className="space-y-3 text-sm">
              {holidays.map((h: any) => (
                <div key={h.id}>
                  <p className="font-medium text-[var(--text-primary)]">
                    {h.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{h.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">
              No upcoming holidays
            </p>
          )}
        </DashboardCard>

        {/* Leave Utilization */}
        <DashboardCard title="Leave Utilization Overview" icon={ClipboardList}>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Approved:</span>
              <span className="text-green-500">
                {leaveAvailability.approved ?? 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Available:</span>
              <span className="text-blue-500">
                {leaveAvailability.available ?? 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Pending:</span>
              <span className="text-yellow-500">
                {leaveAvailability.pending ?? 0}%
              </span>
            </div>
          </div>
        </DashboardCard>

        {/* System Alerts */}
        <DashboardCard title="System Alerts" icon={AlertTriangle}>
          <ul className="text-sm space-y-2 text-red-500">
            <li>⚠️ Check pending payrolls before month-end</li>
            <li>⚠️ Review overdue leave requests</li>
          </ul>
        </DashboardCard>
      </section>

      {/* Activity Feed */}
      <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl mt-8 p-6 transition-colors">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
          <Activity className="text-blue-500" /> Recent HR System Activity
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Payroll, leaves, and employee events will be logged here soon.
        </p>
      </section>
    </div>
  );
}

/* ────────────────────────────── */
/* Reusable Components */
/* ────────────────────────────── */

function StatCard({
  icon,
  title,
  value,
  isClickable,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  isClickable?: boolean;
}) {
  return (
    <div
      className={`bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm p-5 h-32 flex items-center ${
        isClickable
          ? "hover:bg-[var(--hover-bg)] cursor-pointer"
          : "hover:bg-[var(--hover-bg)]"
      } transition-all duration-200`}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="p-3 bg-[var(--background)] rounded-xl flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-[var(--text-muted)] text-sm">{title}</p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-[var(--text-muted)]" />
        <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
      </div>
      <div className="min-h-[100px]">{children}</div>
    </div>
  );
}
