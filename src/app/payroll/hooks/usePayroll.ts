/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

const fetcher = (url: string, token: string) =>
  api
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

export function usePayroll(role: string) {
  const { token } = useAuth();

  // ✅ Fetch payroll runs for admin/HR
  const {
    data: payrollRuns,
    error,
    mutate,
    isLoading,
  } = useSWR(
    (role === "ADMIN" || role === "HR") && token
      ? ["/payroll/runs", token]
      : null,
    ([url, token]) => fetcher(url, token)
  );

  // ✅ Fetch employee payslips
  const { data: payslips, error: payslipsError } = useSWR(
    token ? ["/payroll/payslips", token] : null,
    ([url, token]) => fetcher(url, token)
  );

  // ✅ Transform API data to match frontend expectations
  const transformedPayslips =
    payslips?.map((payslip: any) => ({
      id: payslip.id,
      name: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
      dept: payslip.employee.department || "N/A",
      salary: `₹${payslip.net.toLocaleString()}`,
      month: payslip.payrollRun
        ? new Date(payslip.payrollRun.periodStart).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })
        : "N/A",
      // Treat PAID payroll runs or APPROVED payslips as Paid, everything else Pending
      status:
        payslip.payrollRun?.status === "PAID" || payslip.status === "APPROVED"
          ? "Paid"
          : "Pending",
      gross: payslip.gross,
      deductions: payslip.deductions,
      net: payslip.net,
      currency: payslip.currency,
    })) || [];

  const payrollSummary = {
    currentMonth: new Date().toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    }),
    totalPaid: transformedPayslips.filter((p: any) => p.status === "Paid")
      .length,
    lastProcessed: payrollRuns?.[0]
      ? new Date(payrollRuns[0].periodEnd).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        })
      : "N/A",
    pending: transformedPayslips.filter((p: any) => p.status === "Pending")
      .length,
  };

  return {
    payrolls: transformedPayslips,
    payrollRuns: payrollRuns || [],
    summary: payrollSummary,
    isLoading: isLoading,
    error: error || payslipsError,
    mutate,
  };
}

// ✅ New hook for payroll operations
export function usePayrollOperations() {
  const { token } = useAuth();

  const startPayrollRun = async (data: {
    periodStart: string;
    periodEnd: string;
    payDate: string;
  }) => {
    try {
      const response = await api.post("/payroll/runs", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to start payroll run:", error);
      throw error;
    }
  };

  const publishPayroll = async (runId: string) => {
    try {
      const response = await api.post(
        `/payroll/runs/${runId}/publish`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to publish payroll:", error);
      throw error;
    }
  };

  return { startPayrollRun, publishPayroll };
}
