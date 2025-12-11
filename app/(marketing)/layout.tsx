export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-white text-slate-900">
      {children}
    </div>
  );
}
