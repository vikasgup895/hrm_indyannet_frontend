"use client";

export default function PayrollCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="p-5 border border-[var(--border-color)] rounded-xl 
                 bg-[var(--card-bg)] shadow-sm hover:bg-[var(--border-color)]/20 
                 transition-all duration-300 flex items-center gap-3"
    >
      <div
        className="p-3 rounded-xl bg-blue-500/10 flex items-center justify-center 
                   text-blue-500"
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-[var(--text-muted)]">{title}</p>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          {value}
        </h3>
      </div>
    </div>
  );
}
