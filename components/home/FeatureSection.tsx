type FeatureSectionProps = {
  title: string;
  description: string;
  illustrationPosition?: "left" | "right";
};

export function FeatureSection({ title, description, illustrationPosition = "right" }: FeatureSectionProps) {
  const Illustration = (
    <div className="h-full min-h-[200px] w-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-inner ring-1 ring-slate-200/70" />
  );

  return (
    <section className="grid gap-8 rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur md:grid-cols-2 md:items-center">
      {illustrationPosition === "left" && Illustration}
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="text-base leading-relaxed text-slate-600">{description}</p>
      </div>
      {illustrationPosition === "right" && Illustration}
    </section>
  );
}
