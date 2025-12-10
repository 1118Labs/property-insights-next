type PISectionProps = {
  title: string;
  children: React.ReactNode;
};

export default function PISection({ title, children }: PISectionProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-slate-900 tracking-tight">{title}</h2>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">{children}</div>
    </section>
  );
}
