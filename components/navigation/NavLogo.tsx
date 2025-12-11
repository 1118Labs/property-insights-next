import Image from "next/image";

export function NavLogo({ workspace }: { workspace?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200">
        <Image src="/brand/pi-logo.png" alt="Property Insights" width={32} height={32} />
      </div>
      <div className="leading-tight">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Property Insights</p>
        <p className="text-sm font-semibold text-slate-900">{workspace || "Workspace"}</p>
      </div>
    </div>
  );
}
