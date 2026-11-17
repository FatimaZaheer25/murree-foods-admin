"use client";

import { useState } from "react";
import { Phone, X } from "lucide-react";
import { ApiError } from "@murree/shared/lib/api";
import { cancelAdminOrder, updateOrderStatus } from "@/lib/admin";
import type { AdminOrder } from "@murree/shared/types";
import { formatPrice, formatTime, statusColors } from "./orderFormat";
import RiderAssign from "./RiderAssign";

// Status sirf aage jata hai. Beech ka qadam chhor sakte hain
const FLOW = ["Confirmed", "Preparing", "Out for Delivery", "Delivered"] as const;
type NextStatus = "Preparing" | "Out for Delivery" | "Delivered";

const REASON_MAX = 200;

// Raste mein / pahunch gaya: pehle rider chahiye (backend bhi yahi maangta hai)
const needsRider = (status: NextStatus) => status === "Out for Delivery" || status === "Delivered";

const message = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

type Props = {
  order: AdminOrder;
  onClose: () => void;
  onChanged: (order: AdminOrder) => void;
};

export default function OrderManageModal({ order, onClose, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");

  const position = FLOW.indexOf(order.status as (typeof FLOW)[number]);
  const isOpen = order.status !== "Delivered" && order.status !== "Cancelled";
  const nextStatuses = (isOpen ? FLOW.slice(position + 1) : []) as NextStatus[];

  async function run(action: () => Promise<{ order: AdminOrder }>) {
    setBusy(true);
    setError("");
    try {
      const { order: fresh } = await action();
      onChanged(fresh);
      setCancelling(false);
      setReason("");
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }

  function confirmCancel() {
    if (reason.trim().length < 5) {
      setError("Please write a reason (at least 5 characters).");
      return;
    }
    run(() => cancelAdminOrder(order.id, reason.trim()));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-order-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-cream-200 bg-white p-5 shadow-lift sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="manage-order-title" className="font-display text-xl text-charcoal">
              Order {order.id}
            </h3>
            <p className="mt-0.5 text-sm text-charcoal-400">Placed {formatTime(order.date)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
              {order.status}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex min-h-9 min-w-9 items-center justify-center rounded-lg text-charcoal-400 hover:bg-cream-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {order.status === "Cancelled" && order.cancelReason && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">{order.cancelledBy === "customer" ? "Cancelled by the customer." : "Cancel reason:"}</span>{" "}
            {order.cancelledBy === "customer" ? "" : order.cancelReason}
          </p>
        )}

        {/* Customer ki rating (deliver ke baad) */}
        {order.review && (
          <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">
              Customer rating: <span aria-label={`${order.review.stars} out of 5 stars`}>{"★".repeat(order.review.stars)}{"☆".repeat(5 - order.review.stars)}</span>
            </p>
            {order.review.comment && <p className="mt-1">&ldquo;{order.review.comment}&rdquo;</p>}
          </div>
        )}

        {/* Customer aur pata */}
        <div className="mt-4 rounded-xl bg-cream-50 p-4 text-sm">
          <p className="font-semibold text-charcoal">{order.customer}</p>
          <a href={`tel:${order.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-forest-700 hover:underline">
            <Phone className="h-3.5 w-3.5" />
            {order.phone}
          </a>
          <p className="mt-2 text-charcoal-600">{order.location}</p>
          {order.area && <p className="text-charcoal-400">{order.area}, Murree</p>}
          {order.instructions && (
            <p className="mt-2 text-charcoal-600">
              <span className="font-semibold">Note:</span> {order.instructions}
            </p>
          )}
        </div>

        <RiderAssign order={order} onChanged={onChanged} />

        {/* Dishes aur hisaab */}
        <ul className="mt-4 space-y-1.5 text-sm text-charcoal-600">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span>
                {item.quantity}× {item.name}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-cream-100 pt-3 text-sm text-charcoal-400">
          {order.subtotal !== undefined && (
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
          )}
          {order.deliveryFee !== undefined && (
            <div className="flex justify-between">
              <dt>Delivery fee</dt>
              <dd>{order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}</dd>
            </div>
          )}
          {order.serviceFee !== undefined && (
            <div className="flex justify-between">
              <dt>Service fee</dt>
              <dd>{formatPrice(order.serviceFee)}</dd>
            </div>
          )}
          <div className="flex justify-between font-semibold text-charcoal">
            <dt>Total ({order.paymentMethod})</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>

        {/* Kab kya hua */}
        <ol className="mt-4 space-y-1 text-xs text-charcoal-400">
          {order.history.map((step, i) => (
            <li key={i}>
              <span className="font-semibold text-charcoal-600">{step.status}</span> · {formatTime(step.at)}
            </li>
          ))}
        </ol>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {isOpen && !cancelling && (
          <div className="mt-5 border-t border-cream-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">Update status</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {nextStatuses.map((status, i) => (
                <button
                  key={status}
                  type="button"
                  disabled={busy || (needsRider(status) && !order.riderId)}
                  title={needsRider(status) && !order.riderId ? "Assign a rider first" : undefined}
                  onClick={() => run(() => updateOrderStatus(order.id, status))}
                  className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-60 ${
                    i === 0
                      ? "bg-forest-800 text-white hover:bg-forest-700"
                      : "border border-cream-300 bg-cream-50 text-charcoal-600 hover:bg-cream-100"
                  }`}
                >
                  {status}
                </button>
              ))}
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setCancelling(true);
                  setError("");
                }}
                className="min-h-11 rounded-xl px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-60"
              >
                Cancel order
              </button>
            </div>
            {!order.riderId && nextStatuses.some(needsRider) && (
              <p className="mt-2 text-xs text-charcoal-400">
                Assign a rider above (or let an online rider accept it) before it can go out for delivery.
              </p>
            )}
          </div>
        )}

        {isOpen && cancelling && (
          <div className="mt-5 border-t border-cream-100 pt-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-400">
                Reason (shown to the customer)
              </span>
              <textarea
                autoFocus
                value={reason}
                maxLength={REASON_MAX}
                rows={3}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError("");
                }}
                placeholder="e.g. Kitchen is closed due to a power outage."
                className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
              />
            </label>
            <p className="mt-1 text-right text-xs text-charcoal-400">
              {reason.length}/{REASON_MAX}
            </p>
            <div className="mt-2 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCancelling(false);
                  setError("");
                }}
                className="min-h-11 rounded-xl px-4 text-sm font-semibold text-charcoal-600 hover:bg-cream-100"
              >
                Keep order
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={confirmCancel}
                className="min-h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:pointer-events-none disabled:opacity-60"
              >
                Confirm cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
