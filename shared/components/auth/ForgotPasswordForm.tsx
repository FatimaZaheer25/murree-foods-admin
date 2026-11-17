"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isEmail } from "../../data/validation";
import { forgotPassword } from "../../lib/auth";
import { AuthCard } from "./AuthCard";
import { authHref } from "../../lib/authLinks";
import { BackToLogin, Field, FormMessage, SubmitButton, focusFirstError, inputClass } from "./fields";
import { useSubmit } from "./useSubmit";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const { loading, error, run } = useSubmit();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = !email.trim() ? "Email is required." : !isEmail(email) ? "Enter a valid email address." : "";
    setEmailError(found);
    if (found) {
      focusFirstError(e.currentTarget, { email: found });
      return;
    }
    run(async () => {
      await forgotPassword(email.trim());
      router.push(authHref("/reset-password", { email: email.trim(), next }));
    });
  }

  return (
    <AuthCard title="Forgot password" subtitle="Enter your email and we'll send you a reset code">
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email" error={emailError}>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            placeholder="you@email.com"
            autoComplete="email"
            aria-invalid={!!emailError}
            className={inputClass(emailError)}
          />
        </Field>

        <SubmitButton loading={loading}>Send Reset Code</SubmitButton>

        {error && <FormMessage type="error">{error}</FormMessage>}
      </form>

      <BackToLogin href={authHref("/login", { next })} />
    </AuthCard>
  );
}
