"use client";

import { useEffect, useState } from "react";
import { Bike, Mail, Pencil, Phone, Search, X } from "lucide-react";
import { isPhone } from "@murree/shared/data/validation";
import { ApiError } from "@murree/shared/lib/api";
import { changeRiderStatus, listRiders, type RiderAction, updateRider } from "@/lib/admin";
import type { AdminRider, AdminRidersPage, RiderStatus, VehicleType } from "@murree/shared/types";
import Pager from "@murree/shared/components/ui/Pager";
import { formatDate } from "./orderFormat";

const TABS: { key: RiderStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "suspended", label: "Suspended" },
  { key: "rejected", label: "Rejected" },
];

const statusColors: Record<RiderStatus, string> = {
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-emerald-50 text-emerald-700",
  suspended: "bg-red-50 text-red-700",
  rejected: "bg-cream-200 text-charcoal-400",
};

const VEHICLES: VehicleType[] = ["Bike", "Motorcycle", "Scooter", "Car"];
const REASON_MAX = 200;

const fieldClass =
  "h-11 w-full rounded-xl border border-cream-300 bg-cream-50 px-3 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-400";
const primary = "min-h-9 rounded-lg bg-forest-800 px-3 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-60";
const secondary = "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-charcoal-600 hover:bg-cream-100";
const danger = "min-h-9 rounded-lg px-3 text-sm font-semibold text-red-600 hover:bg-red-50";

const message = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

// Reject ya suspend: wajah likhni zaroori (rider ko dikhti hai)
type ReasonFor = { rider: AdminRider; action: "reject" | "suspend" };

