/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Download,
  User,
  Building,
  Calendar,
  DollarSign,
  Eye,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ────────────────────────────── */
/* Reusable Inputs (Theme Compatible) */
/* ────────────────────────────── */
const FormField = ({ label, children, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
      {Icon && <Icon className="w-4 h-4 text-[var(--text-muted)]" />}
      {label}
    </label>
    {children}
  </div>
);

const Input = ({ className = "", ...props }: any) => (
  <input
    className={`w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl 
      text-[var(--text-primary)] placeholder-[var(--text-muted)] 
      focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${className}`}
    {...props}
  />
);

/* ────────────────────────────── */
/* Main Component */
/* ────────────────────────────── */
export default function GeneratePayslipPage() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    department: "",
    designation: "",
    month: "",
    salary: "",
  });
  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);

  /* ─── Fetch Employees ─── */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    if (token) fetchEmployees();
  }, [token]);

  /* ─── Select Employee ─── */
  const handleSelectEmployee = (e: any) => {
    const empId = e.target.value;
    const emp = employees.find((emp) => emp.id === empId);
    if (emp) {
      setForm({
        ...form,
        employeeId: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department || "",
        designation: emp.position || "Employee",
      });
    }
  };

  /* ─── Generate Payslip ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.employeeId) {
        alert("Please select an employee first.");
        return;
      }

      if (!confirm(`Generate payslip for ${form.name}?`)) return;

      const gross = Number(form.salary);
      const pf = gross * 0.12;
      const tax = gross * 0.1;
      const esi = gross * 0.0075;
      const deductions = pf + tax + esi;
      const net = gross - deductions;

      const runRes = await api.get("/payroll/runs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const run = runRes.data?.[0];
      if (!run) {
        alert("❌ No active payroll run found. Please create one first.");
        return;
      }

      const res = await api.post(
        "/payroll/generate",
        {
          employeeId: form.employeeId,
          runId: run.id,
          gross,
          deductions,
          net,
          currency: "INR",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Payslip generated:", res.data);
      alert("✅ Payslip generated successfully!");
      setGenerated(true);
    } catch (err) {
      console.error("Error generating payslip:", err);
      alert("❌ Failed to generate payslip. Check console for details.");
    }
  };

  /* ─── Download PDF ─── */
  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const payslipEl = document.getElementById("payslip");
      if (!payslipEl) {
        alert("❌ Payslip not found in DOM.");
        setDownloading(false);
        return;
      }

      const canvas = await html2canvas(payslipEl as HTMLElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(
        pdfWidth / canvas.width,
        pdfHeight / canvas.height
      );
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const x = (pdfWidth - imgWidth) / 2;
      const y = 10;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      const filename = `${form.name.replace(/\s+/g, "_")}_Payslip.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("❌ Error while creating PDF:", error);
      alert("Error generating PDF. See console for details.");
    } finally {
      setDownloading(false);
    }
  };

  /* ─── Calculations ─── */
  const salary = Number(form.salary);
  const pf = salary * 0.12;
  const tax = salary * 0.1;
  const esi = salary * 0.0075;
  const totalDeductions = pf + tax + esi;
  const netPay = salary - totalDeductions;

  /* ─── UI ─── */
  return (
    <div className="min-h-screen p-6 bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/payroll"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Payroll
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">Generate Payslip</h1>
          </div>
        </div>

        {/* Form or Generated Payslip */}
        {!generated ? (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-lg p-6 transition-all duration-300">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Employee Selection */}
                <FormField label="Select Employee" icon={User}>
                  <select
                    value={form.employeeId}
                    onChange={handleSelectEmployee}
                    required
                    className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  >
                    <option value="">Select an Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.department})
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Department" icon={Building}>
                  <Input type="text" value={form.department} readOnly />
                </FormField>

                <FormField label="Designation" icon={User}>
                  <Input type="text" value={form.designation} readOnly />
                </FormField>

                <FormField label="Salary Month" icon={Calendar}>
                  <Input
                    type="month"
                    value={form.month}
                    onChange={(e: any) =>
                      setForm({ ...form, month: e.target.value })
                    }
                    required
                  />
                </FormField>

                <FormField label="Basic Salary (₹)" icon={DollarSign}>
                  <Input
                    type="number"
                    placeholder="Enter salary"
                    value={form.salary}
                    onChange={(e: any) =>
                      setForm({ ...form, salary: e.target.value })
                    }
                    required
                  />
                </FormField>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                >
                  <Eye className="w-5 h-5" />
                  Generate Payslip
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Generated Notice */}
            <div className="flex justify-between items-center bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl">
              <span>
                Payslip generated for <strong>{form.name}</strong>
              </span>
              <button
                onClick={downloadPDF}
                disabled={downloading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-70"
              >
                {downloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 inline animate-spin" />{" "}
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 inline" /> Download PDF
                  </>
                )}
              </button>
            </div>

            {/* Printable Payslip */}
            <div
              id="payslip"
              className="bg-white text-black p-8 rounded-lg mt-6 shadow-md"
            >
              <h2 className="text-center font-bold text-2xl mb-4">
                Salary Payslip
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <p>
                  <strong>Employee:</strong> {form.name}
                </p>
                <p>
                  <strong>Department:</strong> {form.department}
                </p>
                <p>
                  <strong>Designation:</strong> {form.designation}
                </p>
                <p>
                  <strong>Month:</strong> {form.month}
                </p>
              </div>

              <table className="w-full border text-sm mb-4">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2 text-left">Description</th>
                    <th className="border p-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">Basic Salary</td>
                    <td className="border p-2 text-right">
                      {salary.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2">Provident Fund (12%)</td>
                    <td className="border p-2 text-right">-{pf.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Tax (10%)</td>
                    <td className="border p-2 text-right">-{tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border p-2">ESI (0.75%)</td>
                    <td className="border p-2 text-right">-{esi.toFixed(2)}</td>
                  </tr>
                  <tr className="font-bold bg-gray-100">
                    <td className="border p-2">Net Pay</td>
                    <td className="border p-2 text-right text-green-600">
                      {netPay.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="text-center text-sm text-gray-600 mt-6">
                This is a system-generated payslip — no signature required.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
