"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import { ClipboardList, Loader2, Pencil, Power, Trash2 } from "lucide-react";

type Cycle = {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  isActive: boolean;
  ratingSystem?: string;
  _count?: { appraisals: number };
};

type CycleForm = {
  name: string;
  periodStart: string;
  periodEnd: string;
  ratingSystem: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(message)) return message[0] || fallback;
  return message || fallback;
}

export default function PerformanceCycleManagementPage() {
  const { role } = useAuth();

  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CycleForm>({
    name: "",
    periodStart: "",
    periodEnd: "",
    ratingSystem: "",
  });

  const [editForm, setEditForm] = useState<CycleForm>({
    name: "",
    periodStart: "",
    periodEnd: "",
    ratingSystem: "",
  });

  const loadCycles = async () => {
    const response = await api.get("/performance/admin/cycles");
    setCycles(response.data?.data || []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await loadCycles();
      } catch (error) {
        alert(getErrorMessage(error, "Failed to load cycles"));
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []);

  const createCycle = async () => {
    if (!createForm.name.trim()) return alert("Cycle name is required");
    if (!createForm.periodStart || !createForm.periodEnd) {
      return alert("Start and end dates are required");
    }
    if (new Date(createForm.periodStart) >= new Date(createForm.periodEnd)) {
      return alert("Start date must be before end date");
    }

    try {
      setCreating(true);
      await api.post("/performance/admin/cycles", {
        name: createForm.name.trim(),
        periodStart: createForm.periodStart,
        periodEnd: createForm.periodEnd,
        ratingSystem: createForm.ratingSystem.trim() || undefined,
        isActive: true,
      });
      await loadCycles();
      setCreateForm({ name: "", periodStart: "", periodEnd: "", ratingSystem: "" });
      alert("Cycle created successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to create cycle"));
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (cycle: Cycle) => {
    setEditingId(cycle.id);
    setEditForm({
      name: cycle.name,
      periodStart: cycle.periodStart ? new Date(cycle.periodStart).toISOString().slice(0, 10) : "",
      periodEnd: cycle.periodEnd ? new Date(cycle.periodEnd).toISOString().slice(0, 10) : "",
      ratingSystem: cycle.ratingSystem || "",
    });
  };

  const saveEdit = async (cycleId: string) => {
    if (!editForm.name.trim()) return alert("Cycle name is required");
    if (!editForm.periodStart || !editForm.periodEnd) {
      return alert("Start and end dates are required");
    }
    if (new Date(editForm.periodStart) >= new Date(editForm.periodEnd)) {
      return alert("Start date must be before end date");
    }

    try {
      setBusyId(cycleId);
      await api.patch(`/performance/admin/cycles/${cycleId}`, {
        name: editForm.name.trim(),
        periodStart: editForm.periodStart,
        periodEnd: editForm.periodEnd,
        ratingSystem: editForm.ratingSystem.trim() || undefined,
      });
      await loadCycles();
      setEditingId(null);
      alert("Cycle updated successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to update cycle"));
    } finally {
      setBusyId(null);
    }
  };

  const deactivateCycle = async (cycleId: string) => {
    if (!confirm("Deactivate this cycle?")) return;

    try {
      setBusyId(cycleId);
      await api.patch(`/performance/admin/cycles/${cycleId}/deactivate`, {
        notes: "Deactivated from cycle management",
      });
      await loadCycles();
      alert("Cycle deactivated successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to deactivate cycle"));
    } finally {
      setBusyId(null);
    }
  };

  const deleteCycle = async (cycleId: string) => {
    if (!confirm("Delete this cycle? This cannot be undone.")) return;

    try {
      setBusyId(cycleId);
      await api.delete(`/performance/admin/cycles/${cycleId}`);
      await loadCycles();
      alert("Cycle deleted successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to delete cycle"));
    } finally {
      setBusyId(null);
    }
  };

  if (role !== "ADMIN") {
    return (
      <div className="flex h-full items-center justify-center text-(--text-muted)">
        Unauthorized Access
      </div>
    );
  }

  return (
    <main className="min-h-screen space-y-6 bg-(--background) p-2 text-(--text-primary)">
      <section className="rounded-xl border border-(--border-color) bg-(--card-bg) p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold">
            <ClipboardList className="h-6 w-6 text-blue-600" /> Appraisal Cycle Management
          </h1>
          <Link
            href="/performance"
            className="rounded-lg border border-(--border-color) px-3 py-2 text-sm"
          >
            Back to Queue
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={createForm.name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Cycle name (e.g. FY 2026-27)"
            className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
          />
          <input
            value={createForm.ratingSystem}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, ratingSystem: e.target.value }))
            }
            placeholder="Rating system (optional)"
            className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
          />
          <div>
            <label htmlFor="create-start-date" className="mb-1 block text-xs text-(--text-muted)">
              Start date
            </label>
            <input
              id="create-start-date"
              type="date"
              value={createForm.periodStart}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, periodStart: e.target.value }))}
              className="w-full rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="create-end-date" className="mb-1 block text-xs text-(--text-muted)">
              End date
            </label>
            <input
              id="create-end-date"
              type="date"
              value={createForm.periodEnd}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, periodEnd: e.target.value }))}
              className="w-full rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={createCycle}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Cycle
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-(--border-color) bg-(--card-bg) p-4 md:p-6">
        <h2 className="mb-3 text-base font-semibold">Existing Cycles</h2>

        {loading ? (
          <p className="inline-flex items-center gap-2 text-sm text-(--text-muted)">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading cycles...
          </p>
        ) : cycles.length === 0 ? (
          <p className="text-sm text-(--text-muted)">No cycles created yet.</p>
        ) : (
          <div className="space-y-3">
            {cycles.map((cycle) => (
              <div
                key={cycle.id}
                className="rounded-lg border border-(--border-color) bg-(--background) p-3"
              >
                {editingId === cycle.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Cycle name"
                        className="rounded-lg border border-(--border-color) bg-(--card-bg) px-3 py-2 text-sm"
                      />
                      <input
                        value={editForm.ratingSystem}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, ratingSystem: e.target.value }))
                        }
                        placeholder="Rating system"
                        className="rounded-lg border border-(--border-color) bg-(--card-bg) px-3 py-2 text-sm"
                      />
                      <input
                        type="date"
                        value={editForm.periodStart}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, periodStart: e.target.value }))
                        }
                        className="rounded-lg border border-(--border-color) bg-(--card-bg) px-3 py-2 text-sm"
                      />
                      <input
                        type="date"
                        value={editForm.periodEnd}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, periodEnd: e.target.value }))}
                        className="rounded-lg border border-(--border-color) bg-(--card-bg) px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-(--border-color) px-3 py-2 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => void saveEdit(cycle.id)}
                        disabled={busyId === cycle.id}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{cycle.name}</p>
                      <p className="text-xs text-(--text-muted)">
                        {new Date(cycle.periodStart).toLocaleDateString()} - {" "}
                        {new Date(cycle.periodEnd).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-(--text-muted)">
                        {cycle.ratingSystem || "Rating: Below / Meets / Exceeds Expectations"}
                      </p>
                      <p className="text-xs text-(--text-muted)">
                        Appraisals: {cycle._count?.appraisals ?? 0} | Status: {cycle.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => startEdit(cycle)}
                        className="inline-flex items-center gap-2 rounded-lg border border-(--border-color) px-3 py-2 text-sm"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => void deactivateCycle(cycle.id)}
                        disabled={busyId === cycle.id || !cycle.isActive}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        <Power className="h-4 w-4" /> Deactivate
                      </button>
                      <button
                        onClick={() => void deleteCycle(cycle.id)}
                        disabled={busyId === cycle.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
