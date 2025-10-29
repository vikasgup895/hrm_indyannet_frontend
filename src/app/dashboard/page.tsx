"use client";

import { useAuth } from "@/store/auth";
import DashboardAdmin from "./page.admin";
import DashboardEmployee from "./page.employee";

export default function DashboardPage() {
  const { role } = useAuth();

  if (role === "ADMIN") return <DashboardAdmin />;
  if (role === "EMPLOYEE") return <DashboardEmployee />;

  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      Unauthorized Access
    </div>
  );
}
