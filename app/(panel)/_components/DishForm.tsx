"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { X } from "lucide-react";
import { ApiError } from "@murree/shared/lib/api";
import { createFood, type FoodInput, updateFood } from "@/lib/admin";
import { discardDishPhoto } from "@/lib/photoUpload";
import { IMAGE_RULE, isAllowedImage } from "@murree/shared/lib/imageHosts";
import type { AdminCategory, AdminFood } from "@murree/shared/types";
import { ExtraPhotos, MainPhoto } from "./DishPhotos";

const MAX_EXTRA_PHOTOS = 4;

const fieldClass =
  "h-11 w-full rounded-xl border border-cream-300 bg-cream-50 px-3 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-400";
const errorClass = "mt-1.5 block text-xs font-medium text-red-600";

// Form mein sab kuch text (khaali number field bhi chal sake), bhejte waqt number bante hain
type FormState = {
  name: string;
  category: string;
  price: string;
  time: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  badge: string;
  rating: string;
  reviewCount: string;
  popular: boolean;
  vegetarian: boolean;
  spicy: boolean;
  isAvailable: boolean;
};

type Errors = Partial<Record<keyof FormState | `gallery.${number}`, string>>;

const toForm = (food: AdminFood | null, categories: AdminCategory[]): FormState => ({
  name: food?.name ?? "",
  category: food?.category ?? categories.find((c) => c.isActive)?.slug ?? "",
  price: food ? String(food.price) : "",
  time: food ? String(food.time) : "",
  description: food?.description ?? "",
  longDescription: food?.longDescription ?? "",
  image: food?.image ?? "",
  gallery: food?.gallery ?? [],
  badge: food?.badge ?? "",
  rating: food ? String(food.rating) : "0",
  reviewCount: food ? String(food.reviewCount) : "0",
  popular: food?.popular ?? false,
  vegetarian: food?.vegetarian ?? false,
  spicy: food?.spicy ?? false,
  isAvailable: food?.isAvailable ?? true,
});

const wholeNumber = (value: string, label: string, min: number, max: number) => {
  const n = Number(value);
  if (value.trim() === "" || !Number.isInteger(n)) return `${label} must be a whole number.`;
  if (n < min || n > max) return `${label} must be between ${min} and ${max.toLocaleString("en-US")}.`;
  return "";
};

// Wahi qaayde jo backend par hain, taa ke ghalti foran field ke neeche dikhe
function check(form: FormState): Errors {
  const errors: Errors = {};
  const name = form.name.trim();
  if (name.length < 2) errors.name = "Dish name is required.";
  else if (name.length > 80) errors.name = "Dish name is too long.";
  if (!form.category) errors.category = "Please choose a category.";
  errors.price = wholeNumber(form.price, "Price", 1, 100000);
  errors.time = wholeNumber(form.time, "Prep time", 1, 240);
  if (!form.description.trim()) errors.description = "Short description is required.";
  else if (form.description.trim().length > 150) errors.description = "Short description is too long (150 max).";
  if (!form.longDescription.trim()) errors.longDescription = "Full description is required.";
  else if (form.longDescription.trim().length > 1000) errors.longDescription = "Full description is too long (1000 max).";
  if (!form.image.trim()) errors.image = "Please upload a main photo.";
  else if (!isAllowedImage(form.image.trim())) errors.image = IMAGE_RULE;
  form.gallery.forEach((photo, i) => {
    const value = photo.trim();
    if (!isAllowedImage(value)) errors[`gallery.${i}`] = IMAGE_RULE;
    else if (value === form.image.trim()) errors[`gallery.${i}`] = "This is already the main photo.";
    else if (form.gallery.findIndex((other) => other.trim() === value) !== i) errors[`gallery.${i}`] = "This photo is already added.";
  });
  if (form.badge.trim().length > 30) errors.badge = "Badge is too long (30 max).";
  const rating = Number(form.rating);
  if (form.rating.trim() === "" || Number.isNaN(rating) || rating < 0 || rating > 5) errors.rating = "Rating must be between 0 and 5.";
  else if (Math.abs(rating * 10 - Math.round(rating * 10)) > 1e-9) errors.rating = "Use one decimal, like 4.5.";
  errors.reviewCount = wholeNumber(form.reviewCount, "Reviews count", 0, 1000000);

  return Object.fromEntries(Object.entries(errors).filter(([, value]) => value)) as Errors;
}

