"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Search, Star } from "lucide-react";
import { ApiError } from "@murree/shared/lib/api";
import { dishImageSrc, isSitePhoto } from "@murree/shared/lib/images";
import { listAdminFoods, updateFood } from "@/lib/admin";
import type { AdminCategory, AdminFood } from "@murree/shared/types";
import DishForm from "./DishForm";

type Visibility = "all" | "visible" | "hidden";

const message = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
const formatPrice = (price: number) => `Rs. ${price.toLocaleString("en-US")}`;

export default function MenuManager() {
  const [foods, setFoods] = useState<AdminFood[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [visibility, setVisibility] = useState<Visibility>("all");
  // undefined = form band, null = nayi dish, warna woh dish jo edit ho rahi hai
  const [editing, setEditing] = useState<AdminFood | null | undefined>(undefined);
  const [toggling, setToggling] = useState("");

  useEffect(() => {
    listAdminFoods()
      .then((data) => {
        setFoods(data.foods);
        setCategories(data.categories);
      })
      .catch((e) => setPageError(message(e)))
      .finally(() => setLoading(false));
  }, []);

  // Kamyabi ka chhota sa paigham, kuch second baad khud gayab
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  function saved(food: AdminFood, text: string) {
    setFoods((prev) => (prev.some((item) => item.slug === food.slug) ? prev.map((item) => (item.slug === food.slug ? food : item)) : [food, ...prev]));
    setEditing(undefined);
    setPageError("");
    setNotice(`${text} Customers will see it within a minute.`);
  }

  // Chhupi dish menu, cart aur checkout se hat jati hai, lekin purane orders mein rehti hai
  async function toggle(food: AdminFood) {
    setToggling(food.slug);
    setPageError("");
    try {
      const result = await updateFood(food.slug, { isAvailable: !food.isAvailable });
      setFoods((prev) => prev.map((item) => (item.slug === food.slug ? result.food : item)));
      setNotice(`${food.name}: ${result.message}`);
    } catch (e) {
      setPageError(message(e));
    } finally {
      setToggling("");
    }
  }

  const search = query.trim().toLowerCase();
  const shown = foods.filter(
    (food) =>
      (category === "all" || food.category === category) &&
      (visibility === "all" || food.isAvailable === (visibility === "visible")) &&
      (!search || food.name.toLowerCase().includes(search) || food.badge.toLowerCase().includes(search))
  );
  const hiddenCount = foods.filter((food) => !food.isAvailable).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-charcoal">Menu</h2>
          <p className="mt-0.5 text-sm text-charcoal-400">
            {loading ? "Loading dishes…" : `${foods.length} dishes · ${hiddenCount} hidden`}. Hidden dishes stay in old orders.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          disabled={loading || categories.length === 0}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-800 px-4 text-sm font-semibold text-white transition hover:bg-forest-700 disabled:pointer-events-none disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Add Dish
        </button>
      </div>

      {pageError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {pageError}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </p>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block sm:w-64">
          <span className="sr-only">Search dishes</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-300" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes"
            className="h-10 w-full rounded-xl border border-cream-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
          />
        </label>
        <label className="block sm:w-48">
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 w-full rounded-xl border border-cream-300 bg-white px-3 text-sm outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div role="tablist" aria-label="Visibility" className="flex gap-1.5">
          {(["all", "visible", "hidden"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={visibility === key}
              onClick={() => setVisibility(key)}
              className={`min-h-9 rounded-lg px-3 text-sm font-semibold capitalize transition ${
                visibility === key ? "bg-forest-800 text-white" : "text-charcoal-600 hover:bg-cream-100"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-cream-200 bg-white shadow-soft">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-cream-200 bg-cream-50 text-xs uppercase tracking-wider text-charcoal-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Dish</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Rating</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-charcoal-400">
                  {loading ? "Loading dishes…" : foods.length ? "No dishes match these filters." : "No dishes yet. Add one to get started."}
                </td>
              </tr>
            ) : (
              shown.map((food) => (
                <tr key={food.slug} className="border-b border-cream-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-200 ${food.isAvailable ? "" : "opacity-50"}`}>
                        {/* Purani photo website se aati hai: wahan pehle hi chhoti hoti hai (unoptimized) */}
                        <Image
                          src={dishImageSrc(food.image)}
                          unoptimized={isSitePhoto(food.image)}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal">{food.name}</p>
                        <p className="mt-0.5 text-xs text-charcoal-400">
                          {[food.badge, food.vegetarian && "Veg", food.spicy && "Spicy", food.popular && "Popular"].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal-600">{categoryName(food.category)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatPrice(food.price)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-charcoal-600">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      {food.rating}
                      <span className="text-xs text-charcoal-400">({food.reviewCount})</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        food.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-cream-200 text-charcoal-400"
                      }`}
                    >
                      {food.isAvailable ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(food)}
                      aria-label={`Edit ${food.name}`}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-forest-700 transition hover:bg-cream-100"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(food)}
                      disabled={toggling === food.slug}
                      aria-label={`${food.isAvailable ? "Hide" : "Show"} ${food.name}`}
                      className="inline-flex min-h-9 items-center rounded-lg px-2.5 text-sm font-medium text-charcoal-600 transition hover:bg-cream-100 disabled:opacity-50"
                    >
                      {food.isAvailable ? "Hide" : "Show"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing !== undefined && (
        <DishForm food={editing} categories={categories} onClose={() => setEditing(undefined)} onSaved={saved} />
      )}
    </div>
  );
}
