"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MIN_PASSWORD_LENGTH, isEmail } from "../../data/validation";
import { useAuth } from "./AuthContext";
import { forgotPassword, resetPassword } from "../../lib/auth";
import { AuthCard } from "./AuthCard";
import ResendCode from "./ResendCode";
import { authHref } from "../../lib/authLinks";
import {
  BackToLogin,
  Field,
  FormMessage,
  OtpInput,
  SubmitButton,
  focusFirstError,
} from "./fields";
import PasswordInput from "./PasswordInput";
import { useSubmit } from "./useSubmit";

type Errors = { otp?: string; password?: string };

export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const next = params.get("next");
  const { refresh } = useAuth();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const { loading, error, run } = useSubmit();

  // Seedha URL khola, email saath nahi
  if (!isEmail(email)) {
    return (
      <AuthCard title="Reset password" subtitle="Please request a reset code first.">
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="font-semibold text-forest-700 hover:underline">
            Forgot password
          </Link>
        </p>
      </AuthCard>
    );
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found: Errors = {};
    if (otp.length !== 6) found.otp = "Enter the 6-digit code.";
    if (!password) found.password = "New password is required.";
    else if (password.length < MIN_PASSWORD_LENGTH)
      found.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstError(e.currentTarget, found);
      return;
    }
    run(async () => {
      await resetPassword({ email, otp, newPassword: password });
      await refresh(); // reset se session khatam hota hai, header ko bhi pata chale
      setOtp("");
      setPassword("");
      router.replace(authHref("/login", { reset: "1", next }));
    });
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle={
        <>
          If <span className="font-semibold text-charcoal">{email}</span> is registered, we sent it a 6-digit code
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Reset Code" error={errors.otp}>
          <OtpInput
            value={otp}
            error={errors.otp}
            onChange={(value) => {
              setOtp(value);
              setErrors((prev) => ({ ...prev, otp: undefined }));
            }}
          />
        </Field>
        <Field label="New Password" error={errors.password}>
          <PasswordInput
            id="auth-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password}
          />
        </Field>

        <SubmitButton loading={loading}>Reset Password</SubmitButton>

        {error && <FormMessage type="error">{error}</FormMessage>}
      </form>

      <ResendCode resend={() => forgotPassword(email)} />
      <BackToLogin href={authHref("/login", { next })} />
    </AuthCard>
  );
}
