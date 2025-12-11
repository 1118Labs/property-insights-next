import { formatAddress } from "@/lib/utils/address";
import { PropertyRecord } from "@/lib/types";

export function PropertyHeader({ property }: { property: PropertyRecord }) {
  const address = formatAddress(property.address);
  const propertyType =
    property.lotShape ||
    (property as { propertyType?: string }).propertyType ||
    (property as { taxonomy?: string }).taxonomy;

  return (
    <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-white px-6 py-6 shadow-sm transition-all duration-200 ease-out hover:shadow-md sm:px-10 sm:py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,120,246,0.06),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.06),transparent_30%)]" />
      </div>
      <div className="relative space-y-2">
        <p className="text-xs uppercase tracking-wide text-gray-500">Property Profile</p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{address}</h1>
        {propertyType ? <p className="text-sm text-gray-600">{propertyType}</p> : null}
      </div>
    </section>
  );
}
