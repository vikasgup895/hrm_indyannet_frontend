/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import {
  X,
  FileText,
  User,
  Building,
  Calendar,
  CreditCard,
  DollarSign,
  Calculator,
  ArrowDownToLine,
} from "lucide-react";
import { downloadPayslipPDF } from "@/lib/payslip-pdf";

export default function PayslipModal({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "detailed">(
    "overview"
  );
  console.log(data)
  const slipRef = useRef<HTMLDivElement>(null);

  const safe = (n: any) => (isNaN(Number(n)) ? 0 : Number(n));
  const gross = safe(data.gross);
  const deductions = safe(data.deductions);
  const net = safe(data.net);
  // Debug: payslip data logging removed for production
  const month = new Date(data.payrollRun?.periodEnd).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(n);

  // 🧾 Download PDF (Full Layout)
  // 🧾 Download PDF (Full Layout)
  const handleDownloadPdf = () => {
    if (!data) return alert("No payslip data found.");

    downloadPayslipPDF(null, {
      personNo: data.employee?.personNo || "N/A",
      employeeId: data.employeeId,
      employee: data.employee || {},
      payrollRun: data.payrollRun || {},
      email: data.employee?.workEmail || data.employee?.personalEmail || "N/A",
      payPeriod: `${data.payrollRun?.periodStart?.slice(
        0,
        10
      )} - ${data.payrollRun?.periodEnd?.slice(0, 10)}`,
      payDate: data.payrollRun?.payDate,
      pfNumber: data.employee?.bankDetail?.pfNumber,
      uan: data.employee?.bankDetail?.uan,

      earnings: data.earnings || {
        Basic: data.basic || 0,
        HRA: data.hra || 0,
        "Conveyance Allowance": data.conveyance || 0,
        Medical: data.medical || 0,
        Bonus: data.bonus || 0,
        Other: data.otherEarnings || 0,
      },

      deductions: {
        "EPF Contribution": data.epf || 0,
        "Professional Tax": data.professionalTax || 0,
        Other: data.otherDeductions || 0,
      },

      gross: data.gross,
      totalDeductions:
        (data.epf || 0) +
        (data.professionalTax || 0) +
        (data.otherDeductions || 0),
      net: data.net,
      netWords: data.net ? `${data.net} Rupees Only` : "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--background)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Payslip</h2>
              <p className="text-sm text-[var(--text-muted)]">{month}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--border-color)]/40 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "overview"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-[var(--text-muted)]"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("detailed")}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === "detailed"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-[var(--text-muted)]"
            }`}
          >
            Detailed
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto text-[var(--text-primary)]">
          {activeTab === "overview" ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Box
                  icon={User}
                  label="Employee"
                  value={`${data.employee.firstName} ${data.employee.lastName}`}
                  sub={`ID: ${data.employee?.personNo}`}
                />
                <Box
                  icon={Building}
                  label="Department"
                  value={data.employee.department ?? "—"}
                />
                <Box icon={Calendar} label="Month" value={month} />
                <Box
                  icon={CreditCard}
                  label="Status"
                  value={data.status ?? "Paid"}
                />
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20 text-center">
                <div className="flex items-center gap-3 justify-center mb-3">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold">Net Salary</h3>
                </div>
                <div className="text-3xl font-bold text-blue-500">
                  {formatINR(net)}
                </div>
              </div>
            </>
          ) : (
            // Detailed Tab Content
            <div
              ref={slipRef}
              className="space-y-4 p-6 bg-white border border-gray-200 rounded-xl text-gray-800"
            >
              {/* Header Section */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-600 text-white font-bold text-lg rounded-lg flex items-center justify-center">
                    IN
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Indyanet HRM
                    </h2>
                    <p className="text-sm text-gray-600">
                      Bengaluru, Karnataka, India
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Payslip for the Month</p>
                  <p className="font-semibold text-gray-900">{month}</p>
                </div>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-b py-3">
                <div>
                  <p className="font-semibold text-gray-700">Employee Name</p>
                  <p>
                    {data.employee?.firstName} {data.employee?.lastName}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Employee ID</p>
                  <p>{data.employee?.personNo || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Department</p>
                  <p>{data.employee?.department || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Email</p>
                  <p>{data.employee?.workEmail || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Bank A/C</p>
                  <p>{data.employee?.bankDetail?.accountNumber || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">PF Number</p>
                  <p>{data.employee?.bankDetail?.pfNumber || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">UAN</p>
                  <p>{data.employee?.bankDetail?.uan || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Pay Period</p>
                  <p>
                    {data.payrollRun?.periodStart?.slice(0, 10)} -{" "}
                    {data.payrollRun?.periodEnd?.slice(0, 10)}
                  </p>
                </div>
              </div>

              {/* Earnings & Deductions */}
              <div className="grid grid-cols-2 gap-8 mt-4">
                {/* Earnings */}
                <div>
                  <h3 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> Earnings
                  </h3>
                  <div className="space-y-2 border border-gray-200 rounded-lg p-3">
                    {Object.entries(
                      data.earnings || {
                        Basic: data.basic || 0,
                        HRA: data.hra || 0,
                        "Conveyance Allowance": data.conveyance || 0,
                        Medical: data.medical || 0,
                        Bonus: data.bonus || 0,
                        Other: data.other || 0,
                      }
                    ).map(([key, val]) => (
                      <Row key={key} label={key} value={val as number} />
                    ))}
                    <Row label="Total Earnings" value={gross} />
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> Deductions
                  </h3>
                  <div className="space-y-2 border border-gray-200 rounded-lg p-3">
                    {Object.entries({
                      "EPF Contribution": data.epf || 0,
                      "Professional Tax": data.professionalTax || 0,
                      Other: data.otherDeduction || 0,
                    }).map(([key, val]) => (
                      <Row key={key} label={key} value={val as number} />
                    ))}
                    <Row label="Total Deductions" value={deductions} />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="border border-green-300 bg-green-50 rounded-xl mt-6 p-5 text-center">
                <p className="text-gray-700 text-sm">Net Pay</p>
                <p className="text-green-700 text-3xl font-bold">
                  {formatINR(net)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ( {data.net ? `${data.net} Rupees Only` : "—"} )
                </p>
              </div>

              <div className="text-xs text-gray-500 text-right mt-4">
                *This is a computer-generated payslip and does not require a
                signature.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[var(--border-color)] bg-[var(--background)]">
          <span className="text-sm text-[var(--text-muted)]">
            Generated on {new Date().toLocaleDateString()}
          </span>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <ArrowDownToLine className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function Box({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="bg-[var(--background)] border border-[var(--border-color)] p-4 rounded-xl">
      <Icon className="w-5 h-5 text-blue-500 mb-1" />
      <p className="font-semibold">{value}</p>
      {sub && <p className="text-sm text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-black border-b border-gray-300 pb-2">
      <span>{label}</span>
      <span>
        {new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(value)}
      </span>
    </div>
  );
}
