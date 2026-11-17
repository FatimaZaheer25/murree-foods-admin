import BrandLogo from "../ui/BrandLogo";
import ThemeToggle from "../ui/ThemeToggle";

// Login wale pages ka cream background aur halke ped (card isi ke beech mein aata hai)
export function AuthBackdrop({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-cream-100 px-4 py-12 ${className}`}>
      <div className="pine-pattern pointer-events-none absolute inset-0 opacity-60" />
      {children}
    </div>
  );
}

// Admin aur Rider apps ke login / forgot / reset pages: website ka Navbar nahi, upar logo aur dark mode button
export default function AuthScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-cream-200 bg-cream-50 px-4 sm:px-6">
        <BrandLogo />
        <ThemeToggle />
      </header>
      <AuthBackdrop className="flex-1">{children}</AuthBackdrop>
    </div>
  );
}
