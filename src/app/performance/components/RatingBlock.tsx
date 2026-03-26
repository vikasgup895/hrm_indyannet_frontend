import { AppraisalRating, RatingOption } from "./types";

type RatingBlockProps = {
  name: string;
  value?: AppraisalRating;
  options: RatingOption[];
  disabled?: boolean;
  onChange: (value: AppraisalRating) => void;
  className?: string;
};

export default function RatingBlock({
  name,
  value,
  options,
  disabled,
  onChange,
  className = "grid gap-3 md:grid-cols-3",
}: RatingBlockProps) {
  return (
    <div className={className}>
      {options.map((option) => (
        <label key={option.value} className="inline-flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            disabled={disabled}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
