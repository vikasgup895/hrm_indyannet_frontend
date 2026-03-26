"use client";

import { useAuth } from "@/store/auth";
import dynamic from "next/dynamic";

const SettingsAdminPage = dynamic(() => import("./page.admin"));
const SettingsEmployeePage = dynamic(() => import("./page.employee"));

export default function SettingsPage() {
  const { role } = useAuth();

  if (role === "ADMIN" || role === "HR" || role === "MD" || role === "CAO") return <SettingsAdminPage />;
  if (role === "EMPLOYEE") return <SettingsEmployeePage />;

  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      Unauthorized Access
    </div>
  );
}
