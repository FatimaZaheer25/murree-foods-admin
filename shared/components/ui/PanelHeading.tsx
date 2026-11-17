// Panel page ke upar: chhota label (jaise "Admin") + bari heading
export default function PanelHeading({ label, title }: { label: React.ReactNode; title: string }) {
  return (
    <div className="mb-6 sm:mb-8">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-charcoal-300">
        {label}
      </p>
      <h1 className="mt-1 font-display text-2xl text-charcoal sm:text-3xl">{title}</h1>
    </div>
  );
}
