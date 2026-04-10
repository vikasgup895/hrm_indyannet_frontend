"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import StatusChip from "./components/StatusChip";
import RatingBlock from "./components/RatingBlock";
import { AppraisalRating, AppraisalStatus, RatingOption } from "./components/types";
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type Cycle = {
  id: string;
  name: string;
};

type QueueItem = {
  id: string;
  status: AppraisalStatus;
  updatedAt: string;
  cycle: {
    id: string;
    name: string;
  };
  employee: {
    id: string;
    personNo: string;
    firstName: string;
    lastName: string;
    workEmail: string;
    department?: string;
    designation?: string;
  };
};

type AppraisalDetail = {
  id: string;
  status: AppraisalStatus;
  cycle: {
    id: string;
    name: string;
    periodStart: string;
    periodEnd: string;
  };
  employee: {
    id: string;
    personNo: string;
    firstName: string;
    lastName: string;
    workEmail: string;
    department?: string;
    designation?: string;
  };
  jobRoleSkillsRating?: AppraisalRating;
  jobRoleSkillsComments?: string;
  workQualityRating?: AppraisalRating;
  workQualityComments?: string;
  overallRating?: AppraisalRating;
  overallComments?: string;
  achievements?: string;
  areasForImprovement?: string;
  employeeChallenges?: string;
  employeeImprovePlan?: string;
  adminReviewSummary?: string;
  adminVerificationNotes?: string;
  employeeFeedback?: string;
  finalAgreements?: string;
  goals: Array<{ title: string; metric?: string; targetDate?: string }>;
  developmentPlans: Array<{
    goal: string;
    activities: string;
    timeline?: string;
    resources?: string;
  }>;
};

type AdminReview = {
  jobRoleSkillsRating?: AppraisalRating;
  jobRoleSkillsComments?: string;
  workQualityRating?: AppraisalRating;
  workQualityComments?: string;
  overallRating?: AppraisalRating;
  overallComments?: string;
  adminReviewSummary?: string;
  adminVerificationNotes?: string;
};

type CreateCycleForm = {
  name: string;
  periodStart: string;
  periodEnd: string;
  ratingSystem: string;
};

const ratingOptions: RatingOption[] = [
  { label: "Below expectations", value: "BELOW_EXPECTATIONS" },
  { label: "Meets expectations", value: "MEETS_EXPECTATIONS" },
  { label: "Exceeds expectations", value: "EXCEEDS_EXPECTATIONS" },
];

function getErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(message)) return message[0] || fallback;
  return message || fallback;
}

function formatRating(value?: AppraisalRating) {
  if (!value) return "-";
  return value.replaceAll("_", " ");
}

