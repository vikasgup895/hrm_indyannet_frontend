/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Wallet, FileText, Calendar, Download } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import PayrollCard from "./components/PayrollCard";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTheme } from "@/context/ThemeProvider"; // ✅ added

export default function PayrollEmployeePage() {
  const { token } = useAuth();
  const { theme } = useTheme(); // ✅ use global theme
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
  const handleDownload = () => {
    if (!payslip) return alert("❌ No payslip data found.");

    const doc = new jsPDF();
    const margin = 15;
    const currency = payslip.currency || "INR";
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Salary Payslip", 105, margin, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text("HRM System Pvt. Ltd.", 105, margin + 8, { align: "center" });
    doc.text("www.company.com | payroll@company.com", 105, margin + 14, {
      align: "center",
    });

    // Divider
    doc.setDrawColor(180);
    doc.line(15, margin + 18, 195, margin + 18);

    // Employee Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text("Employee Details", margin, margin + 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(
      `Name: ${payslip.employee.firstName} ${payslip.employee.lastName}`,
      margin,
      margin + 36
    );
    doc.text(`Employee ID: ${payslip.employee.id}`, margin, margin + 42);
    doc.text(`Department: ${payslip.employee.department}`, margin, margin + 48);
    doc.text(
      `Month: ${new Date(payslip.payrollRun.periodStart).toLocaleString(
        "default",
        { month: "long", year: "numeric" }
      )}`,
      margin,
      margin + 54
    );

    const gross = payslip.gross.toFixed(2);
    const deductions = payslip.deductions?.toFixed(2) || "0.00";
    const net = payslip.net.toFixed(2);

    const tableData = [
      ["Basic Salary", `${symbol} ${gross}`],
      [
        "Provident Fund (12%)",
        `- ${symbol} ${(payslip.gross * 0.12).toFixed(2)}`,
      ],
      ["Tax (10%)", `- ${symbol} ${(payslip.gross * 0.1).toFixed(2)}`],
      ["ESI (0.75%)", `- ${symbol} ${(payslip.gross * 0.0075).toFixed(2)}`],
      ["Total Deductions", `- ${symbol} ${deductions}`],
      ["Net Pay", `${symbol} ${net}`],
    ];

    autoTable(doc, {
      startY: margin + 64,
      head: [["Description", "Amount"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 4 },
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 60, halign: "right" },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || margin + 100;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      "This is a computer-generated payslip and does not require signature.",
      105,
      finalY + 10,
      { align: "center" }
    );

    const filename = `Payslip_${payslip.employee.firstName}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    doc.save(filename);
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
          <div className="overflow-x-auto border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] transition-colors">
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
