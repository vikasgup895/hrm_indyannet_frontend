"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

const qc = new QueryClient();

export default function Providers({ children }: PropsWithChildren) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
