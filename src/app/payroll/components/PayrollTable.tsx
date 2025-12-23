/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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
const StatusBadge = ({
  status,
  runStatus,
}: {
  status?: string;
  runStatus?: string;
}) => {
  const isPaid =
    status === "APPROVED" || status === "Paid" || runStatus === "PAID";
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

  /* 🔥 Log the full payroll dataset once */
  useEffect(() => {
    // console.log("📌 PayrollTable Loaded — Payroll Data:", data);
  }, [data]);

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
      <div className="bg-(--card-bg) border border-(--border-color) rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
        {/* HEADER */}
        <div className="px-6 py-4 bg-(--background) border-b border-(--border-color) transition-all">
          <h3 className="text-lg font-semibold text-(--text-primary)">
            Payroll Management
          </h3>
          <p className="text-sm text-(--text-muted) mt-1">
            {data.length} employee{data.length !== 1 ? "s" : ""} •{" "}
            {data.filter((r) => r?.status === "APPROVED").length} processed this
            month
          </p>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>{/* Columns */}</thead>

            <tbody className="divide-y divide-(--border-color)">
              {data.length > 0 ? (
                data.map((row) => {
                  /* 🔍 Log each row when it renders */

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-(--border-color)/20 transition-colors duration-150"
                    >
                      {/* Employee */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {row.employee?.firstName?.[0]?.toUpperCase() ||
                                "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-(--text-primary)">
                              {row.employee.firstName} {row.employee.lastName}
                            </p>
                            <p className="text-xs text-(--text-muted)">
                              ID: {row.employee?.personNo || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4 text-(--text-primary)">
                        {row.employee.department}
                      </td>

                      {/* Salary */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-(--text-primary)">
                          {formatSalary(row.net)}
                        </span>
                      </td>

                      {/* Period */}
                      <td className="px-6 py-4 text-(--text-primary)">
                        {row.payrollRun?.periodEnd
                          ? new Date(row.payrollRun.periodEnd).toLocaleString(
                              "default",
                              {
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={row.status}
                          runStatus={row.payrollRun?.status}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <ActionButton
                            onClick={() => {
                              // if (process.env.NODE_ENV === "development")
                              //     console.log("📄 Opening Payslip Modal:", row);
                              setSelected(row);
                            }}
                            variant={
                              row.payrollRun?.status === "DRAFT"
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p>No payroll data available.</p>
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
