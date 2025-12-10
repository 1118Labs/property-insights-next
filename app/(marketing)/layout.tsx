export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021C36]/90 via-[#0c2a49] to-[#04152b] text-slate-50">
      {children}
    </div>
  );
}
