import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFallback } from "@murree/shared/components/auth/AuthCard";
import LoginForm from "@murree/shared/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login — MurreeFoods.com",
};

// Sign up nahi: admin sirf "npm run make-admin" (backend) se banta hai
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <LoginForm title="Admin login" subtitle="Manage orders, menu, riders and settings" />
    </Suspense>
  );
}
