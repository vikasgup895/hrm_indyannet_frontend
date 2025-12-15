/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { Wallet, FileText, Calendar, Download } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import PayrollCard from "./components/PayrollCard";

import { useTheme } from "@/context/ThemeProvider"; // ✅ added
import { downloadPayslipPDF } from "@/lib/payslip-pdf";

export default function PayrollEmployeePage() {
  const { token } = useAuth();
  const { theme } = useTheme(); // ✅ added
  const payslipRef = useRef<HTMLDivElement | null>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧾 Fetch ALL payslips for current user
  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const res = await api.get("/payroll/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayslips(res.data || []);
      } catch (err) {
        console.error("Failed to fetch payslips:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPayslips();
  }, [token]);

  // 🧮 Summary
  const latestPayslip = payslips && payslips.length > 0 ? payslips[0] : null;
  const summary = latestPayslip
    ? {
        // Show the period's month (from periodEnd), not the pay date month
        currentMonth: latestPayslip.payrollRun?.periodEnd
          ? new Date(latestPayslip.payrollRun.periodEnd).toLocaleString(
              "default",
              {
                month: "long",
                year: "numeric",
              }
            )
          : "—",
        // Last Payment:
        // - Prefer payrollRun.payDate when run is APPROVED/PAID (scheduled/actual pay date)
        // - Fallback to payslip.createdAt as the generation date
        lastProcessed: (() => {
          const runStatus = latestPayslip.payrollRun?.status as
            | string
            | undefined;
          const payDateStr = latestPayslip.payrollRun?.payDate as
            | string
            | undefined;
          const createdAtStr = latestPayslip.createdAt as string | undefined;
          const payDate = payDateStr ? new Date(payDateStr) : null;
          const createdAt = createdAtStr ? new Date(createdAtStr) : null;
          if (runStatus === "APPROVED" || runStatus === "PAID") {
            return payDate
              ? payDate.toLocaleDateString()
              : createdAt
              ? createdAt.toLocaleDateString()
              : "—";
          }
          return createdAt ? createdAt.toLocaleDateString() : "—";
        })(),
        gross: latestPayslip.gross,
        net: latestPayslip.net,
        currency: latestPayslip.currency || "INR",
      }
    : {
        currentMonth: "—",
        lastProcessed: "—",
        gross: "—",
        net: "—",
        currency: "—",
      };

  // 🧾 Generate PDF Payslip
  const handleDownload = (p: any) => {
    if (!p) return alert("No payslip data found.");
    // Pass detailed data object to match full design
    downloadPayslipPDF(null, {
      // Prefer personNo (starts with EMP) for display and filename
      personNo: p.employee?.personNo,
      employee: p.employee || {},
      employeeId: p.employeeId,
      email: p.employee?.workEmail || p.employee?.personalEmail || "—",
      // Format: "1 Jan to 31 Jan"
      payPeriod: (() => {
        const s = p.payrollRun?.periodStart
          ? new Date(p.payrollRun.periodStart)
          : null;
        const e = p.payrollRun?.periodEnd
          ? new Date(p.payrollRun.periodEnd)
          : null;
        if (!s || !e) return "—";
        const fmt = (d: Date) =>
          `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
        return `${fmt(s)} to ${fmt(e)}`;
      })(),
      // Use payroll run pay date when available, otherwise generation date
      payDate: p.payrollRun?.payDate || new Date().toISOString(),
      // PF & UAN intentionally omitted in PDF
      earnings: {
        Basic: p.basic || 0,
        HRA: p.hra || 0,
        "Special Allowance": p.conveyance || 0,
        Bonus: p.bonus || 0,
        Other: p.otherEarnings || 0,
      },
      deductions: {
        "Leave Deduction": p.leaveDeduction || 0,
        "Professional Tax": p.professionalTax || 0,
        Other: p.otherDeductions || 0,
      },
      gross: p.gross,
      totalDeductions:
        (p.leaveDeduction || 0) +
        (p.professionalTax || 0) +
        (p.otherDeductions || 0),
      net: p.net,
      netWords: p.net ? `${p.net} Rupees Only` : "",
    });
  };

  return (
    <main className="p-1 space-y-6 min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
        <Wallet className="text-blue-500" /> My Payroll
      </h1>

      {/* Summary Cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PayrollCard
          icon={<Calendar className="text-blue-500" size={20} />}
          title="Current Month"
          value={summary.currentMonth}
        />
        <PayrollCard
          icon={<FileText className="text-green-500" size={20} />}
          title="Last Payment"
          value={summary.lastProcessed}
        />
        <PayrollCard
          icon={<Wallet className="text-purple-500" size={20} />}
          title="Last Net Pay"
          value={
            summary.net !== "—"
              ? `${
                  summary.currency === "USD"
                    ? "$"
                    : summary.currency === "EUR"
                    ? "€"
                    : "₹"
                } ${summary.net}`
              : "—"
          }
        />
      </section>

      {/* Payslips Table */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
          <FileText className="text-blue-400" /> Payslips
        </h2>

        {loading ? (
          <p className="text-[var(--text-muted)]">Loading your payslips...</p>
        ) : !payslips || payslips.length === 0 ? (
          <div className="text-center py-10 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-2xl">
            <p className="text-[var(--text-muted)] mb-2 text-lg">
              No payslips found
            </p>
            <p className="text-gray-500 text-sm">
              Your payslips will appear here once the payroll is processed.
            </p>
          </div>
        ) : (
          <div
            ref={payslipRef}
            className="overflow-x-auto border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] transition-colors"
          >
            <table className="min-w-full text-sm text-[var(--text-primary)]">
              <thead>
                <tr className="bg-[var(--hover-bg)] text-[var(--text-muted)] text-left">
                  <th className="p-3">Period</th>
                  <th className="p-3">Gross</th>
                  <th className="p-3">Deductions</th>
                  <th className="p-3">Net</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    <td className="p-3">
                      {(() => {
                        const s = p.payrollRun?.periodStart
                          ? new Date(p.payrollRun.periodStart)
                          : null;
                        const e = p.payrollRun?.periodEnd
                          ? new Date(p.payrollRun.periodEnd)
                          : null;
                        if (!s || !e) return "—";
                        const fmt = (d: Date) =>
                          `${d.getDate()} ${d.toLocaleString("default", {
                            month: "short",
                          })}`;
                        return `${fmt(s)} to ${fmt(e)}`;
                      })()}
                    </td>
                    <td className="p-3">{p.gross}</td>
                    <td className="p-3 text-amber-500">{p.deductions || 0}</td>
                    <td className="p-3 text-green-500">{p.net}</td>
                    <td className="p-3 ">
                      <div className="w-full flex justify-center">
                        <button
                          onClick={() => handleDownload(p)}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs transition"
                        >
                          <Download size={14} /> Download PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
