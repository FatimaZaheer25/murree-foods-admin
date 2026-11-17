// Har auth page ka safed card
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full max-w-md rounded-[1.75rem] border border-cream-200 bg-white p-7 shadow-lift sm:p-8">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-charcoal">{title}</h1>
        <p className="mt-1 text-sm text-charcoal-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// URL parhne tak (Suspense) ye dikhta hai
export function AuthFallback() {
  return <div className="relative h-[30rem] w-full max-w-md animate-pulse rounded-[1.75rem] bg-white shadow-lift" />;
}
