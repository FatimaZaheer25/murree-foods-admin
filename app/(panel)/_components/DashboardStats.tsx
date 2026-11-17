"use client";

import { useEffect, useState } from "react";
import StatCard from "@murree/shared/components/ui/StatCard";
import { ApiError } from "@murree/shared/lib/api";
import { getDashboardStats } from "@/lib/admin";
import type { DashboardStats as Stats } from "@murree/shared/types";
import OrdersChart from "./OrdersChart";
import RevenueChart from "./RevenueChart";
import { formatPrice } from "./orderFormat";

const POLL_MS = 60000; // har minute taaza numbers

// "+18% vs yesterday" (asli farq)
function versusYesterday(today: number, yesterday: number) {
  if (yesterday === 0) return "No orders yesterday";
  const change = Math.round(((today - yesterday) / yesterday) * 100);
  if (change === 0) return "Same as yesterday";
  return `${change > 0 ? "+" : ""}${change}% vs yesterday`;
}

// Aaj ke numbers aur pichhle 7 din (Pakistan time). Revenue = deliver hue orders
export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = () =>
      getDashboardStats()
        .then(
          (fresh) => {
            if (stopped) return;
            setStats(fresh);
            setError("");
          },
          (e) => !stopped && setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.")
        )
        .finally(() => {
          if (!stopped) timer = setTimeout(load, POLL_MS);
        });
    load();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);

  const loading = "…";

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Orders"
          value={stats ? String(stats.today.orders) : loading}
          hint={stats ? versusYesterday(stats.today.orders, stats.yesterday.orders) : "Loading…"}
        />
        <StatCard
          label="Revenue Today"
          value={stats ? formatPrice(stats.today.revenue) : loading}
          hint={
            stats
              ? stats.active.amount
                ? `${formatPrice(stats.active.amount)} on the way`
                : `${stats.today.delivered} delivered today`
              : "Loading…"
          }
        />
        <StatCard label="Active Orders" value={stats ? String(stats.active.orders) : loading} hint="In kitchen or transit" />
        {/* Online: khud Online + 10 minute ke andar heartbeat */}
        <StatCard
          label="Active Riders"
          value={stats ? String(stats.riders.online) : loading}
          hint={stats ? `Online now · ${stats.riders.approved} approved` : "Loading…"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <OrdersChart data={stats?.week ?? []} />
        <RevenueChart data={stats?.week ?? []} />
      </div>
    </>
  );
}
