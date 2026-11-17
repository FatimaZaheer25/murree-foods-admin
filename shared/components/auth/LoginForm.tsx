"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { isEmail } from "../../data/validation";
import { useAuth } from "./AuthContext";
import WrongAppLink from "./WrongAppLink";
import { ApiError } from "../../lib/api";
import { resendOtp } from "../../lib/auth";
import { AuthCard } from "./AuthCard";
import { authHref } from "../../lib/authLinks";
import { Field, FormMessage, SubmitButton, focusFirstError, inputClass } from "./fields";
import PasswordInput from "./PasswordInput";
import { useRedirectIfLoggedIn } from "./useRedirectIfLoggedIn";
import { useSubmit } from "./useSubmit";

type Errors = { email?: string; password?: string };

const emptyForm = { email: "", password: "" };

type Props = {
  title: string;
  subtitle: string;
  // Card ke upar (website: Login / Sign Up tabs)
  tabs?: React.ReactNode;
  // Email verify na ho to code bhej kar is page par (website). Na ho to sirf message (admin)
  verifyEmailPath?: string;
};

// Email + password login: website aur Admin panel dono yahi form istemal karte hain
export default function LoginForm({ title, subtitle, tabs, verifyEmailPath }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const notice = params.get("verified")
    ? "Email verified. You can now log in."
    : params.get("reset")
      ? "Password changed. Please log in with your new password."
      : "";

  const { login } = useAuth();
  useRedirectIfLoggedIn(next);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const { loading, error, errorApp, run } = useSubmit();

  const update = (field: keyof Errors, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  function validate(): Errors {
    const found: Errors = {};
    if (!form.email.trim()) found.email = "Email is required.";
    else if (!isEmail(form.email)) found.email = "Enter a valid email address.";
    if (!form.password) found.password = "Password is required.";
    return found;
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstError(e.currentTarget, found);
      return;
    }

    const email = form.email.trim();
    run(async () => {
      try {
        await login({ email, password: form.password });
      } catch (e) {
        // Password sahi hai lekin email verify nahi: code bhej kar OTP screen par.
        // (Doosri app ka account bhi 403 hai: woh neeche message + link ban kar dikhta hai)
        if (e instanceof ApiError && e.needsVerification && verifyEmailPath) {
          await resendOtp(email).catch(() => {}); // abhi abhi bheja ja chuka ho to wahi code chalega
          router.push(authHref(verifyEmailPath, { email, next }));
          return;
        }
        throw e;
      }
      setForm(emptyForm); // aage ka redirect useRedirectIfLoggedIn karta hai
    });
  }

  return (
    <AuthCard title={title} subtitle={subtitle}>
      {tabs}

      <form onSubmit={submit} noValidate className="space-y-4">
        {notice && <FormMessage type="success">{notice}</FormMessage>}

        <Field label="Email" error={errors.email}>
          <input
            id="auth-email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className={inputClass(errors.email)}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput
            id="auth-password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password}
          />
        </Field>

        <p className="text-right">
          <Link
            href={authHref("/forgot-password", { next })}
            className="text-sm font-semibold text-forest-700 hover:underline"
          >
            Forgot password?
          </Link>
        </p>

        <SubmitButton loading={loading}>Login</SubmitButton>

        {error && (
          <FormMessage type="error">
            {error}
            <WrongAppLink app={errorApp} />
          </FormMessage>
        )}
      </form>
    </AuthCard>
  );
}
