"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { ApiError } from "@murree/shared/lib/api";
import { getAdminSettings, updateAdminSettings } from "@/lib/admin";
import type { AdminSettings } from "@murree/shared/types";

const fieldClass =
  "h-11 w-full rounded-xl border border-cream-300 bg-cream-50 px-3 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-400";

type MoneyField = "deliveryFee" | "serviceFee" | "freeDeliveryThreshold" | "riderPayPerDelivery" | "minOrderAmount";

const moneyFields: { key: MoneyField; label: string; hint: string }[] = [
  { key: "deliveryFee", label: "Delivery Fee (Rs.)", hint: "Charged on orders below the free delivery limit." },
  { key: "serviceFee", label: "Service Fee (Rs.)", hint: "Added to every order." },
  { key: "freeDeliveryThreshold", label: "Free Delivery From (Rs.)", hint: "Orders at or above this pay no delivery fee." },
  { key: "riderPayPerDelivery", label: "Rider Pay per Delivery (Rs.)", hint: "Fixed amount a rider earns for each delivery." },
  { key: "minOrderAmount", label: "Minimum Order (Rs.)", hint: "Smallest food total a customer can order. 0 = no minimum." },
];

type ContactField = "contactWhatsapp" | "contactPhone" | "contactEmail" | "facebookUrl" | "instagramUrl";

// Help & Contact page aur footer par dikhte hain. Khali chhorein to woh option chhup jata hai
const contactFields: { key: ContactField; label: string; placeholder: string; type: string }[] = [
  { key: "contactWhatsapp", label: "WhatsApp Number", placeholder: "0300-1234567", type: "tel" },
  { key: "contactPhone", label: "Phone Number", placeholder: "051-1234567", type: "tel" },
  { key: "contactEmail", label: "Email", placeholder: "help@example.com", type: "email" },
  { key: "facebookUrl", label: "Facebook Page", placeholder: "https://facebook.com/yourpage", type: "url" },
  { key: "instagramUrl", label: "Instagram Page", placeholder: "https://instagram.com/yourpage", type: "url" },
];

const message = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

export default function SettingsForm() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loadError, setLoadError] = useState("");
  const [newArea, setNewArea] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);

  useEffect(() => {
    getAdminSettings().then(
      (data) => setSettings(data.settings),
      (e) => setLoadError(message(e))
    );
  }, []);

  if (loadError) return <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm font-medium text-red-700">{loadError}</p>;
  if (!settings) return <div className="h-96 animate-pulse rounded-2xl bg-cream-200" />;

  const change = (next: Partial<AdminSettings>) => {
    setSettings({ ...settings, ...next });
    setNotice(null);
  };

  function addArea() {
    const area = newArea.trim();
    if (!area || !settings) return;
    if (settings.areas.some((existing) => existing.toLowerCase() === area.toLowerCase())) {
      setNotice({ error: true, text: "This area is already in the list." });
      return;
    }
    change({ areas: [...settings.areas, area] });
    setNewArea("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setNotice(null);
    try {
      const data = await updateAdminSettings(settings);
      setSettings(data.settings);
      setNotice({ error: false, text: data.message });
    } catch (error) {
      setNotice({ error: true, text: message(error) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} noValidate className="space-y-6">
      {/* Orders lena: band/khula + roz ke auqaat (Pakistan time) */}
      <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-charcoal">Ordering</h2>
            <p className="mt-1 text-sm text-charcoal-400">
              Turn off to pause new orders (for example, kitchen closed). Customers see a message on Cart and Checkout.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.acceptingOrders}
            aria-label="Accepting orders"
            onClick={() => change({ acceptingOrders: !settings.acceptingOrders })}
            className="inline-flex min-h-11 items-center gap-3 rounded-full border border-cream-300 bg-white px-4 text-sm font-semibold text-charcoal hover:bg-cream-50"
          >
            <span className={`relative h-6 w-11 rounded-full transition ${settings.acceptingOrders ? "bg-emerald-500" : "bg-cream-300"}`}>
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  settings.acceptingOrders ? "left-[1.375rem]" : "left-0.5"
                }`}
              />
            </span>
            {settings.acceptingOrders ? "Taking orders" : "Orders paused"}
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Opens at</span>
            <input
              id="settings-open-time"
              type="time"
              value={settings.openTime}
              onChange={(e) => change({ openTime: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Closes at</span>
            <input
              id="settings-close-time"
              type="time"
              value={settings.closeTime}
              onChange={(e) => change({ closeTime: e.target.value })}
              className={fieldClass}
            />
          </label>
        </div>
        <p className="mt-1.5 text-xs text-charcoal-400">
          Pakistan time. Leave both empty to take orders all day. Late nights work too (for example 18:00 to 02:00).
          {(settings.openTime || settings.closeTime) && (
            <button
              type="button"
              onClick={() => change({ openTime: "", closeTime: "" })}
              className="ml-2 font-semibold text-forest-700 hover:underline"
            >
              Open all day
            </button>
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-soft sm:p-6">
        <h2 className="font-display text-xl text-charcoal">Fees &amp; Rider Pay</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {moneyFields.map(({ key, label, hint }) => (
            <label key={key} className="block">
              <span className={labelClass}>{label}</span>
              <input
                type="number"
                min={0}
                step={1}
                value={Number.isNaN(settings[key]) ? "" : settings[key]}
                onChange={(e) => change({ [key]: e.target.valueAsNumber })}
                className={fieldClass}
              />
              <span className="mt-1.5 block text-xs text-charcoal-400">{hint}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-soft sm:p-6">
        <h2 className="font-display text-xl text-charcoal">Contact Details</h2>
        <p className="mt-0.5 text-sm text-charcoal-400">
          Shown on the Help &amp; Contact page and in the footer. Leave a field empty to hide it. Changes appear on the site within a few minutes.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {contactFields.map(({ key, label, placeholder, type }) => (
            <label key={key} className="block">
              <span className={labelClass}>{label}</span>
              <input
                type={type}
                value={settings[key]}
                onChange={(e) => change({ [key]: e.target.value })}
                placeholder={placeholder}
                className={fieldClass}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-soft sm:p-6">
        <h2 className="font-display text-xl text-charcoal">Delivery Areas</h2>
        <p className="mt-0.5 text-sm text-charcoal-400">Shown at checkout and when adding a hotel.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {settings.areas.map((area) => (
            <span key={area} className="inline-flex items-center gap-1 rounded-full bg-cream-100 py-1 pl-3 pr-1 text-sm text-charcoal-600">
              {area}
              <button
                type="button"
                onClick={() => change({ areas: settings.areas.filter((item) => item !== area) })}
                aria-label={`Remove ${area}`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-charcoal-400 hover:bg-cream-200 hover:text-charcoal"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>

        <div className="mt-4 flex max-w-md gap-2">
          <input
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              addArea();
            }}
            placeholder="New area name"
            aria-label="New area name"
            className={fieldClass}
          />
          <button
            type="button"
            onClick={addArea}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-cream-300 px-4 text-sm font-semibold text-charcoal-600 hover:bg-cream-100"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 rounded-xl bg-forest-800 px-5 text-sm font-semibold text-white hover:bg-forest-700 disabled:pointer-events-none disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
        {notice && (
          <p role={notice.error ? "alert" : "status"} className={`text-sm font-medium ${notice.error ? "text-red-600" : "text-forest-700"}`}>
            {notice.text}
          </p>
        )}
      </div>
    </form>
  );
}
