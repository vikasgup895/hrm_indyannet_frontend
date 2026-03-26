"use client";

import { useAuth } from "@/store/auth";
import dynamic from "next/dynamic";

const PayrollAdminPage = dynamic(() => import("./page.admin"));
const PayrollEmployeePage = dynamic(() => import("./page.employee"));

export default function PayrollPage() {
  const { role } = useAuth();

  if (role === "ADMIN" || role === "HR" || role === "MD" || role === "CAO") return <PayrollAdminPage />;
  if (role === "EMPLOYEE") return <PayrollEmployeePage />;

  return <div className="p-6 text-gray-500">Unauthorized Access</div>;
}
