"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Cookies from "js-cookie";
import { PropsWithChildren, useEffect } from "react";

const qc = new QueryClient();
export default function Providers({ children }: PropsWithChildren) {
  useEffect(() => {
    api.interceptors.request.use((cfg) => {
      const token = Cookies.get("token");
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      return cfg;
    });
  }, []);
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
