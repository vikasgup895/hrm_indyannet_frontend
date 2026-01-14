"use client";

import { useAuth } from "@/store/auth";
import ProfilePage from "./page.admin";
import  EmployeesEmployeePage from "./page.employee";

export default function SettingsPage() {
  const { role } = useAuth();

  if (role === "ADMIN" || role === "HR" || role === "MD" || role === "CAO") return <ProfilePage />;

  if (role === "EMPLOYEE") return <EmployeesEmployeePage />;

  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      Unauthorized Access
    </div>
  );
}
