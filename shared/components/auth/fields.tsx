import Link from "next/link";
import { Loader2 } from "lucide-react";

export const inputClass = (error?: string) =>
  `h-12 w-full rounded-xl border bg-cream-50 px-3 text-sm outline-none focus:ring-2 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-cream-300 focus:border-forest-600 focus:ring-forest-100"
  }`;

// Label + field + (agar ho) laal error message
export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-400">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

// 6 digit code. Ek hi input, taake paste aur phone ka auto-fill seedha chale
export function OtpInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <input
      id="auth-otp"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="000000"
      aria-invalid={!!error}
      className={`${inputClass(error)} text-center tracking-[0.5em]`}
    />
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="inline-flex h-13 min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-forest-800 px-7 text-base font-semibold text-white shadow-soft transition-all duration-200 hover:bg-forest-900 hover:shadow-lift active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
}

// Form ke neeche backend ka error, ya kamyabi ka message
export function FormMessage({ type, children }: { type: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={type === "error" ? "alert" : "status"}
      className={`rounded-xl px-4 py-3 text-center text-sm font-medium ${
        type === "error" ? "bg-red-50 text-red-700" : "bg-forest-50 text-forest-800"
      }`}
    >
      {children}
    </p>
  );
}

export function BackToLogin({ href = "/login" }: { href?: string }) {
  return (
    <p className="mt-5 text-center text-sm">
      <Link href={href} className="font-semibold text-forest-700 hover:underline">
        Back to login
      </Link>
    </p>
  );
}

// Pehli ghalat field par cursor le jao. Sirf isi form ke andar: Next pichle page ka form
// chhupa kar rakhta hai, aur us mein bhi yehi ids hote hain
export function focusFirstError(form: HTMLFormElement, errors: Record<string, string | undefined>) {
  const first = Object.keys(errors).find((key) => errors[key]);
  if (first) form.querySelector<HTMLElement>(`#auth-${first}`)?.focus();
}
