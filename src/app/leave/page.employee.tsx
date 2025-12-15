/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  CalendarDays,
  ClipboardList,
  FilePlus2,
  Loader2,
  PlaneTakeoff,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";
import { useTheme } from "@/context/ThemeProvider"; // ✅ added

/***********************
 * Helpers & Modal
 ***********************/
const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString() : "—";

function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/70"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 shadow-2xl transition-colors">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-[var(--hover-bg)] transition"
          >
            <X className="h-5 w-5 text-[var(--text-muted)]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/***********************
 * Types
 ***********************/
type BalanceSummary = {
  policyId: string;
  policyName: string;
  available: number;
  used: number;
};

type LeavePolicy = {
  id: string;
  name: string;
  annualQuota?: number;
};

/***********************
 * Employee Page
 ***********************/
export default function LeaveEmployeePage() {
  const { theme } = useTheme(); // ✅ integrate with global theme
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [balances, setBalances] = useState<BalanceSummary[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  // Form state
  const [policyId, setPolicyId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  /***********************
   * Load Leave Data
   ***********************/
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pRes, bRes, rRes] = await Promise.all([
          api.get("/leave/policies"),
          api.get("/leave/balances/me"),
          api.get("/leave/my-requests"),
        ]);
        setPolicies(pRes.data.data || []);
        setBalances(bRes.data.data || []);
        setMyRequests(rRes.data.data || []);
      } catch (err: any) {
        console.error("❌ Failed to load leave data:", err);
        alert(err?.response?.data?.message || "Failed to load leave data");
      }
    };

    loadData();
  }, []);

  /***********************
   * Computed Values
   ***********************/
  const selectedPolicy = useMemo(
    () => policies.find((p) => p.id === policyId),
    [policyId, policies]
  );

  const daysRequested = useMemo(() => {
    if (!startDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate || startDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
    const ONE = 1000 * 60 * 60 * 24;
    const diff = Math.floor((e.getTime() - s.getTime()) / ONE) + 1;
    return halfDay ? 0.5 : Math.max(diff, 1);
  }, [startDate, endDate, halfDay]);

  const availableForSelected = useMemo(
    () => balances.find((b) => b.policyId === policyId)?.available ?? 0,
    [balances, policyId]
  );

  const validToSubmit =
    !!policyId && !!startDate && daysRequested > 0 && daysRequested <= 365;

  /***********************
   * Actions
   ***********************/
  const openConfirm = () => {
    if (!validToSubmit) {
      alert("Please fill in all required fields correctly.");
      return;
    }
    if (daysRequested > availableForSelected) {
      if (
        !confirm("You are requesting more days than available. Submit anyway?")
      )
        return;
    }
    setConfirmOpen(true);
  };

  const submitRequest = async () => {
    setBusy(true);
    try {
      await api.post("/leave/request", {
        policyId,
        startDate,
        endDate: endDate || startDate,
        days: daysRequested,
        halfDay,
        reason,
      });

      // Refresh after success
      setConfirmOpen(false);
      setPolicyId("");
      setStartDate("");
      setEndDate("");
      setHalfDay(false);
      setReason("");

      const [bRes, rRes] = await Promise.all([
        api.get("/leave/balances/me"),
        api.get("/leave/my-requests"),
      ]);
      setBalances(bRes.data.data || []);
      setMyRequests(rRes.data.data || []);

      alert("✅ Leave request submitted successfully!");
    } catch (e: any) {
      console.error("❌ Error submitting leave:", e);
      alert(e?.response?.data?.message || "Could not submit request");
    } finally {
      setBusy(false);
    }
  };

  const cancelRequest = async (id: string) => {
    if (!confirm("Cancel this request?")) return;
    try {
      await api.put(`/leave/request/${id}/cancel`);
      const rRes = await api.get("/leave/my-requests");
      setMyRequests(rRes.data.data || []);
    } catch {
      alert("Failed to cancel request");
    }
  };

  const refreshData = async () => {
    const [bRes, rRes] = await Promise.all([
      api.get("/leave/balances/me"),
      api.get("/leave/my-requests"),
    ]);
    setBalances(bRes.data.data || []);
    setMyRequests(rRes.data.data || []);
  };

  /***********************
   * UI
   ***********************/
  return (
    <main className="min-h-screen space-y-10 p-1 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-primary)]">
          <CalendarDays className="text-blue-600" /> My Leave
        </h1>
        <button
          onClick={refreshData}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors"
        >
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Leave Balances */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ">
        {balances.map((b) => (
          <div
            key={b.policyId}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 transition-colors"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium text-[var(--text-primary)]">
                {b.policyName}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                Available
              </span>
            </div>
            <div className="text-lg text-[var(--text-primary)]">
              {b.available} days
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              Used: {b.used}
            </div>
          </div>
        ))}
      </section>

      {/* Request Form */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 transition-colors">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
          <PlaneTakeoff className="text-green-500" /> Request Leave
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="mb-1 text-xs text-[var(--text-muted)]">
              Leave Type
            </div>
            <select
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--hover-bg)] px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Select</option>
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 text-xs text-[var(--text-muted)]">
              Start Date
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--hover-bg)] px-3 py-2 text-[var(--text-primary)]"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-[var(--text-muted)]">
              End Date
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--hover-bg)] px-3 py-2 text-[var(--text-primary)]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={halfDay}
              onChange={(e) => setHalfDay(e.target.checked)}
            />{" "}
            Half day
          </label>

          <div className="md:col-span-2 lg:col-span-3">
            <div className="mb-1 text-xs text-[var(--text-muted)]">
              Reason (optional)
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-lg border border-[var(--border-color)] bg-[var(--hover-bg)] px-3 py-2 text-[var(--text-primary)]"
              placeholder="Add any context for your manager"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={openConfirm}
            disabled={!validToSubmit || busy}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-40"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FilePlus2 className="h-4 w-4" />
            )}{" "}
            Submit Request
          </button>
        </div>
      </section>

      {/* My Requests */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 transition-colors">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
          <ClipboardList className="text-blue-400" /> My Requests
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Dates</th>
                <th className="px-3 py-2">Days</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {myRequests.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-[var(--hover-bg)] transition-colors"
                >
                  <td className="px-3 py-2">
                    {r.policy?.name || r.policyName}
                  </td>
                  <td className="px-3 py-2">
                    {fmtDate(r.startDate)}{" "}
                    {r.endDate && r.endDate !== r.startDate
                      ? `→ ${fmtDate(r.endDate)}`
                      : ""}
                  </td>
                  <td className="px-3 py-2">{r.days}</td>
                  <td
                    className={`px-3 py-2 ${
                      r.status === "APPROVED"
                        ? "text-green-500"
                        : r.status === "REJECTED"
                          ? "text-red-500"
                          : r.status === "CANCELLED"
                            ? "text-gray-400"
                            : "text-amber-500"
                    }`}
                  >
                    {r.status}
                  </td>
                  <td className="px-3 py-2">
                    {r.status === "PENDING" ? (
                      <button
                        onClick={() => cancelRequest(r.id)}
                        className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" /> Cancel
                      </button>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Confirm Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Leave Request"
      >
        <div className="text-sm text-[var(--text-primary)]">
          <div className="mb-2">
            Type: <strong>{selectedPolicy?.name || "—"}</strong>
          </div>
          <div className="mb-2">
            Dates: <strong>{fmtDate(startDate)}</strong>
            {endDate && endDate !== startDate ? ` → ${fmtDate(endDate)}` : ""}
          </div>
          <div className="mb-2">
            Days: <strong>{daysRequested}</strong> {halfDay ? "(half day)" : ""}
          </div>
          <div className="mb-4">
            Reason:{" "}
            <span className="text-[var(--text-muted)]">{reason || "—"}</span>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-sm hover:bg-[var(--hover-bg)]"
              onClick={() => setConfirmOpen(false)}
            >
              Back
            </button>
            <button
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={submitRequest}
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