export default function PerformanceAdminPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AppraisalDetail | null>(null);
  const [reviewForm, setReviewForm] = useState<AdminReview>({});
  const [actionBusy, setActionBusy] = useState(false);
  const [showCreateCycle, setShowCreateCycle] = useState(false);
  const [creatingCycle, setCreatingCycle] = useState(false);
  const [createCycleForm, setCreateCycleForm] = useState<CreateCycleForm>({
    name: "",
    periodStart: "",
    periodEnd: "",
    ratingSystem: "",
  });

  const filteredLabel = useMemo(() => {
    const parts = [] as string[];
    if (selectedCycleId) {
      const cycle = cycles.find((item) => item.id === selectedCycleId);
      if (cycle) parts.push(cycle.name);
    }
    if (selectedStatus) parts.push(selectedStatus.replaceAll("_", " "));
    return parts.length > 0 ? parts.join(" | ") : "All";
  }, [cycles, selectedCycleId, selectedStatus]);

  const loadCycles = useCallback(async () => {
    const response = await api.get("/performance/admin/cycles");
    const data = response.data?.data || [];
    setCycles(data);
  }, []);

  const loadQueue = useCallback(async () => {
    const response = await api.get("/performance/admin/queue", {
      params: {
        cycleId: selectedCycleId || undefined,
        status: selectedStatus || undefined,
        search: search || undefined,
      },
    });
    setQueue(response.data?.data || []);
  }, [search, selectedCycleId, selectedStatus]);

  const loadDetail = async (id: string) => {
    const response = await api.get(`/performance/admin/${id}`);
    const item: AppraisalDetail = response.data;
    setDetail(item);
    setReviewForm({
      jobRoleSkillsRating: item.jobRoleSkillsRating,
      jobRoleSkillsComments: item.jobRoleSkillsComments,
      workQualityRating: item.workQualityRating,
      workQualityComments: item.workQualityComments,
      overallRating: item.overallRating,
      overallComments: item.overallComments,
      adminReviewSummary: item.adminReviewSummary,
      adminVerificationNotes: item.adminVerificationNotes,
    });
  };

  const init = useCallback(async () => {
    try {
      setLoading(true);
      await loadCycles();
      await loadQueue();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to load performance queue"));
    } finally {
      setLoading(false);
    }
  }, [loadCycles, loadQueue]);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    const refresh = async () => {
      try {
        setLoading(true);
        await loadQueue();
      } catch (error) {
        alert(getErrorMessage(error, "Failed to refresh queue"));
      } finally {
        setLoading(false);
      }
    };

    void refresh();
  }, [loadQueue]);

  const openDetail = async (id: string) => {
    try {
      setActionBusy(true);
      setSelectedId(id);
      await loadDetail(id);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to load appraisal details"));
    } finally {
      setActionBusy(false);
    }
  };

  const saveReview = async () => {
    if (!selectedId) return;

    try {
      setActionBusy(true);
      await api.patch(`/performance/admin/${selectedId}/review`, reviewForm);
      await loadQueue();
      await loadDetail(selectedId);
      alert("Review updated successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to update review"));
    } finally {
      setActionBusy(false);
    }
  };

  const verify = async () => {
    if (!selectedId) return;

    try {
      setActionBusy(true);
      await api.patch(`/performance/admin/${selectedId}/verify`, {
        notes: reviewForm.adminVerificationNotes || "Verified by admin",
      });
      await loadQueue();
      await loadDetail(selectedId);
      alert("Appraisal verified successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to verify appraisal"));
    } finally {
      setActionBusy(false);
    }
  };

  const reopen = async () => {
    if (!selectedId) return;
    const notes = prompt("Reason to reopen this appraisal");

    if (notes === null) {
      return;
    }

    try {
      setActionBusy(true);
      await api.patch(`/performance/admin/${selectedId}/reopen`, { notes });
      await loadQueue();
      await loadDetail(selectedId);
      alert("Appraisal reopened successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to reopen appraisal"));
    } finally {
      setActionBusy(false);
    }
  };

  const close = async () => {
    if (!selectedId) return;

    try {
      setActionBusy(true);
      await api.patch(`/performance/admin/${selectedId}/close`, {
        notes: "Closed by admin",
      });
      await loadQueue();
      await loadDetail(selectedId);
      alert("Appraisal closed successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to close appraisal"));
    } finally {
      setActionBusy(false);
    }
  };

  const createCycle = async () => {
    if (!createCycleForm.name.trim()) {
      alert("Cycle name is required");
      return;
    }

    if (!createCycleForm.periodStart || !createCycleForm.periodEnd) {
      alert("Cycle start and end dates are required");
      return;
    }

    if (new Date(createCycleForm.periodStart) >= new Date(createCycleForm.periodEnd)) {
      alert("Cycle start date must be before end date");
      return;
    }

    try {
      setCreatingCycle(true);
      const response = await api.post("/performance/admin/cycles", {
        name: createCycleForm.name.trim(),
        periodStart: createCycleForm.periodStart,
        periodEnd: createCycleForm.periodEnd,
        ratingSystem: createCycleForm.ratingSystem.trim() || undefined,
        isActive: true,
      });

      const createdCycleId = response.data?.data?.id as string | undefined;

      await loadCycles();
      await loadQueue();

      if (createdCycleId) {
        setSelectedCycleId(createdCycleId);
      }

      setShowCreateCycle(false);
      setCreateCycleForm({
        name: "",
        periodStart: "",
        periodEnd: "",
        ratingSystem: "",
      });

      alert("Appraisal cycle created successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to create appraisal cycle"));
    } finally {
      setCreatingCycle(false);
    }
  };

  return (
    <main className="min-h-screen space-y-6 bg-(--background) p-2 text-(--text-primary)">
      <section className="rounded-xl border border-(--border-color) bg-(--card-bg) p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="h-6 w-6 text-blue-600" /> Performance Review Queue
          </h1>
          <div className="inline-flex items-center gap-2">
            <Link
              href="/performance/cycles"
              className="rounded-lg border border-(--border-color) px-3 py-1.5 text-xs"
            >
              Manage Cycles
            </Link>
            <span className="text-xs text-(--text-muted)">Filter: {filteredLabel}</span>
            <button
              onClick={() => setShowCreateCycle((prev) => !prev)}
              className="rounded-lg border border-(--border-color) px-3 py-1.5 text-xs"
            >
              {showCreateCycle ? "Hide Create Cycle" : "Create Cycle"}
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            disabled={cycles.length === 0}
            className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
          >
            {cycles.length === 0 ? (
              <option value="">No cycles found</option>
            ) : (
              <>
                <option value="">All cycles</option>
                {cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </option>
                ))}
              </>
            )}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_REVIEW">In review</option>
            <option value="VERIFIED">Verified</option>
            <option value="FEEDBACK_SUBMITTED">Feedback submitted</option>
            <option value="REOPENED">Reopened</option>
            <option value="CLOSED">Closed</option>
          </select>

          <div className="md:col-span-2 flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee name or email"
              className="flex-1 rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
            />
            <button
              onClick={() => void loadQueue()}
              className="inline-flex items-center gap-2 rounded-lg border border-(--border-color) px-3 py-2 text-sm"
            >
              <Search className="h-4 w-4" /> Search
            </button>
          </div>
        </div>

        {cycles.length === 0 && (
          <p className="mt-3 text-xs text-(--text-muted)">
            No appraisal cycle exists yet. Create one to start employee appraisals.
          </p>
        )}

        {showCreateCycle && (
          <div className="mt-4 rounded-lg border border-(--border-color) bg-(--background) p-3">
            <p className="mb-3 text-sm font-semibold">Create Appraisal Cycle</p>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={createCycleForm.name}
                onChange={(e) =>
                  setCreateCycleForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Cycle name (e.g. FY 2026-27)"
                className="rounded-lg border border-(--border-color) bg-(--card-bg) px-3 py-2 text-sm"
              />
              <input
                value={createCycleForm.ratingSystem}
                onChange={(e) =>
                  setCreateCycleForm((prev) => ({ ...prev, ratingSystem: e.target.value }))
                }
                placeholder="Rating guide (optional)"
                className="rounded-lg border border-(--border-color) bg-(--card-bg) px-3 py-2 text-sm"
              />
              <div>
                <label htmlFor="cycle-start-date" className="mb-1 block text-xs text-(--text-muted)">Start date</label>
                <input
                  id="cycle-start-date"
                  type="date"
                  value={createCycleForm.periodStart}
                  onChange={(e) =>
                    setCreateCycleForm((prev) => ({ ...prev, periodStart: e.target.value }))
                  }
                  className="w-full rounded-lg border border-(--border-color) bg-(--card-bg) px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="cycle-end-date" className="mb-1 block text-xs text-(--text-muted)">End date</label>
                <input
                  id="cycle-end-date"
                  type="date"
                  value={createCycleForm.periodEnd}
                  onChange={(e) =>
                    setCreateCycleForm((prev) => ({ ...prev, periodEnd: e.target.value }))
                  }
                  className="w-full rounded-lg border border-(--border-color) bg-(--card-bg) px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateCycle(false)}
                className="rounded-lg border border-(--border-color) px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={createCycle}
                disabled={creatingCycle}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                {creatingCycle ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create Appraisal Cycle
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-(--border-color) bg-(--card-bg) p-4">
          <h2 className="mb-3 text-base font-semibold">Appraisal List</h2>

          {loading ? (
            <p className="inline-flex items-center gap-2 text-sm text-(--text-muted)">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading queue...
            </p>
          ) : queue.length === 0 ? (
            <p className="text-sm text-(--text-muted)">No appraisal records found for current filter.</p>
          ) : (
            <div className="space-y-2">
              {queue.map((item) => (
                <button
                  key={item.id}
                  onClick={() => void openDetail(item.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selectedId === item.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-(--border-color) bg-(--background)"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="font-semibold">
                      {item.employee.firstName} {item.employee.lastName}
                    </p>
                    <StatusChip status={item.status} />
                  </div>
                  <p className="text-xs text-(--text-muted)">{item.employee.workEmail}</p>
                  <p className="text-xs text-(--text-muted)">
                    {item.employee.department || "-"} | {item.cycle.name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-(--border-color) bg-(--card-bg) p-4">
          <h2 className="mb-3 inline-flex items-center gap-2 text-base font-semibold">
            <Eye className="h-4 w-4" /> Appraisal Detail
          </h2>

          {!detail ? (
            <p className="text-sm text-(--text-muted)">Select an appraisal to review.</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-(--border-color) bg-(--background) p-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">
                    {detail.employee.firstName} {detail.employee.lastName}
                  </p>
                  <StatusChip status={detail.status} />
                </div>
                <p>{detail.employee.workEmail}</p>
                <p className="text-(--text-muted) text-xs mt-1">
                  Designation: {detail.employee.designation || "-"} | Department: {detail.employee.department || "-"}
                </p>
                <p className="text-(--text-muted) text-xs mt-1">{detail.cycle.name}</p>
              </div>

              <div className="rounded-lg border border-(--border-color) bg-(--background) p-3 text-sm space-y-3">
                <p className="font-semibold">Ratings and Comments</p>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="rounded-md border border-(--border-color) bg-(--card-bg) p-2">
                    <p className="text-xs text-(--text-muted)">Job Role and Skills</p>
                    <p className="font-medium">{formatRating(detail.jobRoleSkillsRating)}</p>
                  </div>
                  <div className="rounded-md border border-(--border-color) bg-(--card-bg) p-2">
                    <p className="text-xs text-(--text-muted)">Work Quality</p>
                    <p className="font-medium">{formatRating(detail.workQualityRating)}</p>
                  </div>
                  <div className="rounded-md border border-(--border-color) bg-(--card-bg) p-2">
                    <p className="text-xs text-(--text-muted)">Overall Performance</p>
                    <p className="font-medium">{formatRating(detail.overallRating)}</p>
                  </div>
                </div>
                <p><strong>Job Role and Skills comments:</strong> {detail.jobRoleSkillsComments || "-"}</p>
                <p><strong>Work Quality comments:</strong> {detail.workQualityComments || "-"}</p>
                <p><strong>Overall comments:</strong> {detail.overallComments || "-"}</p>
              </div>

              <div className="rounded-lg border border-(--border-color) bg-(--background) p-3 text-sm space-y-2">
                <p className="font-semibold">Achievements and Improvement Summary</p>
                <p><strong>Achievements:</strong> {detail.achievements || "-"}</p>
                <p><strong>Areas for improvement:</strong> {detail.areasForImprovement || "-"}</p>
                <p><strong>Challenges:</strong> {detail.employeeChallenges || "-"}</p>
                <p><strong>Improvement plan:</strong> {detail.employeeImprovePlan || "-"}</p>
              </div>

              <div className="rounded-lg border border-(--border-color) bg-(--background) p-3 text-sm">
                <p className="font-semibold mb-2 inline-flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" /> Goals for Next Year
                </p>
                {detail.goals.length === 0 ? (
                  <p className="text-(--text-muted)">No goals added.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.goals.map((goal, index) => (
                      <li key={`g-${index}`} className="rounded-md border border-(--border-color) bg-(--card-bg) p-2">
                        <p><strong>Goal:</strong> {goal.title || "-"}</p>
                        <p><strong>Success metric:</strong> {goal.metric || "-"}</p>
                        <p><strong>Target date:</strong> {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "-"}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-lg border border-(--border-color) bg-(--background) p-3 text-sm">
                <p className="font-semibold mb-2">Development Plan</p>
                {detail.developmentPlans.length === 0 ? (
                  <p className="text-(--text-muted)">No development plan added.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.developmentPlans.map((plan, index) => (
                      <li key={`dp-${index}`} className="rounded-md border border-(--border-color) bg-(--card-bg) p-2">
                        <p><strong>Goal:</strong> {plan.goal || "-"}</p>
                        <p><strong>Activities:</strong> {plan.activities || "-"}</p>
                        <p><strong>Timeline:</strong> {plan.timeline || "-"}</p>
                        <p><strong>Resources:</strong> {plan.resources || "-"}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-lg border border-(--border-color) bg-(--background) p-3 space-y-3">
                <p className="font-semibold text-sm">Admin Review</p>

                <RatingBlock
                  name="overallRating"
                  value={reviewForm.overallRating}
                  options={ratingOptions}
                  onChange={(value) =>
                    setReviewForm((prev) => ({ ...prev, overallRating: value }))
                  }
                  className="grid gap-2 md:grid-cols-3 text-sm"
                />

                <textarea
                  value={reviewForm.adminReviewSummary || ""}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, adminReviewSummary: e.target.value }))
                  }
                  placeholder="Admin review summary"
                  rows={3}
                  className="w-full rounded-lg border border-(--border-color) bg-(--card-bg) px-3 py-2 text-sm"
                />

                <textarea
                  value={reviewForm.adminVerificationNotes || ""}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, adminVerificationNotes: e.target.value }))
                  }
                  placeholder="Verification notes"
                  rows={3}
                  className="w-full rounded-lg border border-(--border-color) bg-(--card-bg) px-3 py-2 text-sm"
                />

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    onClick={saveReview}
                    disabled={actionBusy}
                    className="inline-flex items-center gap-2 rounded-lg border border-(--border-color) px-3 py-2 text-sm"
                  >
                    {actionBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
                    Save Review
                  </button>
                  <button
                    onClick={verify}
                    disabled={actionBusy || detail.status !== "IN_REVIEW"}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/60 px-3 py-2 text-sm text-white disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Verify
                  </button>
                  <button
                    onClick={reopen}
                    disabled={actionBusy || detail.status === "REOPENED" || detail.status === "DRAFT"}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm text-white disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" /> Reopen
                  </button>
                  <button
                    onClick={close}
                    disabled={
                      actionBusy ||
                      !["FEEDBACK_SUBMITTED", "REOPENED"].includes(detail.status)
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm text-white disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" /> Close
                  </button>
                </div>
              </div>

              {detail.employeeFeedback && (
                <div className="rounded-lg border border-(--border-color) bg-(--background) p-3 text-sm space-y-2">
                  <p><strong>Employee feedback:</strong> {detail.employeeFeedback}</p>
                  <p><strong>Final agreements:</strong> {detail.finalAgreements || "-"}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

