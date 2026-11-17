"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { ApiError } from "@murree/shared/lib/api";
import { listCustomers } from "@/lib/admin";
import type { AdminCustomer } from "@murree/shared/types";
import Pager from "@murree/shared/components/ui/Pager";
import { formatDate, formatPrice } from "./orderFormat";

type Page = { customers: AdminCustomer[]; total: number; page: number; totalPages: number };

// Verified customers (sirf dekhne ke liye). Orders = Cancelled ke bina, Spent = deliver hue orders
export default function CustomersTable() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let stopped = false;
    listCustomers({ q: search || undefined, page }).then(
      (fresh) => {
        if (stopped) return;
        setData(fresh);
        setError("");
      },
      (e) => !stopped && setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.")
    );
    return () => {
      stopped = true;
    };
  }, [search, page]);

  const customers = data?.customers ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-cream-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg">Customers</h3>
          <p className="text-sm text-charcoal-400">{data ? `${data.total} verified account${data.total === 1 ? "" : "s"}` : "Loading…"}</p>
        </div>
        <label className="relative block sm:w-64">
          <span className="sr-only">Search customers</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-300" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, email or phone"
            className="h-10 w-full rounded-xl border border-cream-300 bg-cream-50 pl-9 pr-3 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="border-b border-cream-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-cream-50 text-xs uppercase tracking-wide text-charcoal-400">
            <tr>
              {["Name", "Email", "Phone", "Orders", "Spent", "Last order", "Joined"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-charcoal-400">
                  {!data && !error ? "Loading customers…" : search ? "No customers match your search." : "No customers yet."}
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-t border-cream-100">
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3 text-charcoal-600">{customer.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">{customer.phone || "—"}</td>
                  <td className="px-4 py-3">{customer.orders}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatPrice(customer.spent)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-charcoal-600">{customer.lastOrder ? formatDate(customer.lastOrder) : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-charcoal-600">{formatDate(customer.joined)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && <Pager page={data.page} totalPages={data.totalPages} total={data.total} shown={customers.length} onPage={setPage} />}
    </div>
  );
}
