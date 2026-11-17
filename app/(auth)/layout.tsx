import AuthScreen from "@murree/shared/components/auth/AuthScreen";

// Login, forgot aur reset password: logo + beech mein card (website wala hi design)
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthScreen>{children}</AuthScreen>;
}