export default function RidersManager() {
  const [tab, setTab] = useState<RiderStatus>("pending");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminRidersPage | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState("");
  const [reasonFor, setReasonFor] = useState<ReasonFor | null>(null);
  const [editing, setEditing] = useState<AdminRider | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let stopped = false;
    listRiders({ status: tab, q: search || undefined, page }).then(
      (fresh) => {
        if (stopped) return;
        if (fresh.riders.length === 0 && page > fresh.totalPages) return setPage(fresh.totalPages);
        setData(fresh);
        setError("");
      },
      (e) => !stopped && setError(message(e))
    );
    return () => {
      stopped = true;
    };
  }, [tab, search, page, reloadKey]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Action ke baad rider doosre tab mein chala jata hai: list aur ginti dobara
  async function act(rider: AdminRider, action: RiderAction, reason?: string) {
    setBusy(rider.id);
    setError("");
    try {
      const result = await changeRiderStatus(rider.id, action, reason);
      setNotice(`${rider.name}: ${result.message}`);
      setReasonFor(null);
      setReloadKey((key) => key + 1);
      return true;
    } catch (e) {
      setError(message(e));
      return false;
    } finally {
      setBusy("");
    }
  }

  const riders = data?.riders ?? [];
  const shownTab = TABS.find((t) => t.key === tab)!.label.toLowerCase();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Rider status" className="flex flex-wrap gap-1.5">
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
          <span className="sr-only">Search riders</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-300" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, email or phone"
            className="h-10 w-full rounded-xl border border-cream-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </p>
      )}

      {riders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-300 bg-white p-10 text-center text-sm text-charcoal-400">
          {!data && !error ? "Loading riders…" : search ? "No riders match your search." : `No ${shownTab} riders.`}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {riders.map((rider) => (
            <article key={rider.id} className="flex flex-col rounded-2xl border border-cream-200 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{rider.name}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusColors[rider.status]}`}>
                  {rider.status}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-sm text-charcoal-400">
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {rider.phone}
                </p>
                <p className="flex min-w-0 items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{rider.email}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Bike className="h-3.5 w-3.5 shrink-0" />
                  {rider.vehicleType} · {rider.registration}
                </p>
              </div>
              {rider.status === "approved" && (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
                  <span className={`h-2 w-2 rounded-full ${rider.online ? "bg-emerald-500" : "bg-cream-300"}`} />
                  <span className={rider.online ? "text-emerald-700" : "text-charcoal-400"}>{rider.online ? "Online" : "Offline"}</span>
                  {rider.activeOrder && <span className="font-normal text-charcoal-400">· delivering {rider.activeOrder}</span>}
                </p>
              )}
              <p className="mt-2 text-sm">
                {rider.deliveriesToday} deliveries today · ★ {rider.rating ?? "—"}
              </p>
              <p className="mt-1 text-xs text-charcoal-400">Joined {formatDate(rider.joined)}</p>
              {rider.reason && (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                  <span className="font-semibold">Reason:</span> {rider.reason}
                </p>
              )}

              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {(rider.status === "pending" || rider.status === "rejected") && (
                  <button type="button" disabled={busy === rider.id} onClick={() => act(rider, "approve")} className={primary}>
                    Approve
                  </button>
                )}
                {rider.status === "pending" && (
                  <button type="button" onClick={() => setReasonFor({ rider, action: "reject" })} className={danger}>
                    Reject
                  </button>
                )}
                {rider.status === "suspended" && (
                  <button type="button" disabled={busy === rider.id} onClick={() => act(rider, "reactivate")} className={primary}>
                    Reactivate
                  </button>
                )}
                {rider.status !== "pending" && (
                  <button type="button" onClick={() => setEditing(rider)} aria-label={`Edit ${rider.name}`} className={secondary}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}
                {rider.status === "approved" && (
                  <button type="button" onClick={() => setReasonFor({ rider, action: "suspend" })} className={danger}>
                    Suspend
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {data && data.total > 0 && (
        <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
          <Pager page={data.page} totalPages={data.totalPages} total={data.total} shown={data.riders.length} onPage={setPage} />
        </div>
      )}

      {reasonFor && (
        <ReasonDialog
          target={reasonFor}
          busy={busy === reasonFor.rider.id}
          onClose={() => setReasonFor(null)}
          onConfirm={(reason) => act(reasonFor.rider, reasonFor.action, reason)}
        />
      )}

      {editing && (
        <EditRiderDialog
          rider={editing}
          onClose={() => setEditing(null)}
          onSaved={(rider) => {
            setEditing(null);
            setNotice(`${rider.name}: Rider updated.`);
            setReloadKey((key) => key + 1);
          }}
        />
      )}
    </div>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-cream-200 bg-white p-5 shadow-lift sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-charcoal">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex min-h-9 min-w-9 items-center justify-center rounded-lg text-charcoal-400 hover:bg-cream-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ReasonDialog({
  target,
  busy,
  onClose,
  onConfirm,
}: {
  target: ReasonFor;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<boolean>;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const verb = target.action === "reject" ? "Reject" : "Suspend";

  function confirm() {
    if (reason.trim().length < 5) {
      setError("Please write a reason (at least 5 characters).");
      return;
    }
    onConfirm(reason.trim());
  }

  return (
    <Dialog title={`${verb} ${target.rider.name}`} onClose={onClose}>
      <p className="mt-2 text-sm text-charcoal-600">
        {target.action === "reject"
          ? "The rider will see this reason and get an email. You can still approve them later."
          : "The rider will see this reason and cannot use the panel until you reactivate them."}
      </p>
      <label className="mt-4 block">
        <span className={labelClass}>Reason (shown to the rider)</span>
        <textarea
          autoFocus
          value={reason}
          maxLength={REASON_MAX}
          rows={3}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
        />
      </label>
      <p className="mt-1 text-right text-xs text-charcoal-400">
        {reason.length}/{REASON_MAX}
      </p>
      {error && <p className="mt-1 text-sm font-medium text-red-600">{error}</p>}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onClose} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-charcoal-600 hover:bg-cream-100">
          Cancel
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={confirm}
          className="min-h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {verb} rider
        </button>
      </div>
    </Dialog>
  );
}

function EditRiderDialog({ rider, onClose, onSaved }: { rider: AdminRider; onClose: () => void; onSaved: (rider: AdminRider) => void }) {
  const [form, setForm] = useState({ name: rider.name, phone: rider.phone, vehicleType: rider.vehicleType, registration: rider.registration });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Full name is required.");
    if (!isPhone(form.phone)) return setError("Enter a valid phone number, e.g. 0300-1234567.");
    if (!/^[A-Za-z0-9][A-Za-z0-9 -]{1,19}$/.test(form.registration.trim()))
      return setError("Use letters, numbers and dashes only, e.g. LEA-2041.");
    setSaving(true);
    setError("");
    try {
      const result = await updateRider(rider.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        vehicleType: form.vehicleType,
        registration: form.registration.trim(),
      });
      onSaved(result.rider);
    } catch (err) {
      setError(message(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title="Edit Rider" onClose={onClose}>
      <form onSubmit={save} noValidate className="mt-4 space-y-3">
        <label className="block">
          <span className={labelClass}>Full Name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Phone</span>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={fieldClass} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Vehicle</span>
            <select
              value={form.vehicleType}
              onChange={(e) => setForm({ ...form, vehicleType: e.target.value as VehicleType })}
              className={fieldClass}
            >
              {VEHICLES.map((vehicle) => (
                <option key={vehicle} value={vehicle}>
                  {vehicle}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Registration</span>
            <input value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value })} className={fieldClass} />
          </label>
        </div>
        <p className="text-xs text-charcoal-400">Email can&apos;t be changed here: {rider.email}</p>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-charcoal-600 hover:bg-cream-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-xl bg-forest-800 px-4 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
