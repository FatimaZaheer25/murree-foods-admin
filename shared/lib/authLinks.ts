// /path?email=...&next=... (khaali values URL mein nahi aatin)
export function authHref(path: string, params: Record<string, string | null>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}

// Login ke baad sirf apni site ke andar jao. //evil.com ya https://evil.com ko home bhej do
export const safeNext = (next: string | null) => (next && /^\/(?![/\\])/.test(next) ? next : "/");
