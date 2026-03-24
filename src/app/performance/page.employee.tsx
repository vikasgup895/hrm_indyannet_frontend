"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  Save,
  Send,
  Target,
  Trash2,
} from "lucide-react";

type AppraisalStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "VERIFIED"
  | "FEEDBACK_SUBMITTED"
  | "CLOSED"
  | "REOPENED";

type AppraisalRating =
  | "BELOW_EXPECTATIONS"
  | "MEETS_EXPECTATIONS"
  | "EXCEEDS_EXPECTATIONS";

type CycleItem = {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  isActive: boolean;
  ratingSystem?: string;
  appraisal?: {
    id: string;
    status: AppraisalStatus;
    updatedAt: string;
  } | null;
};

type Goal = {
  title: string;
  metric?: string;
  targetDate?: string;
};

type DevPlan = {
  goal: string;
  activities: string;
  timeline?: string;
  resources?: string;
};

type FormState = {
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
  goals: Goal[];
  developmentPlans: DevPlan[];
  employeeFeedback?: string;
  finalAgreements?: string;
};

const ratingOptions: { label: string; value: AppraisalRating }[] = [
  { label: "Below expectations", value: "BELOW_EXPECTATIONS" },
  { label: "Meets expectations", value: "MEETS_EXPECTATIONS" },
  { label: "Exceeds expectations", value: "EXCEEDS_EXPECTATIONS" },
];

const statusTone: Record<AppraisalStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-amber-100 text-amber-800",
  IN_REVIEW: "bg-indigo-100 text-indigo-800",
  VERIFIED: "bg-emerald-100 text-emerald-800",
  FEEDBACK_SUBMITTED: "bg-cyan-100 text-cyan-800",
  CLOSED: "bg-zinc-200 text-zinc-800",
  REOPENED: "bg-rose-100 text-rose-800",
};

function getErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(message)) return message[0] || fallback;
  return message || fallback;
}

function StatusBadge({ status }: { status: AppraisalStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-(--border-color) bg-(--card-bg) p-4 md:p-6">
      <h3 className="mb-4 text-base font-semibold text-(--text-primary)">{title}</h3>
      {children}
    </section>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="w-full resize-y rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm text-(--text-primary)"
    />
  );
}

