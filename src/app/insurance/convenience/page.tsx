"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Coins, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/store/auth";

// Define TypeScript interfaces
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  designation?: string;
}

interface ConvenienceCharge {
  id: string;
  employeeId: string;
  title: string;
  amount: number;
  date: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  approvalDate?: string;
  rejectionReason?: string;
  approvedBy?: string;
  employee?: Employee;
}

interface GroupedCharges {
  [employeeId: string]: {
    employee: Employee;
    charges: ConvenienceCharge[];
    totalAmount: number;
  };
}

export default function ConvenienceChargeApprovalsPage() {
  const { token } = useAuth();
  const [pendingCharges, setPendingCharges] = useState<ConvenienceCharge[]>([]);
  const [processedCharges, setProcessedCharges] = useState<ConvenienceCharge[]>(
    []
  ); // APPROVED + REJECTED
  const [selectedCharges, setSelectedCharges] = useState<Set<string>>(
    new Set()
  );
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] =
    useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<
    Record<string, string>
  >({});
  const [activeTab, setActiveTab] = useState<"pending" | "processed">(
    "pending"
  );

  // Load all charges
  useEffect(() => {
    const loadCharges = async () => {
      if (!token) return;

      try {
        setLoading(true);

        // Fetch PENDING charges
        const pendingRes = await api.get("/convenience/pending/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch APPROVED charges
        const approvedRes = await api.get("/convenience/status/APPROVED", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch REJECTED charges
        const rejectedRes = await api.get("/convenience/status/REJECTED", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPendingCharges(pendingRes.data || []);
        setProcessedCharges([
          ...(approvedRes.data || []),
          ...(rejectedRes.data || []),
        ]);
      } catch (err: any) {
        console.error("Failed to load charges:", err);
        alert("❌ Failed to load charges");
      } finally {
        setLoading(false);
      }
    };

    loadCharges();
  }, [token]);

  // Handle checkbox toggle
  const toggleChargeSelection = (chargeId: string) => {
    const newSelected = new Set(selectedCharges);
    if (newSelected.has(chargeId)) {
      newSelected.delete(chargeId);
    } else {
      newSelected.add(chargeId);
    }
    setSelectedCharges(newSelected);
  };

  // Handle bulk action
  const handleBulkAction = async (action: "APPROVED" | "REJECTED") => {
    if (selectedCharges.size === 0) {
      alert("Please select at least one charge");
      return;
    }

    if (action === "REJECTED") {
      // Validate rejection reasons for all selected charges
      for (const chargeId of selectedCharges) {
        if (!rejectionReasons[chargeId]?.trim()) {
          alert(`Please provide rejection reason for charge ${chargeId}`);
          return;
        }
      }
    }

    setProcessing(true);
    try {
      const chargesData: Record<string, string> = {};
      for (const chargeId of selectedCharges) {
        chargesData[chargeId] = action;
      }

      const response = await api.put(
        "/convenience/bulk/approve-reject",
        {
          charges: chargesData,
          rejectionReasons:
            action === "REJECTED" ? rejectionReasons : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(
        `✅ Bulk action completed!\n` +
          `Processed: ${response.data.summary.processed}\n` +
          `Failed: ${response.data.summary.failed}`
      );

      // Clear selection and refresh
      setSelectedCharges(new Set());
      setRejectionReasons({});

      // Reload charges
      const pendingRes = await api.get("/convenience/pending/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const approvedRes = await api.get("/convenience/status/APPROVED", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rejectedRes = await api.get("/convenience/status/REJECTED", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPendingCharges(pendingRes.data || []);
      setProcessedCharges([
        ...(approvedRes.data || []),
        ...(rejectedRes.data || []),
      ]);
    } catch (err: any) {
      console.error("Bulk action failed:", err);
      alert(
        "❌ Bulk action failed: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setProcessing(false);
    }
  };

  // Group charges by employee
  const groupChargesByEmployee = (
    charges: ConvenienceCharge[]
  ): GroupedCharges => {
    const grouped: GroupedCharges = {};

    charges.forEach((charge) => {
      if (!grouped[charge.employeeId]) {
        grouped[charge.employeeId] = {
          employee: charge.employee || {
            id: charge.employeeId,
            firstName: "Unknown",
            lastName: "Employee",
            department: "—",
          },
          charges: [],
          totalAmount: 0,
        };
      }
      grouped[charge.employeeId].charges.push(charge);
      grouped[charge.employeeId].totalAmount += charge.amount;
    });

    return grouped;
  };

  const groupedPending = groupChargesByEmployee(pendingCharges);
  const groupedProcessed = groupChargesByEmployee(processedCharges);

  // Filter by selected employee
  const filteredPending = selectedEmployeeFilter
    ? groupedPending[selectedEmployeeFilter]
      ? { [selectedEmployeeFilter]: groupedPending[selectedEmployeeFilter] }
      : {}
    : groupedPending;

  const filteredProcessed = selectedEmployeeFilter
    ? groupedProcessed[selectedEmployeeFilter]
      ? { [selectedEmployeeFilter]: groupedProcessed[selectedEmployeeFilter] }
      : {}
    : groupedProcessed;

  // Get unique employees for filter
  const allEmployees = Array.from(
    new Map(
      [...pendingCharges, ...processedCharges]
        .filter((c) => c.employee)
        .map((c) => [
          c.employeeId,
          {
            id: c.employeeId,
            name: `${c.employee?.firstName} ${c.employee?.lastName}`,
          },
        ])
    ).values()
  );

  if (loading) {
    return <p className="p-6 text-center">Loading charges...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
          <FileText className="text-purple-500" />
          Convenience Charge Approvals
        </h1>
        <div className="text-sm text-[var(--text-muted)] space-y-1">
          <span className="bg-yellow-100 dark:bg-yellow-500/30 px-3 py-1 rounded-full block text-center">
            Pending: <strong>{pendingCharges.length}</strong>
          </span>
          <span className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full block text-center">
            Approved:{" "}
            <strong>
              {processedCharges.filter((c) => c.status === "APPROVED").length}
            </strong>
          </span>
          <span className="bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full block text-center">
            Rejected:{" "}
            <strong>
              {processedCharges.filter((c) => c.status === "REJECTED").length}
            </strong>
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--border-color)]">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${
              activeTab === "pending"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <AlertCircle size={16} className="inline mr-2" />
            Pending Charges ({pendingCharges.length})
          </button>
          <button
            onClick={() => setActiveTab("processed")}
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${
              activeTab === "processed"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <CheckCircle size={16} className="inline mr-2" />
            Approved & Rejected ({processedCharges.length})
          </button>
        </div>
      </div>

      {/* Employee Filter */}
      <div className="flex gap-4 items-center">
        <label className="text-sm font-medium text-[var(--text-primary)]">
          Filter by Employee:
        </label>
        <select
          value={selectedEmployeeFilter}
          onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
          className="px-4 py-2 border border-[var(--border-color)] rounded-lg bg-transparent text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 outline-none"
        >
          <option value="">All Employees</option>
          {allEmployees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>

      {/* PENDING TAB */}
      {activeTab === "pending" && (
        <div className="space-y-6">
          {/* Bulk Actions */}
          {selectedCharges.size > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/0 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex justify-between items-center">
                <p className="text-blue-900 dark:text-blue-500 font-medium">
                  {selectedCharges.size} charge(s) selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction("APPROVED")}
                    disabled={processing}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
                  >
                    ✅ Approve All
                  </button>
                  <button
                    onClick={() => handleBulkAction("REJECTED")}
                    disabled={processing}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
                  >
                    ❌ Reject All
                  </button>
                  <button
                    onClick={() => setSelectedCharges(new Set())}
                    disabled={processing}
                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-medium transition"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Grouped Pending Charges */}
          {Object.keys(filteredPending).length === 0 ? (
            <div className="text-center py-10 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-xl">
              <CheckCircle size={40} className="mx-auto text-green-500 mb-2" />
              <p className="text-[var(--text-muted)] text-lg">
                No pending charges
              </p>
              <p className="text-gray-500 text-sm">
                All charges have been processed!
              </p>
            </div>
          ) : (
            Object.entries(filteredPending).map(([employeeId, group]) => (
              <div
                key={employeeId}
                className="border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] overflow-hidden"
              >
                {/* Employee Header */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/0 dark:to-blue-900/0 p-4 border-b border-[var(--border-color)]">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        {group.employee?.firstName ?? "Unknown"}{" "}
                        {group.employee?.lastName ?? "Employee"}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        {group.employee?.department ?? "—"} •{" "}
                        {group.employee?.designation || "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-600">
                        ₹{group.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {group.charges.length} charge(s)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Charges Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-[var(--text-primary)]">
                    <thead>
                      <tr className="bg-[var(--hover-bg)] text-[var(--text-muted)] text-left">
                        <th className="p-3 w-10">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              const newSelected = new Set(selectedCharges);
                              group.charges.forEach((charge) => {
                                if (e.target.checked) {
                                  newSelected.add(charge.id);
                                } else {
                                  newSelected.delete(charge.id);
                                }
                              });
                              setSelectedCharges(newSelected);
                            }}
                            checked={group.charges.every((c) =>
                              selectedCharges.has(c.id)
                            )}
                          />
                        </th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.charges.map((charge) => (
                        <tr
                          key={charge.id}
                          className="border-t border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedCharges.has(charge.id)}
                              onChange={() => toggleChargeSelection(charge.id)}
                            />
                          </td>
                          <td className="p-3 font-medium">{charge.title}</td>
                          <td className="p-3 text-amber-600 font-semibold">
                            ₹{charge.amount.toLocaleString()}
                          </td>
                          <td className="p-3">
                            {new Date(charge.date).toLocaleDateString("en-IN")}
                          </td>
                          <td className="p-3 text-[var(--text-muted)]">
                            {new Date(charge.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Rejection Reasons - Show only if selecting for rejection */}
                {selectedCharges.size > 0 &&
                  group.charges.some((c) => selectedCharges.has(c.id)) && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/0 border-t border-[var(--border-color)]">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-500 mb-2">
                        Rejection Reasons (if rejecting):
                      </p>
                      <div className="space-y-2">
                        {group.charges
                          .filter((c) => selectedCharges.has(c.id))
                          .map((charge) => (
                            <textarea
                              key={`reason-${charge.id}`}
                              placeholder={`Reason for ${charge.title} (optional)`}
                              value={rejectionReasons[charge.id] || ""}
                              onChange={(e) =>
                                setRejectionReasons({
                                  ...rejectionReasons,
                                  [charge.id]: e.target.value,
                                })
                              }
                              className="w-full p-2 text-sm border border-red-500 rounded bg-transparent text-[var(--text-primary)] focus:ring-2 focus:ring-red-500 outline-none resize-none"
                              rows={2}
                            />
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      )}

      {/* PROCESSED TAB */}
      {activeTab === "processed" && (
        <div className="space-y-6">
          {Object.keys(filteredProcessed).length === 0 ? (
            <div className="text-center py-10 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-xl">
              <FileText size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-[var(--text-muted)] text-lg">
                No processed charges yet
              </p>
            </div>
          ) : (
            Object.entries(filteredProcessed).map(([employeeId, group]) => (
              <div
                key={employeeId}
                className="border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] overflow-hidden"
              >
                {/* Employee Header */}
                <div className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-900/0 dark:to-gray-900/0 p-4 border-b border-[var(--border-color)]">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        {group.employee?.firstName ?? "Unknown"}{" "}
                        {group.employee?.lastName ?? "Employee"}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        {group.employee?.department ?? "—"} •{" "}
                        {group.employee?.designation || "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                        ₹{group.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {group.charges.length} charge(s)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Charges Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-[var(--text-primary)]">
                    <thead>
                      <tr className="bg-[var(--hover-bg)] text-[var(--text-muted)] text-left">
                        <th className="p-3">Title</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Approved On</th>
                        <th className="p-3">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.charges.map((charge) => (
                        <tr
                          key={charge.id}
                          className={`border-t border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors ${
                            charge.status === "REJECTED" ? "opacity-75" : ""
                          }`}
                        >
                          <td className="p-3 font-medium">{charge.title}</td>
                          <td className="p-3 text-amber-600 font-semibold">
                            ₹{charge.amount.toLocaleString()}
                          </td>
                          <td className="p-3">
                            {new Date(charge.date).toLocaleDateString("en-IN")}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                charge.status === "APPROVED"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {charge.status}
                            </span>
                          </td>
                          <td className="p-3 text-[var(--text-muted)]">
                            {charge.approvalDate
                              ? new Date(
                                  charge.approvalDate
                                ).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="p-3 text-xs text-[var(--text-muted)]">
                            {charge.rejectionReason || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
