"use client";

import { useEffect, useState } from "react";
import StatCard from "@murree/shared/components/ui/StatCard";
import { ApiError } from "@murree/shared/lib/api";
import { getPayments } from "@/lib/admin";
import type { PaymentsRange, PaymentsReport } from "@murree/shared/types";
import Pager from "@murree/shared/components/ui/Pager";
import { formatPrice, formatTime } from "./orderFormat";

const RANGES: { key: PaymentsRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
];

const orders = (count: number) => `${count} order${count === 1 ? "" : "s"}`;

// Sirf Cash on Delivery: paisa tab aata hai jab order deliver ho
export default function PaymentsView() {
  const [range, setRange] = useState<PaymentsRange>("today");
  const [page, setPage] = useState(1);
  const [report, setReport] = useState<PaymentsReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stopped = false;
    getPayments({ range, page }).then(
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
  }, [range, page]);

  const shown = report && report.range === range ? report : null;
  const s = shown?.summary;
  const loading = "…";

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Period" className="flex flex-wrap gap-1.5">
        {RANGES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={range === key}
            onClick={() => {
              setRange(key);
              setPage(1);
            }}
            className={`min-h-9 rounded-lg px-3 text-sm font-semibold transition ${
              range === key ? "bg-forest-800 text-white" : "text-charcoal-600 hover:bg-cream-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Cash Collected" value={s ? formatPrice(s.collected.amount) : loading} hint={s ? `${orders(s.collected.count)} delivered` : "Loading…"} />
        <StatCard label="Cash Pending" value={s ? formatPrice(s.pending.amount) : loading} hint={s ? `${orders(s.pending.count)} on the way (right now)` : "Loading…"} />
        <StatCard label="Cancelled" value={s ? formatPrice(s.cancelled.amount) : loading} hint={s ? `${orders(s.cancelled.count)} · not collected` : "Loading…"} />
      </div>

      {/* Har rider ka hisaab: kamai (deliver ke waqt ki raqam) aur cash jo us ke paas aaya. "Mark as paid" abhi nahi */}
      <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft">
        <div className="border-b border-cream-100 px-5 py-4">
          <h3 className="font-display text-lg">Rider payouts</h3>
          <p className="text-sm text-charcoal-400">What each rider earned and the cash they collected in this period.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-cream-50 text-xs uppercase tracking-wide text-charcoal-400">
              <tr>
                {["Rider", "Deliveries", "Earned", "Cash collected"].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!shown || shown.riders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-charcoal-400">
                    {shown ? "No rider deliveries in this period." : error ? "" : "Loading…"}
                  </td>
                </tr>
              ) : (
                shown.riders.map((rider) => (
                  <tr key={rider.id} className="border-t border-cream-100">
                    <td className="px-4 py-3 font-medium">{rider.name}</td>
                    <td className="px-4 py-3">{rider.deliveries}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatPrice(rider.earnings)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatPrice(rider.cash)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft">
        <div className="border-b border-cream-100 px-5 py-4">
          <h3 className="font-display text-lg">Payments</h3>
          <p className="text-sm text-charcoal-400">One line per delivered order.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-cream-50 text-xs uppercase tracking-wide text-charcoal-400">
              <tr>
                {["Delivered", "Order ID", "Customer", "Rider", "Amount", "Method"].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!shown || shown.payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-charcoal-400">
                    {shown ? "No payments in this period." : error ? "" : "Loading payments…"}
                  </td>
                </tr>
              ) : (
                shown.payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-cream-100">
                    <td className="whitespace-nowrap px-4 py-3 text-charcoal-600">{formatTime(payment.date)}</td>
                    <td className="px-4 py-3 font-medium">{payment.id}</td>
                    <td className="px-4 py-3">{payment.customer}</td>
                    <td className="px-4 py-3 text-charcoal-600">{payment.rider ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatPrice(payment.amount)}</td>
                    <td className="px-4 py-3">
                      <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {payment.method}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {shown && <Pager page={shown.page} totalPages={shown.totalPages} total={shown.total} shown={shown.payments.length} onPage={setPage} />}
      </div>
    </div>
  );
}
