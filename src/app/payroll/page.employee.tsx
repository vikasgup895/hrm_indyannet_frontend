/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState,useRef } from "react";
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
  const [payslip, setPayslip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🧾 Fetch current month's payslip
  useEffect(() => {
    const fetchPayslip = async () => {
      try {
        const res = await api.get("/payroll/my-current", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayslip(res.data || null);
      } catch (err) {
        console.error("Failed to fetch current payslip:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPayslip();
  }, [token]);

  // 🧮 Summary
  const summary = payslip
    ? {
        currentMonth: new Date(
          payslip.payrollRun?.payDate || ""
        ).toLocaleString("default", { month: "long", year: "numeric" }),
        lastProcessed: payslip.payrollRun?.payDate
          ? new Date(payslip.payrollRun.payDate).toLocaleDateString()
          : "—",
        gross: payslip.gross,
        net: payslip.net,
        currency: payslip.currency || "INR",
      }
    : {
        currentMonth: "—",
        lastProcessed: "—",
        gross: "—",
        net: "—",
        currency: "—",
      };

  // 🧾 Generate PDF Payslip
  // 🧾 Generate PDF Payslip
  const handleDownload = () => {
    if (!payslip) return alert("No payslip data found.");
    // Pass detailed data object to match full design
    downloadPayslipPDF(null, {
      employee: payslip.employee || {},
      employeeId: payslip.employeeId,
      email: payslip.workEmail || "—",
      payPeriod: `${payslip.payrollRun?.periodStart?.slice(0, 10)} - ${payslip.payrollRun?.periodEnd?.slice(0, 10)}`,
      payDate: payslip.payrollRun?.payDate,
      pfNumber: payslip.employee?.bankDetail?.pfNumber,
      uan: payslip.employee?.bankDetail?.uan,
      earnings: payslip.earnings || {
        Basic: payslip.basic || 0,
        HRA: payslip.hra || 0,
        "Conveyance Allowance": payslip.conveyance || 0,
        Medical: payslip.medical || 0,
        Bonus: payslip.bonus || 0,
        Other: payslip.other || 0,
      },
      deductions: {
        "EPF Contribution": payslip.epf || 0,
        "Professional Tax": payslip.professionalTax || 0,
        Other: payslip.otherDeduction || 0,
      },
      gross: payslip.gross,
      totalDeductions:
        (payslip.epf || 0) +
        (payslip.professionalTax || 0) +
        (payslip.otherDeduction || 0),
      net: payslip.net,
      netWords: payslip.net ? `${payslip.net} Rupees Only` : "",
    });
  };
  
  


  return (
    <main className="p-6 space-y-6 min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
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
          title="Net Pay"
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

      {/* Payslip Table */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
          <FileText className="text-blue-400" /> Current Month Payslip
        </h2>

        {loading ? (
          <p className="text-[var(--text-muted)]">Loading your payslip...</p>
        ) : !payslip ? (
          <div className="text-center py-10 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-2xl">
            <p className="text-[var(--text-muted)] mb-2 text-lg">
              No payslip found for this month
            </p>
            <p className="text-gray-500 text-sm">
              Your payslip will appear here once the payroll is processed.
            </p>
          </div>
        ) : (
          <div ref={payslipRef} className="overflow-x-auto border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] transition-colors">
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
                <tr className="border-t border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors">
                  <td className="p-3">
                    {payslip.payrollRun?.periodStart?.slice(0, 10)} →{" "}
                    {payslip.payrollRun?.periodEnd?.slice(0, 10)}
                  </td>
                  <td className="p-3">{payslip.gross}</td>
                  <td className="p-3 text-amber-500">
                    {payslip.deductions || 0}
                  </td>
                  <td className="p-3 text-green-500">{payslip.net}</td>
                  <td className="p-3 ">
                  <div className="w-full flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs transition"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
