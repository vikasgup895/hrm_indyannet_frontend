"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Cookies from "js-cookie";
import { PropsWithChildren, useEffect } from "react";

const qc = new QueryClient();
export default function Providers({ children }: PropsWithChildren) {
  useEffect(() => {
    // Silence client-side console noise in production (keep warn/error)
    if (
      process.env.NODE_ENV === "production" &&
      typeof window !== "undefined"
    ) {
      const noop = () => {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (console as any).log = noop;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (console as any).info = noop;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (console as any).debug = noop;
    }

    api.interceptors.request.use((cfg) => {
      const token = Cookies.get("token");
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      return cfg;
    });
  }, []);
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
