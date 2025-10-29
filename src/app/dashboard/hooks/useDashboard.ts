/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

const fetcher = async (url: string, token: string) => {
  const res = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export function useDashboardData() {
  const { token } = useAuth();

  const { data, error, isLoading } = useSWR(
    token ? ["/dashboard/data", token] : null,
    ([url, token]) => fetcher(url, token),
    { refreshInterval: 60000 } // auto-refresh every 60s
  );

  return {
    dashboard: data || null,
    isLoading,
    error,
  };
}
