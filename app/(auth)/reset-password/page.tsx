import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFallback } from "@murree/shared/components/auth/AuthCard";
import ResetPasswordForm from "@murree/shared/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — MurreeFoods Admin",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
