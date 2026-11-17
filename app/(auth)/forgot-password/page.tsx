import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFallback } from "@murree/shared/components/auth/AuthCard";
import ForgotPasswordForm from "@murree/shared/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — MurreeFoods Admin",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
