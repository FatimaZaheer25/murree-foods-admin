"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCw, Search } from "lucide-react";
import { ApiError } from "@murree/shared/lib/api";
import { listAdminOrders } from "@/lib/admin";
import type { AdminOrder, AdminOrdersPage, AdminOrderTab } from "@murree/shared/types";
import OrderManageModal from "./OrderManageModal";
import { formatPrice, formatTime, statusColors } from "./orderFormat";

const POLL_MS = 30000; // har 30 second taaza list
const DASHBOARD_ROWS = 8;

const TABS: { key: AdminOrderTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const message = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

// Asli orders ki table. Dashboard par sirf taaza 8 (full = false); Orders tab par tabs, search aur pages
export default function LiveOrdersTable({ full = false }: { full?: boolean }) {
  const [tab, setTab] = useState<AdminOrderTab>("all");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminOrdersPage | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [managing, setManaging] = useState<AdminOrder | null>(null);

  // Likhna rukne ke thori der baad search (har harf par request nahi)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = () =>
      listAdminOrders({ status: tab, q: search || undefined, page })
        .then(
          (fresh) => {
            if (stopped) return;
            // Is page ke orders kisi aur tab mein chale gaye: aakhri maujood page par
            if (fresh.orders.length === 0 && page > fresh.totalPages) return setPage(fresh.totalPages);
            setData(fresh);
            setError("");
          },
          (e) => !stopped && setError(message(e))
        )
        .finally(() => {
          if (!stopped) timer = setTimeout(load, POLL_MS);
        });
    load();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [tab, search, page, reloadKey]);

  function changed(order: AdminOrder) {
    setManaging(order);
    setData((prev) => prev && { ...prev, orders: prev.orders.map((item) => (item.id === order.id ? order : item)) });
    setReloadKey((key) => key + 1); // ginti aur tabs bhi taaza
  }

  const orders = full ? (data?.orders ?? []) : (data?.orders.slice(0, DASHBOARD_ROWS) ?? []);
  const from = data ? (data.page - 1) * 20 + 1 : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-cream-100 px-5 py-4">
        <h3 className="font-display text-lg">Live orders</h3>
        {full ? (
          <button
            type="button"
            aria-label="Refresh orders"
            onClick={() => setReloadKey((key) => key + 1)}
            className="rounded-lg p-2 hover:bg-cream-50"
          >
            <RotateCw className="h-4 w-4 text-charcoal-400" />
          </button>
        ) : (
          <Link href="/orders" className="text-sm font-semibold text-forest-700 hover:underline">
            View all →
          </Link>
        )}
      </div>

      {full && (
        <div className="flex flex-col gap-3 border-b border-cream-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Order status" className="flex flex-wrap gap-1.5">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => {
                  setTab(key);
                  setPage(1);
                }}
                className={`min-h-9 rounded-lg px-3 text-sm font-semibold transition ${
                  tab === key ? "bg-forest-800 text-white" : "text-charcoal-600 hover:bg-cream-100"
                }`}
              >
                {label}
                {data && <span className="ml-1 text-xs opacity-70"> {data.counts[key]}</span>}
              </button>
            ))}
          </div>
          <label className="relative block sm:w-64">
            <span className="sr-only">Search orders</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-300" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order no., name or phone"
              className="h-10 w-full rounded-xl border border-cream-300 bg-cream-50 pl-9 pr-3 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
            />
          </label>
        </div>
      )}

      {error && (
        <p role="alert" className="border-b border-cream-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {/* Phone: har order ek card (table sideways scroll nahi) */}
      <ul className="divide-y divide-cream-100 md:hidden">
        {orders.length === 0 ? (
          <li className="px-5 py-10 text-center text-sm text-charcoal-400">
            {!data && !error ? "Loading orders…" : search ? "No orders match your search." : "No orders yet."}
          </li>
        ) : (
          orders.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => setManaging(order)}
                aria-label={`Manage ${order.id}`}
                className="block w-full px-5 py-4 text-left hover:bg-cream-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-charcoal">{order.id}</p>
                    <p className="text-xs text-charcoal-400">{formatTime(order.date)}</p>
                  </div>
                  <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-charcoal">
                  {order.customer} <span className="text-charcoal-400">· {order.location.split(" · ")[0]}</span>
                </p>
                <p className="mt-0.5 truncate text-sm text-charcoal-600">
                  {order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
                </p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-forest-800">{formatPrice(order.total)}</span>
                  <span className="text-xs text-charcoal-400">{order.rider ? `Rider: ${order.rider}` : "No rider yet"}</span>
                </div>
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-cream-50 text-xs uppercase tracking-wide text-charcoal-400">
            <tr>
              {["Order ID", "Customer", "Hotel", "Items", "Amount", "Status", "Rider", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-charcoal-400">
                  {!data && !error ? "Loading orders…" : search ? "No orders match your search." : "No orders yet."}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-cream-100">
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.id}</p>
                    <p className="text-xs text-charcoal-400">{formatTime(order.date)}</p>
                  </td>
                  <td className="px-4 py-3">{order.customer}</td>
                  {/* "Pine View Guest House · Room 8" se sirf hotel ka naam */}
                  <td className="px-4 py-3 text-charcoal-600">{order.location.split(" · ")[0]}</td>
                  <td className="max-w-[14rem] truncate px-4 py-3 text-charcoal-600" title={order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}>
                    {order.items.map((item) => item.name).join(", ")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  {/* Riders Module 6-7 mein */}
                  <td className="px-4 py-3 text-charcoal-600">{order.rider ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setManaging(order)}
                      className="text-xs font-semibold text-forest-700 hover:underline"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {full && data && data.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cream-100 px-5 py-3 text-sm text-charcoal-400">
          <span>
            Showing {from}–{from + data.orders.length - 1} of {data.total}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={data.page <= 1}
              onClick={() => setPage(data.page - 1)}
              className="min-h-9 rounded-lg border border-cream-300 px-3 font-semibold text-charcoal-600 hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={data.page >= data.totalPages}
              onClick={() => setPage(data.page + 1)}
              className="min-h-9 rounded-lg border border-cream-300 px-3 font-semibold text-charcoal-600 hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {managing && <OrderManageModal order={managing} onClose={() => setManaging(null)} onChanged={changed} />}
    </div>
  );
}
