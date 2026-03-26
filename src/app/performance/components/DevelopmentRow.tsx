import { Trash2 } from "lucide-react";
import { DevelopmentInputRow } from "./types";

type DevelopmentRowProps = {
  row: DevelopmentInputRow;
  index: number;
  editable: boolean;
  canDelete: boolean;
  onChange: (index: number, key: keyof DevelopmentInputRow, value: string) => void;
  onDelete: (index: number) => void;
};

export default function DevelopmentRow({
  row,
  index,
  editable,
  canDelete,
  onChange,
  onDelete,
}: DevelopmentRowProps) {
  return (
    <div className="space-y-2">
      <div className="grid gap-2 md:grid-cols-4">
        <input
          value={row.goal}
          disabled={!editable}
          onChange={(e) => onChange(index, "goal", e.target.value)}
          placeholder="Goal"
          className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
        />
        <input
          value={row.activities}
          disabled={!editable}
          onChange={(e) => onChange(index, "activities", e.target.value)}
          placeholder="Development Activities"
          className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
        />
        <input
          value={row.timeline || ""}
          disabled={!editable}
          onChange={(e) => onChange(index, "timeline", e.target.value)}
          placeholder="Timeline"
          className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
        />
        <input
          value={row.resources || ""}
          disabled={!editable}
          onChange={(e) => onChange(index, "resources", e.target.value)}
          placeholder="Resources / Support"
          className="rounded-lg border border-(--border-color) bg-(--background) px-3 py-2 text-sm"
        />
      </div>
      {editable && canDelete && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            aria-label={`Delete development row ${index + 1}`}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Row
          </button>
        </div>
      )}
    </div>
  );
}
