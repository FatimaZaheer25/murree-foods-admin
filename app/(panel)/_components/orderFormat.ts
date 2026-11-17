import type { OrderStatus } from "@murree/shared/types";

// Admin ke rang (design jaise; customer ke My Orders se thore alag)
export const statusColors: Record<OrderStatus, string> = {
  Delivered: "bg-emerald-50 text-emerald-700",
  Preparing: "bg-amber-50 text-amber-800",
  "Out for Delivery": "bg-sky-50 text-sky-700",
  Confirmed: "bg-violet-50 text-violet-700",
  Cancelled: "bg-red-50 text-red-700",
};

export const formatPrice = (price: number) => `Rs. ${price.toLocaleString("en-US")}`;

// Saare waqt Pakistan time mein dikhte hain (admin kahin bhi ho)
const PK = "Asia/Karachi";

// "10 Nov, 3:45 pm"
export const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-PK", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: PK });

// "10 Nov 2026"
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric", timeZone: PK });

// Backend ki tareekh "2026-11-10" (pehle se Pakistan ka din): haftay mein "Mon", warna "10 Nov"
export const dayLabel = (date: string, weekday: boolean) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", weekday ? { weekday: "short", timeZone: "UTC" } : { day: "numeric", month: "short", timeZone: "UTC" });

// Lambe chart mein har din ka naam nahi (aapas mein chadh jate): taqreeban 7 naam
export const showLabel = (index: number, length: number) => length <= 7 || index % Math.ceil(length / 7) === 0;
