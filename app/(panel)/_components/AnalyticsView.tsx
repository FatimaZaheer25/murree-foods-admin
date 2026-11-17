"use client";

import { useEffect, useState } from "react";
import StatCard from "@murree/shared/components/ui/StatCard";
import { ApiError } from "@murree/shared/lib/api";
import { getAnalytics } from "@/lib/admin";
import type { AnalyticsReport } from "@murree/shared/types";
import OrdersChart from "./OrdersChart";
import RevenueChart from "./RevenueChart";
import { formatPrice } from "./orderFormat";

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

const cardClass = "overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft";
const headClass = "bg-cream-50 text-xs uppercase tracking-wide text-charcoal-400";

export default function AnalyticsView() {
  const [days, setDays] = useState<Range>(7);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stopped = false;
    getAnalytics(days).then(
      (fresh) => {
        if (stopped) return;
        setReport(fresh);
        setError("");
      },
      (e) => !stopped && setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.")
    );
    return () => {
      stopped = true;
    };
  }, [days]);

  // Purani range ka report naye button ke saath na dikhe
  const shown = report && report.days === days ? report : null;
  const t = shown?.totals;
  const loading = "…";

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Period" className="flex flex-wrap gap-1.5">
        {RANGES.map((range) => (
          <button
            key={range}
            type="button"
            role="tab"
            aria-selected={days === range}
            onClick={() => setDays(range)}
            className={`min-h-9 rounded-lg px-3 text-sm font-semibold transition ${
              days === range ? "bg-forest-800 text-white" : "text-charcoal-600 hover:bg-cream-100"
            }`}
          >
            Last {range} days
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders" value={t ? t.orders.toLocaleString("en-US") : loading} hint="Placed, not counting cancelled" />
        <StatCard label="Revenue" value={t ? formatPrice(t.revenue) : loading} hint={t ? `${t.delivered} delivered orders` : "Loading…"} />
        <StatCard label="Average Order" value={t ? formatPrice(t.averageOrder) : loading} hint="Per delivered order" />
        <StatCard label="Cancelled" value={t ? String(t.cancelled) : loading} hint={t ? `${t.cancelRate}% of placed orders` : "Loading…"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <OrdersChart data={shown?.daily ?? []} title="Orders per day" />
        <RevenueChart data={shown?.daily ?? []} title="Revenue per day" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <h3 className="border-b border-cream-100 px-5 py-4 font-display text-lg">Top 5 dishes</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead className={headClass}>
                <tr>
                  <th className="px-4 py-3 font-semibold">Dish</th>
                  <th className="px-4 py-3 font-semibold">Sold</th>
                  <th className="px-4 py-3 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {!shown || shown.topDishes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-charcoal-400">
                      {shown ? "No delivered orders in this period." : "Loading…"}
                    </td>
                  </tr>
                ) : (
                  shown.topDishes.map((dish, i) => (
                    <tr key={dish.slug} className="border-t border-cream-100">
                      <td className="px-4 py-3 font-medium">
                        <span className="mr-2 text-charcoal-300">{i + 1}.</span>
                        {dish.name}
                      </td>
                      <td className="px-4 py-3">{dish.quantity}</td>
                      <td className="whitespace-nowrap px-4 py-3">{formatPrice(dish.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={cardClass}>
          <h3 className="border-b border-cream-100 px-5 py-4 font-display text-lg">Orders by area</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead className={headClass}>
                <tr>
                  <th className="px-4 py-3 font-semibold">Area</th>
                  <th className="px-4 py-3 font-semibold">Orders</th>
                  <th className="px-4 py-3 font-semibold">Delivered value</th>
                </tr>
              </thead>
              <tbody>
                {!shown || shown.byArea.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-charcoal-400">
                      {shown ? "No orders in this period." : "Loading…"}
                    </td>
                  </tr>
                ) : (
                  shown.byArea.map((row) => (
                    <tr key={row.area} className="border-t border-cream-100">
                      <td className="px-4 py-3 font-medium">{row.area}</td>
                      <td className="px-4 py-3">{row.orders}</td>
                      <td className="whitespace-nowrap px-4 py-3">{formatPrice(row.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
