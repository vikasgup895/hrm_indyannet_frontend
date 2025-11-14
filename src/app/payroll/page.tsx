"use client";

import { useAuth } from "@/store/auth";
import PayrollAdminPage from "./page.admin";
import PayrollEmployeePage from "./page.employee";

export default function PayrollPage() {
  const { role } = useAuth();

  if (role === "ADMIN" || role === "HR") return <PayrollAdminPage />;
  if (role === "EMPLOYEE") return <PayrollEmployeePage />;

  return <div className="p-6 text-gray-500">Unauthorized Access</div>;
}
