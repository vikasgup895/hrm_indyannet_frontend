"use client";

import { useAuth } from "@/store/auth";
import LeaveAdminPage from "./page.admin";
import LeaveEmployeePage from "./page.employee";

export default function LeavePage() {
  const { role } = useAuth();
  if (role === "ADMIN" || role === "HR") return <LeaveAdminPage />;
  if (role === "EMPLOYEE") return <LeaveEmployeePage />;
  return <div className="p-6 text-gray-500">Unauthorized Access</div>;
}