const toInput = (form: FormState): FoodInput => ({
  name: form.name.trim(),
  category: form.category,
  price: Number(form.price),
  time: Number(form.time),
  description: form.description.trim(),
  longDescription: form.longDescription.trim(),
  image: form.image.trim(),
  gallery: form.gallery.map((photo) => photo.trim()),
  badge: form.badge.trim(),
  rating: Number(form.rating),
  reviewCount: Number(form.reviewCount),
  popular: form.popular,
  vegetarian: form.vegetarian,
  spicy: form.spicy,
  isAvailable: form.isAvailable,
});

type Props = {
  food: AdminFood | null; // null = nayi dish
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: (food: AdminFood, message: string) => void;
};

export default function DishForm({ food, categories, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(food, categories));
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  // Kitni photos abhi upload ho rahi hain (tab tak Save band)
  const [uploading, setUploading] = useState(0);
  // Is form mein upload hui photos jo abhi kisi dish mein save nahi. Hatai, badli ya form band: Cloudinary se bhi hatao.
  // (Pehle se save shuda photo yahan nahi: woh dish Save hone par backend hatata hai)
  const fresh = useRef(new Set<string>());
  const mainPhoto = useRef(form.image);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setServerError("");
  };

  const busy = (on: boolean) => setUploading((n) => Math.max(0, n + (on ? 1 : -1)));
  const dropIfFresh = (url: string) => {
    if (url && fresh.current.delete(url)) void discardDishPhoto(url);
  };

  // Nayi photo upload hui (url) ya hatai ("")
  const setMainPhoto = (url: string) => {
    dropIfFresh(mainPhoto.current);
    mainPhoto.current = url;
    if (url) fresh.current.add(url);
    set("image", url);
  };

  const addPhoto = (url: string) => {
    fresh.current.add(url);
    setForm((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
    setServerError("");
  };

  // Ek photo hatao to baad wali errors ka number badal jata hai: sab saaf kar do
  const removePhoto = (i: number) => {
    dropIfFresh(form.gallery[i]);
    setForm((prev) => ({ ...prev, gallery: prev.gallery.filter((_, j) => j !== i) }));
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith("gallery."))));
  };

  // Cancel, X ya bahar click: is form ki unsaved uploads Cloudinary se hata kar band
  const close = () => {
    fresh.current.forEach((url) => void discardDishPhoto(url));
    fresh.current.clear();
    onClose();
  };

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (uploading) return;
    const found = check(form);
    const formEl = e.currentTarget;
    // flushSync: laal nishaan abhi screen par aa jayein, taake neeche pehli ghalat field mil sake
    flushSync(() => setErrors(found));
    if (Object.keys(found).length) {
      // Pehli ghalat field par le jao (sirf isi form mein dhoondo)
      formEl.querySelector<HTMLElement>("[aria-invalid='true'], [data-invalid='true']")?.focus();
      return;
    }

    setSaving(true);
    setServerError("");
    try {
      const result = food ? await updateFood(food.slug, toInput(form)) : await createFood(toInput(form));
      fresh.current.clear(); // ab yeh dish ki photos hain
      onSaved(result.food, result.message);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" onClick={close} className="absolute inset-0" />
      <form
        onSubmit={save}
        noValidate
        aria-labelledby="dish-form-title"
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-cream-200 bg-white p-5 shadow-lift sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="dish-form-title" className="font-display text-xl text-charcoal">
              {food ? "Edit Dish" : "Add Dish"}
            </h3>
            <p className="mt-0.5 text-sm text-charcoal-400">
              {food ? (
                <>
                  Link: <span className="font-medium text-charcoal-600">/food/{food.slug}</span> (does not change)
                </>
              ) : (
                "The dish link is made from the name and never changes."
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex min-h-9 min-w-9 items-center justify-center rounded-lg text-charcoal-400 hover:bg-cream-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelClass}>Dish Name</span>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Mutton Karahi"
              aria-invalid={!!errors.name}
              className={`${fieldClass} ${errors.name ? "border-red-400" : ""}`}
            />
            {errors.name && <span className={errorClass}>{errors.name}</span>}
          </label>

          <label className="block">
            <span className={labelClass}>Category</span>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              aria-invalid={!!errors.category}
              className={`${fieldClass} ${errors.category ? "border-red-400" : ""}`}
            >
              {!form.category && <option value="">Choose a category</option>}
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                  {category.isActive ? "" : " (hidden)"}
                </option>
              ))}
            </select>
            {errors.category && <span className={errorClass}>{errors.category}</span>}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Price (Rs.)</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                aria-invalid={!!errors.price}
                className={`${fieldClass} ${errors.price ? "border-red-400" : ""}`}
              />
              {errors.price && <span className={errorClass}>{errors.price}</span>}
            </label>
            <label className="block">
              <span className={labelClass}>Prep (min)</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                aria-invalid={!!errors.time}
                className={`${fieldClass} ${errors.time ? "border-red-400" : ""}`}
              />
              {errors.time && <span className={errorClass}>{errors.time}</span>}
            </label>
          </div>

          <label className="block sm:col-span-2">
            <span className={labelClass}>Short Description</span>
            <input
              value={form.description}
              maxLength={150}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Shown on the menu card"
              aria-invalid={!!errors.description}
              className={`${fieldClass} ${errors.description ? "border-red-400" : ""}`}
            />
            {errors.description && <span className={errorClass}>{errors.description}</span>}
          </label>

          <label className="block sm:col-span-2">
            <span className={labelClass}>Full Description</span>
            <textarea
              value={form.longDescription}
              maxLength={1000}
              rows={3}
              onChange={(e) => set("longDescription", e.target.value)}
              placeholder="Shown on the dish page"
              aria-invalid={!!errors.longDescription}
              className={`w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100 ${
                errors.longDescription ? "border-red-400" : ""
              }`}
            />
            {errors.longDescription && <span className={errorClass}>{errors.longDescription}</span>}
          </label>

          {/* Photos: computer/phone se upload (Cloudinary). Purani /images/ photos waisi hi dikhti aur chalti hain */}
          <div className="sm:col-span-2">
            <span className={labelClass}>Main Photo</span>
            <MainPhoto url={form.image} error={errors.image} onChange={setMainPhoto} onBusyChange={busy} />

            <span className={`${labelClass} mt-4`}>Extra Photos (optional)</span>
            <ExtraPhotos
              photos={form.gallery}
              max={MAX_EXTRA_PHOTOS}
              errors={form.gallery.map((_, i) => errors[`gallery.${i}`] ?? "")}
              onAdd={addPhoto}
              onRemove={removePhoto}
              onBusyChange={busy}
            />
          </div>

          <label className="block">
            <span className={labelClass}>Badge</span>
            <input
              value={form.badge}
              maxLength={30}
              onChange={(e) => set("badge", e.target.value)}
              placeholder="e.g. Best Seller (optional)"
              aria-invalid={!!errors.badge}
              className={`${fieldClass} ${errors.badge ? "border-red-400" : ""}`}
            />
            {errors.badge && <span className={errorClass}>{errors.badge}</span>}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Rating</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min={0}
                max={5}
                value={form.rating}
                onChange={(e) => set("rating", e.target.value)}
                aria-invalid={!!errors.rating}
                className={`${fieldClass} ${errors.rating ? "border-red-400" : ""}`}
              />
              {errors.rating && <span className={errorClass}>{errors.rating}</span>}
            </label>
            <label className="block">
              <span className={labelClass}>Reviews</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={form.reviewCount}
                onChange={(e) => set("reviewCount", e.target.value)}
                aria-invalid={!!errors.reviewCount}
                className={`${fieldClass} ${errors.reviewCount ? "border-red-400" : ""}`}
              />
              {errors.reviewCount && <span className={errorClass}>{errors.reviewCount}</span>}
            </label>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 sm:col-span-2">
            {(
              [
                ["popular", "Popular"],
                ["vegetarian", "Vegetarian"],
                ["spicy", "Spicy"],
                ["isAvailable", "Visible to customers"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="inline-flex min-h-9 items-center gap-2 text-sm text-charcoal-600">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="h-4 w-4 accent-forest-700"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {serverError && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {serverError}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="min-h-11 rounded-xl px-4 text-sm font-semibold text-charcoal-600 hover:bg-cream-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading > 0}
            className="min-h-11 rounded-xl bg-forest-800 px-4 text-sm font-semibold text-white hover:bg-forest-700 disabled:pointer-events-none disabled:opacity-60"
          >
            {uploading > 0 ? "Uploading photo…" : saving ? "Saving…" : food ? "Save Changes" : "Add Dish"}
          </button>
        </div>
      </form>
    </div>
  );
}
