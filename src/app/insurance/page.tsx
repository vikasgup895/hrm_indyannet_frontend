/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function InsuranceDashboard() {
  const [insurances, setInsurances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/insurance")
      .then((res) => setInsurances(res.data))
      .catch((err) => console.error("❌ Error fetching insurances:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-400">
        Loading insurance records...
      </p>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
        Insurance Management
      </h1>

      {insurances.length === 0 ? (
        <p className="text-gray-500">No insurance records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-[var(--border-color)] text-sm">
            <thead className="bg-[var(--card-bg)] text-[var(--text-primary)]">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Policy</th>
                <th className="p-3 text-left">Provider</th>
                <th className="p-3 text-left">Coverage</th>
                <th className="p-3 text-left">Bonus %</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {insurances.map((i) => (
                <tr
                  key={i.id}
                  className="border-t border-[var(--border-color)] hover:bg-[var(--hover-bg)]"
                >
                  <td className="p-3">
                    {i.employee?.firstName} {i.employee?.lastName}
                  </td>
                  <td className="p-3">{i.policyNumber}</td>
                  <td className="p-3">{i.provider}</td>
                  <td className="p-3">₹{i.coverageAmount}</td>
                  <td className="p-3">{i.bonusPercent ?? "—"}</td>
                  <td className="p-3 flex gap-3">
                    <Link
                      href={`/insurance/increment?id=${i.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      Bonus
                    </Link>
                    <Link
                      href={`/insurance/ctc?id=${i.id}`}
                      className="text-green-500 hover:underline"
                    >
                      CTC
                    </Link>
                    <Link
                      href={`/insurance/convenience?id=${i.id}`}
                      className="text-yellow-400 hover:underline"
                    >
                      Fee
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
