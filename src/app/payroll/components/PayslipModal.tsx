/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  X,
  Printer,
  FileText,
  User,
  Building,
  Calendar,
  CreditCard,
  Calculator,
  Eye,
  DollarSign,
} from "lucide-react";
import { useState } from "react";

export default function PayslipModal({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "detailed">(
    "overview"
  );

  // 🔹 Safe number formatter
  const safeNumber = (value: any): number => {
    if (value == null) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ""));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatCurrency = (value: any) =>
    `₹${safeNumber(value).toLocaleString("en-IN")}`;

  // 🔹 Print/Download handler
  const handleDownload = () => {
    setDownloading(true);
    try {
      const gross = safeNumber(data.gross);
      const deductions = safeNumber(data.deductions);
      const net = safeNumber(data.net);

      const payslipHtml = `
      <div style="font-family:Arial;padding:40px;max-width:800px;margin:auto;background:#fff;">
        <h1 style="color:#2563eb;text-align:center;">PAYSLIP</h1>
        <hr style="margin:20px 0;">
        <h3>Employee: ${data.name ?? "Employee"}</h3>
        <p>ID: ${data.employeeId || data.id}</p>
        <p>Department: ${data.dept || "-"}</p>
        <p>Period: ${data.month || "N/A"}</p>
        <p>Status: ${data.status || "Pending"}</p>
        <hr>
        <h3>Earnings</h3>
        <p>Basic Salary: ₹${gross.toLocaleString("en-IN")}</p>
        <p>HRA (15%): ₹${(gross * 0.15).toLocaleString("en-IN")}</p>
        <p>Transport: ₹1,600</p>
        <h3>Deductions</h3>
        <p>PF (12%): ₹${(gross * 0.12).toLocaleString("en-IN")}</p>
        <p>Income Tax (8%): ₹${(gross * 0.08).toLocaleString("en-IN")}</p>
        <hr>
        <h2>Net Salary: ₹${net.toLocaleString("en-IN")}</h2>
        <p style="font-size:12px;color:gray;text-align:center;margin-top:30px;">
          Generated on ${new Date().toLocaleDateString()}
        </p>
      </div>`;

      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`<html><body>${payslipHtml}</body></html>`);
        win.document.close();
        win.print();
      }
    } catch (err) {
      console.error("Print error:", err);
    } finally {
      setDownloading(false);
    }
  };

  const gross = safeNumber(data.gross);
  const deductions = safeNumber(data.deductions);
  const net = safeNumber(data.net);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--background)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Payslip Details
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {data.month || "—"} • {data.name || "Employee"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]/40 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Eye className="inline-block w-4 h-4 mr-1" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("detailed")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "detailed"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Calculator className="inline-block w-4 h-4 mr-1" /> Detailed
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] text-[var(--text-primary)]">
          {activeTab === "overview" ? (
            <>
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  {
                    icon: User,
                    color: "text-blue-400",
                    label: "Employee",
                    value: data.name,
                    sub: `ID: ${data.employeeId || data.id}`,
                  },
                  {
                    icon: Building,
                    color: "text-green-400",
                    label: "Department",
                    value: data.dept || "—",
                    sub: "Department",
                  },
                  {
                    icon: Calendar,
                    color: "text-purple-400",
                    label: "Period",
                    value: data.month || "N/A",
                    sub: "Month",
                  },
                  {
                    icon: CreditCard,
                    color: "text-yellow-400",
                    label: "Status",
                    value: (
                      <span
                        className={`inline-block font-semibold px-3 py-1 rounded-full text-sm ${
                          data.status === "Paid"
                            ? "bg-green-500/10 text-green-500 border border-green-400/30"
                            : "bg-yellow-500/10 text-yellow-500 border border-yellow-400/30"
                        }`}
                      >
                        {data.status || "Pending"}
                      </span>
                    ),
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-[var(--background)] border border-[var(--border-color)] p-4 rounded-xl"
                  >
                    <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
                    <p className="font-semibold text-[var(--text-primary)]">
                      {item.value}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {item.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Salary Summary */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold">Net Salary</h3>
                </div>
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  {formatCurrency(net || gross - deductions)}
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  After all deductions and taxes
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--background)]">
                  <div className="bg-green-600 px-4 py-3 text-white font-bold">
                    Earnings
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span>Basic Salary</span>
                      <span>{formatCurrency(gross)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HRA (15%)</span>
                      <span>{formatCurrency(gross * 0.15)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport</span>
                      <span>₹1,600</span>
                    </div>
                    <div className="border-t border-[var(--border-color)] pt-3 flex justify-between font-bold text-green-500">
                      <span>Gross Total</span>
                      <span>{formatCurrency(gross * 1.15 + 1600)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--background)]">
                  <div className="bg-red-600 px-4 py-3 text-white font-bold">
                    Deductions
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span>PF (12%)</span>
                      <span>{formatCurrency(gross * 0.12)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Income Tax (8%)</span>
                      <span>{formatCurrency(gross * 0.08)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ESI</span>
                      <span>{formatCurrency(gross * 0.0075)}</span>
                    </div>
                    <div className="border-t border-[var(--border-color)] pt-3 flex justify-between font-bold text-red-500">
                      <span>Total Deductions</span>
                      <span>
                        {formatCurrency(deductions || gross * 0.2075)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[var(--border-color)] bg-[var(--background)]">
          <div className="text-sm text-[var(--text-muted)]">
            Generated on {new Date().toLocaleDateString()}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
                downloading
                  ? "bg-blue-800 text-blue-200"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <Printer className="w-4 h-4" /> Print Payslip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
