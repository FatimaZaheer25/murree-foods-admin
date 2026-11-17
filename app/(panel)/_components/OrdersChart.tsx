import type { DayStats } from "@murree/shared/types";
import { dayLabel, showLabel } from "./orderFormat";

// Har din ke orders ka bar chart (sirf CSS, koi library nahi)
export default function OrdersChart({ data, title = "Orders this week" }: { data: DayStats[]; title?: string }) {
  const max = Math.max(1, ...data.map((d) => d.orders));
  const total = data.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-soft">
      <h3 className="font-display text-lg">{title}</h3>
      <p className="text-sm text-charcoal-400">{total.toLocaleString("en-US")} orders</p>
      <div className={`mt-6 flex h-40 items-end ${data.length > 14 ? "gap-px sm:gap-0.5" : "gap-2 sm:gap-3"}`}>
        {data.map((d, i) => (
          <div key={d.date} className="flex h-full min-w-0 flex-1 flex-col items-center gap-2">
            {/* Bar ka dabba flex-1 hai, is liye % unchai sahi kaam karti hai */}
            <div className="relative w-full flex-1">
              <div
                className="absolute inset-x-0 bottom-0 rounded-t-lg bg-forest-700/90 transition hover:bg-accent"
                style={{ height: `${(d.orders / max) * 100}%`, minHeight: d.orders ? 2 : 0 }}
                title={`${dayLabel(d.date, false)}: ${d.orders} orders`}
              />
            </div>
            <span className="h-3 whitespace-nowrap text-[10px] font-medium text-charcoal-400">
              {showLabel(i, data.length) ? dayLabel(d.date, data.length <= 7) : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
