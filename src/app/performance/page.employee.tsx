"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Save,
  Send,
  Target,
} from "lucide-react";
import StatusChip from "./components/StatusChip";
import RatingBlock from "./components/RatingBlock";
import GoalRow from "./components/GoalRow";
import DevelopmentRow from "./components/DevelopmentRow";
import {
  AppraisalRating,
  AppraisalStatus,
  DevelopmentInputRow,
  GoalInputRow,
  RatingOption,
} from "./components/types";

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
  goals: GoalInputRow[];
  developmentPlans: DevelopmentInputRow[];
  employeeFeedback?: string;
  finalAgreements?: string;
  adminReviewSummary?: string;
  adminVerificationNotes?: string;
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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-(--border-color) bg-(--card-bg) p-4 md:p-6 shadow-sm">
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
      className="w-full resize-y rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-80"
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

  const lifecycleSteps: AppraisalStatus[] = [
    "DRAFT",
    "SUBMITTED",
    "IN_REVIEW",
    "VERIFIED",
    "FEEDBACK_SUBMITTED",
    "CLOSED",
  ];

  const stepStatus = status === "REOPENED" || status === null ? "DRAFT" : status;
  const currentStepIndex = Math.max(0, lifecycleSteps.indexOf(stepStatus));

  const filledGoals = useMemo(
    () => form.goals.filter((goal) => goal.title.trim().length > 0).length,
    [form.goals],
  );

  const filledPlans = useMemo(
    () =>
      form.developmentPlans.filter(
        (plan) => plan.goal.trim().length > 0 && plan.activities.trim().length > 0,
      ).length,
    [form.developmentPlans],
  );

  const statusHelp = useMemo(() => {
    switch (status) {
      case "DRAFT":
      case null:
        return "Complete your self-review, save draft anytime, and submit when ready.";
      case "SUBMITTED":
        return "Submitted to admin. You can view progress while admin reviews.";
      case "IN_REVIEW":
        return "Admin is reviewing and adding evaluation notes.";
      case "VERIFIED":
        return "Admin review is complete. Please submit your final feedback.";
      case "FEEDBACK_SUBMITTED":
        return "Final feedback submitted. Awaiting formal closure.";
      case "REOPENED":
        return "Admin reopened this appraisal. Update details and resubmit.";
      case "CLOSED":
        return "This appraisal cycle is closed and read-only.";
      default:
        return "Track your appraisal lifecycle and complete required actions.";
    }
  }, [status]);

  const loadCycles = useCallback(async () => {
    const response = await api.get("/performance/my/cycles");
    const data: CycleItem[] = response.data?.data || [];
    setCycles(data);

    if (!selectedCycleId && data.length > 0) {
      const active = data.find((item) => item.isActive);
      setSelectedCycleId(active?.id || data[0].id);
    }
  }, [selectedCycleId]);

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
          ? appraisal.goals.map((goal: { title?: string; metric?: string; targetDate?: string }) => ({
              title: goal.title || "",
              metric: goal.metric || "",
              targetDate: goal.targetDate
                ? new Date(goal.targetDate).toISOString().slice(0, 10)
                : "",
            }))
          : [{ title: "", metric: "", targetDate: "" }],
      developmentPlans:
        appraisal.developmentPlans?.length > 0
          ? appraisal.developmentPlans.map((plan: { goal?: string; activities?: string; timeline?: string; resources?: string }) => ({
              goal: plan.goal || "",
              activities: plan.activities || "",
              timeline: plan.timeline || "",
              resources: plan.resources || "",
            }))
          : [{ goal: "", activities: "", timeline: "", resources: "" }],
      employeeFeedback: appraisal.employeeFeedback || "",
      finalAgreements: appraisal.finalAgreements || "",
      adminReviewSummary: appraisal.adminReviewSummary || "",
      adminVerificationNotes: appraisal.adminVerificationNotes || "",
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
  }, [loadCycles]);

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

  const updateGoal = (index: number, key: keyof GoalInputRow, value: string) => {
    const next = [...form.goals];
    next[index] = { ...next[index], [key]: value };
    setForm((prev) => ({ ...prev, goals: next }));
  };

  const updatePlan = (index: number, key: keyof DevelopmentInputRow, value: string) => {
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
          {status && <StatusChip status={status} />}
        </div>

        <div className="mb-4 rounded-lg border border-(--border-color) bg-(--background) px-3 py-3 text-sm text-(--text-primary)">
          <p className="font-medium">What to do now</p>
          <p className="mt-1 text-(--text-primary)">{statusHelp}</p>
        </div>

        <div className="mb-4 rounded-lg border border-(--border-color) bg-(--background) p-3">
          <p className="mb-2 text-xs font-semibold text-(--text-muted)">Appraisal Lifecycle</p>
          <div className="flex flex-wrap items-center gap-2">
            {lifecycleSteps.map((item, index) => {
              const isDone = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={item} className="inline-flex items-center gap-2">
                  <div
                    className={`rounded-lg border px-3 py-2 text-center text-xs font-medium ${
                      isCurrent
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : isDone
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-(--border-color) bg-(--card-bg) text-(--text-muted)"
                    }`}
                  >
                    {item.replaceAll("_", " ")}
                  </div>

                  {index < lifecycleSteps.length - 1 && (
                    <ArrowRight
                      className={`h-4 w-4 ${
                        index < currentStepIndex
                          ? "text-emerald-500"
                          : "text-(--text-muted)"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {status === "REOPENED" && (
            <p className="mt-2 text-xs text-amber-600">
              Reopened means this cycle returned to editable draft stage.
            </p>
          )}
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
            <p className="text-xs text-(--text-muted)">
              Last updated: {selectedCycle?.appraisal?.updatedAt
                ? new Date(selectedCycle.appraisal.updatedAt).toLocaleString()
                : "Not started"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm">
            <p className="text-xs text-(--text-muted)">Goals added</p>
            <p className="font-semibold">{filledGoals}</p>
          </div>
          <div className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm">
            <p className="text-xs text-(--text-muted)">Development plans</p>
            <p className="font-semibold">{filledPlans}</p>
          </div>
          <div className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm">
            <p className="text-xs text-(--text-muted)">Draft editable</p>
            <p className="font-semibold">{isDraftEditable ? "Yes" : "No"}</p>
          </div>
          <div className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm">
            <p className="text-xs text-(--text-muted)">Feedback required</p>
            <p className="font-semibold">{canSubmitFeedback ? "Yes" : "No"}</p>
          </div>
        </div>
      </section>

      <SectionCard title="Job Role and Skills">
        <RatingBlock
          name="jobRoleSkillsRating"
          value={form.jobRoleSkillsRating}
          options={ratingOptions}
          disabled={!isDraftEditable}
          onChange={(value) => setForm((prev) => ({ ...prev, jobRoleSkillsRating: value }))}
        />
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
        <RatingBlock
          name="workQualityRating"
          value={form.workQualityRating}
          options={ratingOptions}
          disabled={!isDraftEditable}
          onChange={(value) => setForm((prev) => ({ ...prev, workQualityRating: value }))}
        />
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
        <RatingBlock
          name="overallRating"
          value={form.overallRating}
          options={ratingOptions}
          disabled={!isDraftEditable}
          onChange={(value) => setForm((prev) => ({ ...prev, overallRating: value }))}
        />
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
            <GoalRow
              key={`goal-${index}`}
              row={goal}
              index={index}
              editable={isDraftEditable}
              canDelete={form.goals.length > 1}
              onChange={updateGoal}
              onDelete={removeGoal}
            />
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
            <DevelopmentRow
              key={`plan-${index}`}
              row={plan}
              index={index}
              editable={isDraftEditable}
              canDelete={form.developmentPlans.length > 1}
              onChange={updatePlan}
              onDelete={removePlan}
            />
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

      {(form.adminReviewSummary || form.adminVerificationNotes || ["IN_REVIEW", "VERIFIED", "FEEDBACK_SUBMITTED", "REOPENED", "CLOSED"].includes(status || "")) && (
        <SectionCard title="Admin Review and Verification">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-(--text-muted)">Admin review summary</label>
              <TextArea
                value={form.adminReviewSummary}
                onChange={() => {}}
                disabled
                rows={4}
                placeholder="Admin has not added a review summary yet"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-(--text-muted)">Verification notes</label>
              <TextArea
                value={form.adminVerificationNotes}
                onChange={() => {}}
                disabled
                rows={4}
                placeholder="Admin has not added verification notes yet"
              />
            </div>
          </div>
        </SectionCard>
      )}

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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg bg-(--background) px-3 py-2 text-xs text-(--text-muted)">
            <Target className="h-4 w-4" />
            {status ? `Current status: ${status.replaceAll("_", " ")}` : "Not submitted yet"}
          </div>

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
          </div>
        </div>
      </section>
    </main>
  );
}

