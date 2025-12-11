type PortalHeroProps = {
  title: string;
  subtitle?: string;
};

export function PortalHero({ title, subtitle }: PortalHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-md">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(52,120,246,0.06),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.06),transparent_32%)]" />
      </div>
      <div className="relative space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
    </section>
  );
}
