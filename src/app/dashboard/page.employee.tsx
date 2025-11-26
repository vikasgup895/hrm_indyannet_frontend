/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  CalendarDays,
  Wallet,
  ClipboardList,
  Gift,
  UserPlus,
  Building,
  Plane,
  Calendar,
  Award,
  Target,
  Activity,
} from "lucide-react";
import { useEmployeeDashboard } from "./hooks/useEmployeeDashboard";
import { useTheme } from "@/context/ThemeProvider"; // ✅ added for global theme

export default function DashboardEmployee() {
  const { employeeDashboard, isLoading, error } = useEmployeeDashboard();
  const { theme } = useTheme(); // ✅ now theme-aware

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text-muted)]">
        Loading your dashboard...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-red-500">
        Failed to load employee dashboard.
      </div>
    );

  const data = employeeDashboard || {};
  const leave = data.leaveAvailability || { used: 0, available: 0, pending: 0 };
  const holidays = data.upcomingHolidays || [];
  const birthdays = data.upcomingBirthdays || [];
  const anniversaries = data.workAnniversaries || [];
  const teamMembers = data.teamMembers || [];
  const departmentStats = data.departmentCounts || [];
  const recentActivity = data.recentActivity || [];

  return (
    <div className="min-h-screen p-6 bg-[var(--background)] text-[var(--foreground)] space-y-6 transition-colors duration-300">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Welcome back 👋
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          Here’s your personalized overview for this month.
        </p>
      </header>

      {/* Quick Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CalendarDays size={24} className="text-green-500" />}
          title="Leave Balance"
          value={`${leave.available || 0} Days`}
        />
        <StatCard
          icon={<Wallet size={24} className="text-blue-500" />}
          title="Last Salary Credited"
          value={
            data.lastSalaryDate
              ? new Date(data.lastSalaryDate).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true
                })
              : "—"
          }
        />
        <StatCard
          icon={<ClipboardList size={24} className="text-purple-500" />}
          title="Pending Requests"
          value={leave.pending || 0}
        />
        <StatCard
          icon={<Target size={24} className="text-amber-500" />}
          title="Performance"
          value="On Track"
        />
      </section>

      {/* Dashboard Grid */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Birthdays */}
        <DashboardCard title="Upcoming Birthdays" icon={Gift}>
          {birthdays.length ? (
            <div className="space-y-3">
              {birthdays.map((b: any) => (
                <div key={b.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {b.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
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

        {/* My Team */}
        <DashboardCard title="My Team" icon={UserPlus}>
          {teamMembers.length ? (
            <div className="space-y-3">
              {teamMembers.map((person: any) => (
                <div key={person.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {person.avatar || person.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {person.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {person.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">
              No team members found
            </p>
          )}
        </DashboardCard>

        {/* Department Overview */}
        <DashboardCard title="Department Overview" icon={Building}>
          {departmentStats.length ? (
            <div className="space-y-2">
              {departmentStats.map((dept: any) => (
                <div
                  key={dept.department}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-[var(--text-muted)]">
                    {dept.department}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {dept.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">
              No department data
            </p>
          )}
        </DashboardCard>

        {/* Holidays */}
        <DashboardCard title="Upcoming Holidays" icon={Plane}>
          {holidays.length ? (
            <div className="space-y-2">
              {holidays.map((h: any) => (
                <div key={h.id}>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
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

        {/* Leave Status */}
        <DashboardCard title="My Leave Status" icon={Calendar}>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Available:</span>
              <span className="text-green-500">{leave.available} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Used:</span>
              <span className="text-amber-500">{leave.used} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Pending:</span>
              <span className="text-yellow-500">{leave.pending} days</span>
            </div>
          </div>
        </DashboardCard>

        {/* Anniversaries */}
        <DashboardCard title="Work Anniversaries" icon={Award}>
          {anniversaries.length ? (
            <div className="space-y-3">
              {anniversaries.map((a: any) => (
                <div key={a.id}>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {a.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {a.years} years • {a.date}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">No anniversaries</p>
          )}
        </DashboardCard>

        {/* Activity */}
        <DashboardCard title="Recent Activity" icon={Activity}>
          {recentActivity.length ? (
            <div className="space-y-3">
              {recentActivity.map((item: string, index: number) => (
                <div
                  key={index}
                  className="p-2 bg-[var(--hover-bg)] rounded-lg text-sm text-[var(--text-primary)]"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">
              No recent activity
            </p>
          )}
        </DashboardCard>
      </section>
    </div>
  );
}

/* ───────────────────────────── */
/* Reusable Components */
/* ───────────────────────────── */

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
}) {
  return (
    <div className="border border-[var(--border-color)] bg-[var(--card-bg)] rounded-2xl shadow-sm p-5 hover:bg-[var(--hover-bg)] transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-[var(--hover-bg)] flex items-center justify-center">
          {icon}
        </div>
        <div>
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
    <div className="border border-[var(--border-color)] bg-[var(--card-bg)] rounded-2xl p-5 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-[var(--text-muted)]" />
        <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
      </div>
      <div className="min-h-[100px]">{children}</div>
    </div>
  );
}
