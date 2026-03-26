"use client";

import { useAuth } from "@/store/auth";
import PerformanceAdminPage from "./page.admin";
import PerformanceEmployeePage from "./page.employee";

export default function PerformancePage() {
  const { role } = useAuth();

  if (role === "ADMIN") return <PerformanceAdminPage />;
  if (role === "EMPLOYEE" || role === "HR") return <PerformanceEmployeePage />;

  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      Unauthorized Access
    </div>
  );
}