export default function PerformanceEmployeePage() {
  const [cycles, setCycles] = useState<CycleItem[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [appraisalId, setAppraisalId] = useState<string | null>(null);
  const [status, setStatus] = useState<AppraisalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackBusy, setFeedbackBusy] = useState(false);

  const [form, setForm] = useState<FormState>({
    goals: [{ title: "", metric: "", targetDate: "" }],
    developmentPlans: [{ goal: "", activities: "", timeline: "", resources: "" }],
  });

  const selectedCycle = useMemo(
    () => cycles.find((cycle) => cycle.id === selectedCycleId) || null,
    [cycles, selectedCycleId],
  );
  const hasCycles = cycles.length > 0;

  const isDraftEditable = status === "DRAFT" || status === "REOPENED" || status === null;
  const canSubmitDraft = !!appraisalId && (status === "DRAFT" || status === "REOPENED");
  const canSubmitFeedback = !!appraisalId && status === "VERIFIED";

  const loadCycles = async () => {
    const response = await api.get("/performance/my/cycles");
    const data: CycleItem[] = response.data?.data || [];
    setCycles(data);

    if (!selectedCycleId && data.length > 0) {
      const active = data.find((item) => item.isActive);
      setSelectedCycleId(active?.id || data[0].id);
    }
  };

  const loadCycleAppraisal = async (cycleId: string) => {
    const response = await api.get(`/performance/my/${cycleId}`);
    const appraisal = response.data?.appraisal;

    if (!appraisal) {
      setAppraisalId(null);
      setStatus(null);
      setForm({
        goals: [{ title: "", metric: "", targetDate: "" }],
        developmentPlans: [{ goal: "", activities: "", timeline: "", resources: "" }],
      });
      return;
    }

    setAppraisalId(appraisal.id);
    setStatus(appraisal.status);
    setForm({
      jobRoleSkillsRating: appraisal.jobRoleSkillsRating || undefined,
      jobRoleSkillsComments: appraisal.jobRoleSkillsComments || "",
      workQualityRating: appraisal.workQualityRating || undefined,
      workQualityComments: appraisal.workQualityComments || "",
      overallRating: appraisal.overallRating || undefined,
      overallComments: appraisal.overallComments || "",
      achievements: appraisal.achievements || "",
      areasForImprovement: appraisal.areasForImprovement || "",
      employeeChallenges: appraisal.employeeChallenges || "",
      employeeImprovePlan: appraisal.employeeImprovePlan || "",
      goals:
        appraisal.goals?.length > 0
          ? appraisal.goals.map((goal: any) => ({
              title: goal.title || "",
              metric: goal.metric || "",
              targetDate: goal.targetDate
                ? new Date(goal.targetDate).toISOString().slice(0, 10)
                : "",
            }))
          : [{ title: "", metric: "", targetDate: "" }],
      developmentPlans:
        appraisal.developmentPlans?.length > 0
          ? appraisal.developmentPlans.map((plan: any) => ({
              goal: plan.goal || "",
              activities: plan.activities || "",
              timeline: plan.timeline || "",
              resources: plan.resources || "",
            }))
          : [{ goal: "", activities: "", timeline: "", resources: "" }],
      employeeFeedback: appraisal.employeeFeedback || "",
      finalAgreements: appraisal.finalAgreements || "",
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await loadCycles();
      } catch (error) {
        alert(getErrorMessage(error, "Failed to load appraisal cycles"));
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []);

  useEffect(() => {
    if (!selectedCycleId) return;

    const load = async () => {
      try {
        setLoading(true);
        await loadCycleAppraisal(selectedCycleId);
      } catch (error) {
        alert(getErrorMessage(error, "Failed to load appraisal"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [selectedCycleId]);

  const saveDraft = async () => {
    if (!selectedCycleId) return;

    const payload = {
      ...form,
      goals: form.goals.filter((goal) => goal.title.trim().length > 0),
      developmentPlans: form.developmentPlans.filter(
        (plan) => plan.goal.trim().length > 0 && plan.activities.trim().length > 0,
      ),
    };

    try {
      setSaving(true);
      if (appraisalId) {
        await api.patch(`/performance/my/${appraisalId}/draft`, payload);
      } else {
        await api.post(`/performance/my/${selectedCycleId}/draft`, payload);
      }

      await loadCycles();
      await loadCycleAppraisal(selectedCycleId);
      alert("Draft saved successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to save draft"));
    } finally {
      setSaving(false);
    }
  };

  const submitDraft = async () => {
    if (!appraisalId) return;
    if (!confirm("Submit this appraisal to admin for review?")) return;

    try {
      setSaving(true);
      await api.post(`/performance/my/${appraisalId}/submit`);
      await loadCycles();
      if (selectedCycleId) await loadCycleAppraisal(selectedCycleId);
      alert("Appraisal submitted successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to submit appraisal"));
    } finally {
      setSaving(false);
    }
  };

  const submitFeedback = async () => {
    if (!appraisalId) return;

    try {
      setFeedbackBusy(true);
      await api.post(`/performance/my/${appraisalId}/feedback`, {
        employeeFeedback: form.employeeFeedback,
        finalAgreements: form.finalAgreements,
      });
      await loadCycles();
      if (selectedCycleId) await loadCycleAppraisal(selectedCycleId);
      alert("Feedback submitted successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to submit feedback"));
    } finally {
      setFeedbackBusy(false);
    }
  };

  const updateGoal = (index: number, key: keyof Goal, value: string) => {
    const next = [...form.goals];
    next[index] = { ...next[index], [key]: value };
    setForm((prev) => ({ ...prev, goals: next }));
  };

  const updatePlan = (index: number, key: keyof DevPlan, value: string) => {
    const next = [...form.developmentPlans];
    next[index] = { ...next[index], [key]: value };
    setForm((prev) => ({ ...prev, developmentPlans: next }));
  };

  const removeGoal = (index: number) => {
    setForm((prev) => ({
      ...prev,
      goals:
        prev.goals.length > 1
          ? prev.goals.filter((_, i) => i !== index)
          : [{ title: "", metric: "", targetDate: "" }],
    }));
  };

  const removePlan = (index: number) => {
    setForm((prev) => ({
      ...prev,
      developmentPlans:
        prev.developmentPlans.length > 1
          ? prev.developmentPlans.filter((_, i) => i !== index)
          : [{ goal: "", activities: "", timeline: "", resources: "" }],
    }));
  };

  if (loading && !selectedCycle) {
    return (
      <div className="p-8 text-(--text-muted) inline-flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading performance appraisal...
      </div>
    );
  }

  return (
    <main className="min-h-screen space-y-6 bg-(--background) p-2 text-(--text-primary)">
      <section className="rounded-xl border border-(--border-color) bg-(--card-bg) p-4 md:p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold">
            <ClipboardList className="h-6 w-6 text-blue-600" /> Annual Performance Appraisal
          </h1>
          {status && <StatusBadge status={status} />}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-(--text-muted)">Review Cycle</label>
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              disabled={!hasCycles}
              className="w-full rounded-lg border border-(--border-color) bg-(--background) px-3 py-2"
            >
              {!hasCycles ? (
                <option value="">No appraisal cycle available</option>
              ) : (
                cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </option>
                ))
              )}
            </select>
            {!hasCycles && (
              <p className="mt-2 text-xs text-(--text-muted)">
                Admin has not created an appraisal cycle yet.
              </p>
            )}
          </div>
          <div className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm">
            <p>
              Period: {selectedCycle ? new Date(selectedCycle.periodStart).toLocaleDateString() : "-"} - {" "}
              {selectedCycle ? new Date(selectedCycle.periodEnd).toLocaleDateString() : "-"}
            </p>
            <p className="text-xs text-(--text-muted) mt-1">
              {selectedCycle?.ratingSystem || "Rating: Below / Meets / Exceeds Expectations"}
            </p>
          </div>
        </div>
      </section>

      <SectionCard title="Job Role and Skills">
        <div className="grid gap-3 md:grid-cols-3">
          {ratingOptions.map((option) => (
            <label key={option.value} className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="jobRoleSkillsRating"
                checked={form.jobRoleSkillsRating === option.value}
                disabled={!isDraftEditable}
                onChange={() => setForm((prev) => ({ ...prev, jobRoleSkillsRating: option.value }))}
              />
              {option.label}
            </label>
          ))}
        </div>
        <div className="mt-3">
          <TextArea
            value={form.jobRoleSkillsComments}
            onChange={(value) => setForm((prev) => ({ ...prev, jobRoleSkillsComments: value }))}
            disabled={!isDraftEditable}
            placeholder="Application of skills, learning and upskilling"
          />
        </div>
      </SectionCard>

      <SectionCard title="Work Quality">
        <div className="grid gap-3 md:grid-cols-3">
          {ratingOptions.map((option) => (
            <label key={option.value} className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="workQualityRating"
                checked={form.workQualityRating === option.value}
                disabled={!isDraftEditable}
                onChange={() => setForm((prev) => ({ ...prev, workQualityRating: option.value }))}
              />
              {option.label}
            </label>
          ))}
        </div>
        <div className="mt-3">
          <TextArea
            value={form.workQualityComments}
            onChange={(value) => setForm((prev) => ({ ...prev, workQualityComments: value }))}
            disabled={!isDraftEditable}
            placeholder="Accuracy, consistency, and attention to detail"
          />
        </div>
      </SectionCard>

      <SectionCard title="Overall Performance">
        <div className="grid gap-3 md:grid-cols-3">
          {ratingOptions.map((option) => (
            <label key={option.value} className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="overallRating"
                checked={form.overallRating === option.value}
                disabled={!isDraftEditable}
                onChange={() => setForm((prev) => ({ ...prev, overallRating: option.value }))}
              />
              {option.label}
            </label>
          ))}
        </div>
        <div className="mt-3">
          <TextArea
            value={form.overallComments}
            onChange={(value) => setForm((prev) => ({ ...prev, overallComments: value }))}
            disabled={!isDraftEditable}
            placeholder="Deadlines, goals achieved, overall contribution"
          />
        </div>
      </SectionCard>

      <SectionCard title="Achievements">
        <TextArea
          value={form.achievements}
          onChange={(value) => setForm((prev) => ({ ...prev, achievements: value }))}
          disabled={!isDraftEditable}
          placeholder="Key projects, recognitions, significant accomplishments"
        />
      </SectionCard>

      <SectionCard title="Areas For Improvement">
        <TextArea
          value={form.areasForImprovement}
          onChange={(value) => setForm((prev) => ({ ...prev, areasForImprovement: value }))}
          disabled={!isDraftEditable}
          placeholder="Specific areas to improve"
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-(--text-muted)">Challenges faced</label>
            <TextArea
              value={form.employeeChallenges}
              onChange={(value) => setForm((prev) => ({ ...prev, employeeChallenges: value }))}
              disabled={!isDraftEditable}
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-(--text-muted)">Improvement plan</label>
            <TextArea
              value={form.employeeImprovePlan}
              onChange={(value) => setForm((prev) => ({ ...prev, employeeImprovePlan: value }))}
              disabled={!isDraftEditable}
              rows={3}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Goals For Next Year">
        <div className="space-y-3">
          {form.goals.map((goal, index) => (
            <div key={`goal-${index}`} className="space-y-2">
              <div className="grid gap-2 md:grid-cols-3">
                <input
                  value={goal.title}
                  disabled={!isDraftEditable}
                  onChange={(e) => updateGoal(index, "title", e.target.value)}
                  placeholder="Goal"
                  className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
                />
                <input
                  value={goal.metric || ""}
                  disabled={!isDraftEditable}
                  onChange={(e) => updateGoal(index, "metric", e.target.value)}
                  placeholder="Metric / Measure"
                  className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={goal.targetDate || ""}
                  disabled={!isDraftEditable}
                  onChange={(e) => updateGoal(index, "targetDate", e.target.value)}
                  className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
                />
              </div>
              {isDraftEditable && form.goals.length > 1 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeGoal(index)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    aria-label={`Delete goal row ${index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Row
                  </button>
                </div>
              )}
            </div>
          ))}
          {isDraftEditable && (
            <button
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  goals: [...prev.goals, { title: "", metric: "", targetDate: "" }],
                }))
              }
              className="text-sm font-medium text-blue-600"
            >
              + Add Goal
            </button>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Development Plan">
        <div className="space-y-3">
          {form.developmentPlans.map((plan, index) => (
            <div key={`plan-${index}`} className="space-y-2">
              <div className="grid gap-2 md:grid-cols-4">
                <input
                  value={plan.goal}
                  disabled={!isDraftEditable}
                  onChange={(e) => updatePlan(index, "goal", e.target.value)}
                  placeholder="Goal"
                  className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
                />
                <input
                  value={plan.activities}
                  disabled={!isDraftEditable}
                  onChange={(e) => updatePlan(index, "activities", e.target.value)}
                  placeholder="Development Activities"
                  className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
                />
                <input
                  value={plan.timeline || ""}
                  disabled={!isDraftEditable}
                  onChange={(e) => updatePlan(index, "timeline", e.target.value)}
                  placeholder="Timeline"
                  className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
                />
                <input
                  value={plan.resources || ""}
                  disabled={!isDraftEditable}
                  onChange={(e) => updatePlan(index, "resources", e.target.value)}
                  placeholder="Resources / Support"
                  className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
                />
              </div>
              {isDraftEditable && form.developmentPlans.length > 1 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removePlan(index)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    aria-label={`Delete development row ${index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Row
                  </button>
                </div>
              )}
            </div>
          ))}
          {isDraftEditable && (
            <button
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  developmentPlans: [
                    ...prev.developmentPlans,
                    { goal: "", activities: "", timeline: "", resources: "" },
                  ],
                }))
              }
              className="text-sm font-medium text-blue-600"
            >
              + Add Development Row
            </button>
          )}
        </div>
      </SectionCard>

      {canSubmitFeedback && (
        <SectionCard title="Final Feedback After Admin Review">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-(--text-muted)">Your feedback</label>
              <TextArea
                value={form.employeeFeedback}
                onChange={(value) => setForm((prev) => ({ ...prev, employeeFeedback: value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-(--text-muted)">Final agreements</label>
              <TextArea
                value={form.finalAgreements}
                onChange={(value) => setForm((prev) => ({ ...prev, finalAgreements: value }))}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={submitFeedback}
              disabled={feedbackBusy}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {feedbackBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Submit Feedback
            </button>
          </div>
        </SectionCard>
      )}

      <section className="sticky bottom-3 z-10 rounded-xl border border-(--border-color) bg-(--card-bg) p-3 shadow-md">
        <div className="flex flex-wrap justify-end gap-2">
          <button
            onClick={saveDraft}
            disabled={!selectedCycleId || !isDraftEditable || saving}
            className="inline-flex items-center gap-2 rounded-lg border border-(--border-color) px-4 py-2 text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </button>

          <button
            onClick={submitDraft}
            disabled={!canSubmitDraft || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Submit To Admin
          </button>

          <div className="inline-flex items-center gap-2 rounded-lg bg-(--background) px-3 py-2 text-xs text-(--text-muted)">
            <Target className="h-4 w-4" />
            {status ? `Current status: ${status.replaceAll("_", " ")}` : "Not submitted yet"}
          </div>
        </div>
      </section>
    </main>
  );
}

