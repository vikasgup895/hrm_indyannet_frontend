/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Eye,
  CreditCard,
  User,
  Building,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import PayslipModal from "./PayslipModal";

/* STATUS BADGE */
const StatusBadge = ({ status }: { status?: string }) => {
  const isPaid = status === "APPROVED" || status === "Paid";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        isPaid
          ? "bg-green-500/10 text-green-500 border-green-500/40"
          : "bg-yellow-500/10 text-yellow-500 border-yellow-500/40"
      }`}
    >
      {isPaid ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      {isPaid ? "Paid" : "Pending"}
    </span>
  );
};

/* ACTION BUTTON */
const ActionButton = ({
  onClick,
  children,
  variant = "primary",
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) => {
  const base =
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none";
  const styles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md",
    secondary:
      "bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--border-color)]/30",
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
};

/* PAYROLL TABLE */
export default function PayrollTable({
  data,
  role,
}: {
  data: any[];
  role: string;
}) {
  const [selected, setSelected] = useState<any>(null);

  const formatSalary = (amount: string | number) => {
    const numAmount =
      typeof amount === "string"
        ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
        : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  return (
    <>
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
        {/* HEADER */}
        <div className="px-6 py-4 bg-[var(--background)] border-b border-[var(--border-color)] transition-all">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Payroll Management
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {data.length} employee{data.length !== 1 ? "s" : ""} •{" "}
            {
              data.filter((r) => r?.payrollRun?.status === "APPROVED")
                .length
            }{" "}
            processed this month
          </p>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--background)] border-b border-[var(--border-color)]">
                {[{ icon: User, label: "Employee" },
                  { icon: Building, label: "Department" },
                  { icon: DollarSign, label: "Salary" },
                  { icon: Calendar, label: "Period" },
                  { label: "Status" },
                  { label: "Actions", align: "center" }].map((col, i) => (
                  <th
                    key={i}
                    className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] ${
                      col.align === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {col.icon && <col.icon className="w-4 h-4" />}
                      {col.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-color)]">
              {data.length > 0 ? (
                data.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[var(--border-color)]/20 transition-colors duration-150"
                  >
                    {/* Employee */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">
                            {row.employee?.firstName?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">
                            {row.employee.firstName} {row.employee.lastName}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            ID: {row.employeeId || row.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4 text-[var(--text-primary)]">
                      {row.employee.department}
                    </td>

                    {/* Salary */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {formatSalary(row.gross)}
                      </span>
                    </td>

                    {/* Period */}
                    <td className="px-6 py-4 text-[var(--text-primary)]">
  {row.payrollRun?.periodEnd
    ? new Date(row.payrollRun.periodEnd).toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
    : "—"}
</td>



                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={row.payrollRun?.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {role === "ADMIN" ? (
                          <>
                            <ActionButton
                              onClick={() => setSelected(row)}
                              variant={
                                row.payrollRun?.status === "PENDING"
                                  ? "primary"
                                  : "secondary"
                              }
                            >
                              {row.payrollRun?.status === "PENDING" ? (
                                <>
                                  <CreditCard className="w-3 h-3" />
                                  Process
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" />
                                  View
                                </>
                              )}
                            </ActionButton>

                            <ActionButton
                              onClick={() => setSelected(row)}
                              variant="secondary"
                            >
                              <FileText className="w-3 h-3" />
                              Payslip
                            </ActionButton>
                          </>
                        ) : (
                          <ActionButton
                            onClick={() => setSelected(row)}
                            variant="primary"
                          >
                            <FileText className="w-3 h-3" />
                            View Payslip
                          </ActionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-full flex items-center justify-center">
                        <DollarSign className="w-8 h-8 text-[var(--text-muted)]" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                          No payroll data found
                        </p>
                        <p className="text-[var(--text-muted)]">
                          Payroll information will appear here once processed.
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

      {selected && (
        <PayslipModal data={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
