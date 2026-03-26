import { AppraisalStatus } from "./types";

const statusTone: Record<AppraisalStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-amber-100 text-amber-800",
  IN_REVIEW: "bg-indigo-100 text-indigo-800",
  VERIFIED: "bg-emerald-100 text-emerald-800",
  FEEDBACK_SUBMITTED: "bg-cyan-100 text-cyan-800",
  CLOSED: "bg-zinc-200 text-zinc-800",
  REOPENED: "bg-rose-100 text-rose-800",
};

export default function StatusChip({ status }: { status: AppraisalStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
