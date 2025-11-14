"use client";

import { useAuth } from "@/store/auth";
import SettingsAdminPage from "./page.admin";
import SettingsEmployeePage from "./page.employee";

export default function SettingsPage() {
  const { role } = useAuth();

  if (role === "ADMIN" || role === "HR") return <SettingsAdminPage />;
  if (role === "EMPLOYEE") return <SettingsEmployeePage />;

  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      Unauthorized Access
    </div>
  );
}
