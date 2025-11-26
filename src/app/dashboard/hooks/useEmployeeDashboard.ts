/* eslint-disable @typescript-eslint/no-explicit-any */

import useSWR from "swr";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

/**
 * Fetches employee dashboard data for current user.
 * Auto-handles token, loading, caching, and errors.
 */
export function useEmployeeDashboard() {
  const { token } = useAuth();

  // Secure typed fetcher
  const fetcher = async (url: string) => {
    if (!token) return null;

    const res = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  };

  const { data, error, isLoading, mutate } = useSWR(
    token ? "/dashboard/employee" : null,
    fetcher,
    {
      revalidateOnFocus: true,         // refresh when user returns to tab
      revalidateIfStale: true,         // keep data always fresh
      revalidateOnReconnect: true,     // refresh after network reconnect
      shouldRetryOnError: false,       // avoid spam retries
    }
  );

  return {
    employeeDashboard: data || null,
    isLoading,
    error,
    refreshDashboard: mutate,          // allows manual refresh in UI
  };
}
