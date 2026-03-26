import { Trash2 } from "lucide-react";
import { GoalInputRow } from "./types";

type GoalRowProps = {
  row: GoalInputRow;
  index: number;
  editable: boolean;
  canDelete: boolean;
  onChange: (index: number, key: keyof GoalInputRow, value: string) => void;
  onDelete: (index: number) => void;
};

export default function GoalRow({
  row,
  index,
  editable,
  canDelete,
  onChange,
  onDelete,
}: GoalRowProps) {
  return (
    <div className="space-y-2">
      <div className="grid gap-2 md:grid-cols-3">
        <input
          value={row.title}
          disabled={!editable}
          onChange={(e) => onChange(index, "title", e.target.value)}
          placeholder="Goal"
          className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
        />
        <input
          value={row.metric || ""}
          disabled={!editable}
          onChange={(e) => onChange(index, "metric", e.target.value)}
          placeholder="Metric / Measure"
          className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={row.targetDate || ""}
          disabled={!editable}
          onChange={(e) => onChange(index, "targetDate", e.target.value)}
          className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
        />
      </div>
      {editable && canDelete && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            aria-label={`Delete goal row ${index + 1}`}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Row
          </button>
        </div>
      )}
    </div>
  );
}
