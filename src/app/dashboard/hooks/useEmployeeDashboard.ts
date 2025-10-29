import useSWR from "swr";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

export function useEmployeeDashboard() {
  const { token } = useAuth();

  const fetcher = (url: string) =>
    api
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.data);

  const { data, error, isLoading } = useSWR(
    token ? "/dashboard/employee" : null,
    fetcher
  );

  return {
    employeeDashboard: data,
    isLoading,
    error,
  };
}
