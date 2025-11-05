  /* eslint-disable @typescript-eslint/no-explicit-any */
  "use client";

  import { useState, useEffect, useMemo } from "react";
  import {
    Bell,
    CalendarDays,
    ClipboardList,
    FilePlus2,
    RefreshCcw,
    Undo2,
    UserPlus,
    X,
  } from "lucide-react";
  import { api } from "@/lib/api";
  import { useAuth } from "@/store/auth";
  import { useLeave, useApproveLeave } from "./hooks/useLeave";
  import LeaveTable from "./components/LeaveTable";

  type Employee = {
    id: string;
    firstName: string;
    lastName: string;
    department?: string;
    workEmail?: string;
  };

  type LeavePolicy = {
    id: string;
    name: string;
    period?: string;
    maxPerPeriod?: number;
  };

  type BalanceSummary = {
    policyId: string;
    policyName: string;
    available: number;
    used: number;
  };

  type HistoryItem = {
    id: string;
    actorName: string;
    employeeName: string;
    policyName: string;
    days: number;
    action: "ASSIGN" | "ADJUST" | "REVOKE";
    createdAt: string;
    notes?: string;
  };

  const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "—");

  // 🧩 Modal Component
  function Modal({
    open,
    onClose,
    title,
    children,
  }: {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
  }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 shadow-2xl transition-colors">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-[var(--hover-bg)]"
            >
              <X className="h-5 w-5 text-[var(--text-muted)]" />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  }

  export default function LeaveAdminPage() {
    const { token, role } = useAuth();
    const { leaves, mutate, isLoading } = useLeave(role!, token!);
    const { approveLeave } = useApproveLeave();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");

    const [assignData, setAssignData] = useState<Record<string, number>>({});
    const [allowCarryForward, setAllowCarryForward] = useState(false);
    const [allowEncashment, setAllowEncashment] = useState(false);
    const [validFrom, setValidFrom] = useState("");
    const [validUntil, setValidUntil] = useState("");
    const [notifyEmployee, setNotifyEmployee] = useState(true);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [lastAssignmentBatchId, setLastAssignmentBatchId] = useState<
      string | null
    >(null);

    const [balances, setBalances] = useState<BalanceSummary[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [csvBusy, setCsvBusy] = useState(false);

    // Fetch employees & leave policies
    useEffect(() => {
      const fetchData = async () => {
        try {
          const [empRes, policyRes] = await Promise.all([
            api.get("/employees/basic/all"),
            api.get("/leave/policies"),
          ]);
          setEmployees(empRes.data || []);
          setLeavePolicies(policyRes.data?.data || []);
        } catch (error) {
          console.error("Error fetching employees/policies:", error);
        }
      };
      if (token) fetchData();
    }, [token]);

    // Fetch balances & history
    useEffect(() => {
      if (!selectedEmployee) return;
      const fetchDetails = async () => {
        try {
          const [balRes, histRes] = await Promise.all([
            api.get(`/leave/balances/${selectedEmployee}`),
            api.get(`/leave/history?employeeId=${selectedEmployee}`),
          ]);
          setBalances(balRes.data?.data || []);
          setHistory(histRes.data?.data || []);
        } catch (e) {
          console.error("Failed to fetch balances/history", e);
        }
      };
      fetchDetails();
    }, [selectedEmployee, token]);

    // Input handler
    const handleDaysChange = (policyId: string, value: string) => {
      setAssignData((prev) => ({ ...prev, [policyId]: Number(value) }));
    };

    // Build payload dynamically
    const payload = useMemo(
      () =>
        Object.entries(assignData)
          .filter(([_, days]) => Number(days) > 0)
          .map(([policyId, days]) => ({
            employeeId: selectedEmployee,
            policyId,
            days,
            allowCarryForward,
            allowEncashment,
            validFrom: validFrom || undefined,
            validUntil: validUntil || undefined,
            notify: notifyEmployee,
          })),
      [
        assignData,
        selectedEmployee,
        allowCarryForward,
        allowEncashment,
        validFrom,
        validUntil,
        notifyEmployee,
      ]
    );

    const openPreview = () => {
      if (!selectedEmployee) return alert("⚠️ Please select an employee first");
      if (!payload.length)
        return alert("⚠️ Enter at least one valid leave day count");
      setPreviewOpen(true);
    };

    const confirmAssign = async () => {
      try {
        const res = await api.post("/leave/assign", payload);
        setPreviewOpen(false);
        setAssignData({});
        setLastAssignmentBatchId(res.data?.batchId || null);
        alert("✅ Leave balances assigned successfully!");
      } catch (err: any) {
        console.error("Assign failed:", err);
        alert(err?.response?.data?.message || "❌ Assignment failed.");
      }
    };

    const undoLastAssignment = async () => {
      if (!lastAssignmentBatchId) return;
      try {
        await api.post(`/leave/assign/${lastAssignmentBatchId}/undo`);
        alert("↩️ Last assignment undone successfully!");
        setLastAssignmentBatchId(null);
      } catch {
        alert("❌ Undo window expired or failed.");
      }
    };

    const handleApprove = async (
      id: string,
      status: "APPROVED" | "REJECTED" | "PENDING"
    ) => {
      try {
        if (status === "PENDING") return;
        if (status === "APPROVED") await approveLeave(id, "current-approver-id");
        else
          await api.put(`/leave/${id}/reject`, {
            approverId: "current-approver-id",
          });

        await mutate();
        alert(`✅ Leave request ${status.toLowerCase()} successfully!`);
      } catch {
        alert("❌ Failed to update leave request.");
      }
    };

    return (
      <main className="min-h-screen space-y-10 bg-[var(--background)] p-6 text-[var(--text-primary)] transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <CalendarDays className="text-blue-600" /> Leave Management (Admin)
          </h1>
          <button
            disabled={!lastAssignmentBatchId}
            onClick={undoLastAssignment}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm disabled:opacity-40 hover:bg-[var(--hover-bg)] transition-colors"
          >
            <Undo2 className="h-4 w-4" /> Undo
          </button>
        </div>

        {/* Assign Section */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 transition-colors">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <UserPlus className="text-green-500" /> Assign Leave Balances
            </h2>
            <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={notifyEmployee}
                onChange={(e) => setNotifyEmployee(e.target.checked)}
              />
              <Bell className="h-4 w-4" /> Notify employee
            </label>
          </div>

          {/* Employee Dropdown */}
          <div className="mb-4">
            <label className="mb-2 block text-sm text-[var(--text-muted)]">
              Select Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-4 py-3 text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}{" "}
                  {emp.department ? `(${emp.department})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Leave Policies */}
          {leavePolicies.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {leavePolicies.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-[var(--text-primary)]">
                        {p.name}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {p.period || "Annual"}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={assignData[p.id] || ""}
                    placeholder="Enter days"
                    onChange={(e) => handleDaysChange(p.id, e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={openPreview}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition"
            >
              Preview & Assign
            </button>
          </div>
        </section>

        {/* Leave Requests Table */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            Employee Leave Requests
          </h2>
          {isLoading ? (
            <p className="text-[var(--text-muted)]">Loading...</p>
          ) : (
            <LeaveTable
              leaves={leaves.data || []}
              role={role!}
              onApprove={handleApprove}
            />
          )}
        </section>

        {/* Preview Modal */}
        <Modal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title="Confirm Leave Assignment"
        >
          <div className="mb-4 text-sm text-[var(--text-muted)]">
            Please review the leave assignment before confirming.
          </div>
          <table className="min-w-full text-left text-sm border border-[var(--border-color)]">
            <thead className="bg-[var(--card-bg)] text-xs uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2">Policy</th>
                <th className="px-3 py-2">Days</th>
                <th className="px-3 py-2">Valid From</th>
                <th className="px-3 py-2">Valid Until</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {payload.map((p) => {
                const pol = leavePolicies.find((x) => x.id === p.policyId);
                return (
                  <tr key={p.policyId}>
                    <td className="px-3 py-2">{pol?.name || p.policyId}</td>
                    <td className="px-3 py-2">{p.days}</td>
                    <td className="px-3 py-2">{p.validFrom || "—"}</td>
                    <td className="px-3 py-2">{p.validUntil || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setPreviewOpen(false)}
              className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-sm hover:bg-[var(--hover-bg)]"
            >
              Cancel
            </button>
            <button
              onClick={confirmAssign}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <FilePlus2 className="h-4 w-4" /> Assign
            </button>
          </div>
        </Modal>
      </main>
    );
  }
