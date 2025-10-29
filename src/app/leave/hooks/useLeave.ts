"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

/************************************
 * Shared fetcher using global api
 ************************************/
const fetcher = (url: string) => api.get(url).then((res) => res.data);

/************************************
 * 🧩 useLeave — fetch requests list
 ************************************/
export function useLeave(role: string, token?: string) {
  // ✅ Correct backend routes
  const endpoint =
    role === "ADMIN" || role === "HR" || role === "MANAGER"
      ? "/leave/all" // Admins, HR, Managers see all requests
      : "/leave/my-requests"; // Employees see their own

  const { data, error, mutate, isLoading } = useSWR(
    token ? endpoint : null,
    fetcher,
    {
      refreshInterval: 10000, // optional auto-refresh every 10s
    }
  );

  return {
    leaves: data || { data: [] },
    error,
    mutate,
    isLoading,
  };
}

/************************************
 * ✍️ useCreateLeave — create request
 ************************************/
export function useCreateLeave() {
  const { token } = useAuth();

  const createLeave = async (leaveData: {
    policyId: string;
    startDate: string;
    endDate: string;
    days: number;
    reason?: string;
  }) => {
    try {
      const response = await api.post("/leave/request", leaveData);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create leave request:", error);
      throw error;
    }
  };

  return { createLeave };
}

/************************************
 * ✅ useApproveLeave — approve/reject
 ************************************/
export function useApproveLeave() {
  const approveLeave = async (leaveId: string, approverId: string) => {
    try {
      const response = await api.put(`/leave/${leaveId}/approve`, {
        approverId,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to approve leave:", error);
      throw error;
    }
  };

  return { approveLeave };
}
