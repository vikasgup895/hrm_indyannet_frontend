"use client";

import { useAuth } from "@/store/auth";
import EmployeesAdminPage from "./page.admin";
import EmployeesEmployeePage from "../profile/page.employee";

export default function EmployeesPage() {
  const { role } = useAuth();

  if (role === "ADMIN" || role === "HR") return <EmployeesAdminPage />;
  if (role === "EMPLOYEE") return <EmployeesEmployeePage />;

  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      Unauthorized Access
    </div>
  );
}
