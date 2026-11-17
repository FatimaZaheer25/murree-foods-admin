import type { LucideIcon } from "lucide-react";

// Panel ka number wala card (label, bara number, neeche chhoti line). icon: daayein kone mein (Rider panel)
export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-cream-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-300">{label}</p>
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-800">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-3xl text-charcoal">{value}</p>
      <p className="mt-auto pt-1 text-xs text-forest-600">{hint}</p>
    </div>
  );
}
