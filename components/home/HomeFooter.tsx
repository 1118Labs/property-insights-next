import Link from "next/link";

export function HomeFooter() {
  return (
    <footer className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/90 px-6 py-6 text-center text-sm text-slate-600 shadow-sm backdrop-blur sm:flex-row sm:justify-between">
      <div className="text-xs text-slate-500">© {new Date().getFullYear()} Property Insights · Powered by 1118 Labs</div>
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
        <Link href="/privacy" className="hover:text-slate-900">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-slate-900">
          Terms
        </Link>
        <Link href="/support" className="hover:text-slate-900">
          Support
        </Link>
      </div>
    </footer>
  );
}
