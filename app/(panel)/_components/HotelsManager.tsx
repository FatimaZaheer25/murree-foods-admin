"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { ApiError } from "@murree/shared/lib/api";
import { createHotel, deleteHotel, getAdminSettings, listHotels, updateHotel } from "@/lib/admin";
import type { AdminHotel } from "@murree/shared/types";

type Status = "Active" | "Inactive";

const emptyForm = { name: "", area: "", landmark: "", status: "Active" as Status };

const fieldClass =
  "h-11 w-full rounded-xl border border-cream-300 bg-cream-50 px-3 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-400";

const message = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

export default function HotelsManager() {
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<AdminHotel | null>(null);

  useEffect(() => {
    Promise.all([listHotels(), getAdminSettings()])
      .then(([hotelData, settingsData]) => {
        setHotels(hotelData.hotels);
        setAreas(settingsData.settings.areas);
      })
      .catch((e) => setPageError(message(e)))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setForm({ ...emptyForm, area: areas[0] ?? "" });
    setAdding(true);
  };

  const closeAdd = () => {
    setAdding(false);
    setNameError("");
  };

  async function addHotel(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError("Hotel name is required.");
      return;
    }
    setSaving(true);
    try {
      const { hotel } = await createHotel({
        name: form.name.trim(),
        area: form.area,
        landmark: form.landmark.trim(),
        isActive: form.status === "Active",
      });
      setHotels((prev) => [...prev, hotel]);
      closeAdd();
    } catch (error) {
      setNameError(message(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(target: AdminHotel) {
    setPageError("");
    try {
      const { hotel } = await updateHotel(target.id, { isActive: !target.isActive });
      setHotels((prev) => prev.map((item) => (item.id === hotel.id ? hotel : item)));
    } catch (error) {
      setPageError(message(error));
    }
  }

  async function confirmRemove() {
    if (!removing) return;
    setSaving(true);
    setPageError("");
    try {
      await deleteHotel(removing.id);
      setHotels((prev) => prev.filter((hotel) => hotel.id !== removing.id));
      setRemoving(null);
    } catch (error) {
      setRemoving(null);
      setPageError(message(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-charcoal">Hotels</h2>
          <p className="mt-0.5 text-sm text-charcoal-400">
            Active hotels appear in the customer list within a minute.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-800 px-4 text-sm font-semibold text-white transition hover:bg-forest-700"
        >
          <Plus className="h-4 w-4" />
          Add Hotel
        </button>
      </div>

      {pageError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {pageError}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-cream-200 bg-white shadow-soft">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-cream-200 bg-cream-50 text-xs uppercase tracking-wider text-charcoal-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Hotel Name</th>
              <th className="px-4 py-3 font-semibold">Area / Location</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-charcoal-400">
                  {loading ? "Loading hotels…" : "No hotels yet. Add one to get started."}
                </td>
              </tr>
            ) : (
              hotels.map((hotel) => (
                <tr key={hotel.id} className="border-b border-cream-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-charcoal">{hotel.name}</p>
                    {hotel.landmark && <p className="mt-0.5 text-xs text-charcoal-400">{hotel.landmark}</p>}
                  </td>
                  <td className="px-4 py-3 text-charcoal-600">{hotel.area}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        hotel.isActive ? "bg-emerald-50 text-emerald-700" : "bg-cream-200 text-charcoal-400"
                      }`}
                    >
                      {hotel.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleStatus(hotel)}
                      className="inline-flex min-h-9 items-center rounded-lg px-2.5 text-sm font-medium text-charcoal-600 transition hover:bg-cream-100"
                    >
                      {hotel.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemoving(hotel)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Hotel form (popup) */}
      {adding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-4 sm:items-center">
          <button type="button" aria-label="Close" onClick={closeAdd} className="absolute inset-0" />
          <form
            onSubmit={addHotel}
            noValidate
            className="relative z-10 w-full max-w-md rounded-2xl border border-cream-200 bg-white p-5 shadow-lift sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl text-charcoal">Add Hotel</h3>
                <p className="mt-0.5 text-sm text-charcoal-400">Active hotels are shown to customers.</p>
              </div>
              <button
                type="button"
                onClick={closeAdd}
                aria-label="Close"
                className="flex min-h-9 min-w-9 items-center justify-center rounded-lg text-charcoal-400 hover:bg-cream-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className={labelClass}>Hotel Name</span>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    setNameError("");
                  }}
                  placeholder="e.g. Pine Crest Hotel"
                  aria-invalid={!!nameError}
                  className={`${fieldClass} ${nameError ? "border-red-400" : ""}`}
                />
                {nameError && <span className="mt-1.5 block text-xs font-medium text-red-600">{nameError}</span>}
              </label>
              <label className="block">
                <span className={labelClass}>Area / Location</span>
                <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className={fieldClass}>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Address / Landmark</span>
                <input
                  value={form.landmark}
                  onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  placeholder="Optional landmark or address"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Status</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                  className={fieldClass}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeAdd}
                className="min-h-11 rounded-xl px-4 text-sm font-semibold text-charcoal-600 hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 rounded-xl bg-forest-800 px-4 text-sm font-semibold text-white hover:bg-forest-700 disabled:pointer-events-none disabled:opacity-60"
              >
                Add Hotel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Remove ki tasdeeq */}
      {removing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-4 sm:items-center">
          <button type="button" aria-label="Close" onClick={() => setRemoving(null)} className="absolute inset-0" />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-cream-200 bg-white p-5 shadow-lift sm:p-6">
            <h3 className="font-display text-xl text-charcoal">Remove Hotel</h3>
            <p className="mt-2 text-sm text-charcoal-600">Are you sure you want to remove this hotel?</p>
            <p className="mt-1 text-sm font-medium text-charcoal">{removing.name}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemoving(null)}
                className="min-h-11 rounded-xl px-4 text-sm font-semibold text-charcoal-600 hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                disabled={saving}
                className="min-h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:pointer-events-none disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
