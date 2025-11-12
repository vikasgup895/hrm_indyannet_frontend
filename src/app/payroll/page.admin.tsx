/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Wallet, FileText, Users, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import PayrollTable from "./components/PayrollTable";
import PayrollCard from "./components/PayrollCard";

export default function PayrollAdminPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    currentMonth: "—",
    lastProcessed: "—",
    totalPaid: 0,
  });

  useEffect(() => {
    if (!token) return;
    if (payrolls.length > 0) return; // prevent double StrictMode fetch

    const fetchData = async () => {
      if (process.env.NODE_ENV === "development")
        console.log("📡 Fetching /payroll/payslips");

      const res = await api.get("/payroll/payslips", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (process.env.NODE_ENV === "development")
        console.log("✅ API returned:", res.data);
      const data = res.data || [];
      setPayrolls(data);

      if (data.length > 0) {
        const latest = data[0];
        if (process.env.NODE_ENV === "development")
          console.log("🧾 latest payslip payload:", latest);

        const rawPeriodEnd = latest.payrollRun?.periodEnd;
        if (process.env.NODE_ENV === "development")
          console.log("📅 Raw periodEnd:", rawPeriodEnd);

        const parsed = new Date(rawPeriodEnd);
        if (process.env.NODE_ENV === "development")
          console.log("📅 parsed Date:", parsed);

        const nice = parsed.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        if (process.env.NODE_ENV === "development")
          console.log("✅ formatted payroll month:", nice);

        setSummary({
          currentMonth: nice,
          lastProcessed: nice,
          totalPaid: data.length,
        });
      }
    };

    fetchData();
  }, [token, payrolls.length]);

  const handleGeneratePayslip = () => router.push("/payroll/generate-payslip");

  return (
    <main className="p-6 space-y-6 min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="text-blue-500" /> Payroll Management
        </h1>
        <button
          onClick={handleGeneratePayslip}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
        >
          <FileText size={18} /> Generate Payslips
        </button>
      </div>

      {/* Summary Cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PayrollCard
          icon={<Calendar className="text-blue-500" size={20} />}
          title="Payroll Month"
          value={summary.currentMonth}
        />
        <PayrollCard
          icon={<FileText className="text-green-500" size={20} />}
          title="Last Processed"
          value={summary.lastProcessed}
        />
        <PayrollCard
          icon={<Users className="text-purple-500" size={20} />}
          title="Total Employees Paid"
          value={summary.totalPaid.toString()}
        />
      </section>

      {/* Payroll Table */}
      <section className="border border-[var(--border-color)] bg-[var(--card-bg)] rounded-2xl p-4 shadow-sm">
        <PayrollTable data={payrolls} role="ADMIN" />
      </section>
    </main>
  );
}
