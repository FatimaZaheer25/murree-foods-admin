import type { DayStats } from "@murree/shared/types";
import { dayLabel, formatPrice, showLabel } from "./orderFormat";

// Har din ka revenue (SVG line + halka rang neeche). Revenue = us din deliver hue orders
export default function RevenueChart({ data, title = "Revenue trend" }: { data: DayStats[]; title?: string }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const step = data.length > 1 ? 100 / (data.length - 1) : 0;

  // 100x100 ke dabbe mein har din ka point (sab se bara 85% unchai tak)
  const points = data.map((d, i) => `${i * step},${100 - (d.revenue / max) * 85}`).join(" ");

  return (
    <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-soft">
      <h3 className="font-display text-lg">{title}</h3>
      <p className="text-sm text-charcoal-400">Delivered total {formatPrice(total)}</p>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-4 h-40 w-full" role="img" aria-label={`Revenue: ${formatPrice(total)} in ${data.length} days`}>
        <polyline fill="none" stroke="#2d6a4f" strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
        <polyline fill="rgba(45,106,79,0.12)" stroke="none" points={`0,100 ${points} 100,100`} />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] font-medium text-charcoal-400">
        {data.map((d, i) =>
          showLabel(i, data.length) ? (
            <span key={d.date} title={`${dayLabel(d.date, false)}: ${formatPrice(d.revenue)}`}>
              {dayLabel(d.date, data.length <= 7)}
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}
