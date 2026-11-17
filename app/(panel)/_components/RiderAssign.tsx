"use client";

import { useEffect, useState } from "react";
import { Bike, Phone } from "lucide-react";
import { ApiError } from "@murree/shared/lib/api";
import { assignOrderRider, listRiderOptions } from "@/lib/admin";
import type { AdminOrder, RiderOption } from "@murree/shared/types";

const message = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

// Order Manage popup ka Rider hissa: kisi approved rider ko do, badlo, ya (delivery shuru hone se pehle) hatao
export default function RiderAssign({ order, onChanged }: { order: AdminOrder; onChanged: (order: AdminOrder) => void }) {
  const [options, setOptions] = useState<RiderOption[] | null>(null);
  const [choice, setChoice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const open = order.status === "Confirmed" || order.status === "Preparing" || order.status === "Out for Delivery";

  useEffect(() => {
    if (!open) return;
    listRiderOptions().then(
      (data) => setOptions(data.riders),
      (e) => setError(message(e))
    );
  }, [open, order.riderId]);

  async function save(riderId: string | null) {
    setBusy(true);
    setError("");
    setNote("");
    try {
      const result = await assignOrderRider(order.id, riderId);
      setNote(result.message);
      setChoice("");
      onChanged(result.order);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }

  const label = (rider: RiderOption) =>
    `${rider.name} · ${rider.vehicleType} · ${rider.online ? "Online" : "Offline"}${
      rider.activeOrder && rider.activeOrder !== order.id ? ` · busy (${rider.activeOrder})` : ""
    }`;

  return (
    <div className="mt-4 rounded-xl border border-cream-200 p-4 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">Rider</p>
      {order.rider ? (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 font-semibold text-charcoal">
            <Bike className="h-4 w-4 text-forest-700" />
            {order.rider}
            {order.riderVehicle && <span className="font-normal text-charcoal-400">· {order.riderVehicle}</span>}
          </span>
          {order.riderPhone && (
            <a href={`tel:${order.riderPhone}`} className="inline-flex items-center gap-1.5 text-forest-700 hover:underline">
              <Phone className="h-3.5 w-3.5" />
              {order.riderPhone}
            </a>
          )}
        </div>
      ) : (
        <p className="mt-2 text-charcoal-400">{open ? "No rider yet. Online riders can take it from Available Orders." : "—"}</p>
      )}

      {open && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select
            aria-label="Choose a rider"
            value={choice}
            onChange={(e) => {
              setChoice(e.target.value);
              setError("");
            }}
            disabled={!options || busy}
            className="h-10 min-w-0 flex-1 rounded-xl border border-cream-300 bg-cream-50 px-3 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
          >
            <option value="">{options ? (options.length ? "Choose a rider…" : "No approved riders") : "Loading riders…"}</option>
            {options?.map((rider) => (
              <option
                key={rider.id}
                value={rider.id}
                disabled={rider.id === order.riderId || (!!rider.activeOrder && rider.activeOrder !== order.id)}
              >
                {label(rider)}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!choice || busy}
            onClick={() => save(choice)}
            className="min-h-10 rounded-xl bg-forest-800 px-4 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-50"
          >
            {order.rider ? "Change rider" : "Assign"}
          </button>
          {order.rider && order.status !== "Out for Delivery" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => save(null)}
              className="min-h-10 rounded-xl px-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Remove rider
            </button>
          )}
        </div>
      )}
      {error && <p className="mt-2 font-medium text-red-600">{error}</p>}
      {note && !error && <p className="mt-2 font-medium text-forest-700">{note}</p>}
    </div>
  );
}
