"use client";

import { ClipboardList } from "lucide-react";

export default function PerformancePage() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(10,10,10)' }}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2 text-gray-100">
          <ClipboardList className="text-blue-400" /> Performance Reviews
        </h1>

        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow p-6">
          <p className="text-gray-300">
            Track employee KPIs, assign performance goals, and monitor yearly
            appraisals.
          </p>
        </div>

        <div className="overflow-x-auto border border-gray-700 rounded-xl bg-gray-800 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-750 text-gray-300">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Performance Score</th>
                <th className="p-3 text-left">Last Review</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-700 hover:bg-gray-750">
                <td className="p-3 text-gray-200">John Doe</td>
                <td className="p-3 text-gray-200">92%</td>
                <td className="p-3 text-gray-200">Q2 2025</td>
                <td className="p-3 text-green-400 font-medium">Excellent</td>
              </tr>
              <tr className="border-t border-gray-700 hover:bg-gray-750">
                <td className="p-3 text-gray-200">Jane Smith</td>
                <td className="p-3 text-gray-200">78%</td>
                <td className="p-3 text-gray-200">Q2 2025</td>
                <td className="p-3 text-yellow-400 font-medium">Good</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
