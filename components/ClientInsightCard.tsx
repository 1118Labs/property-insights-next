import { PropertyProfile } from "@/lib/types";
import { deriveEnrichedFields, formatAddressDisplay } from "@/lib/propertyDisplay";

type StatProps = {
  label: string;
  value: string;
};

function Stat({ label, value }: StatProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="font-medium text-slate-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}

export default function ClientInsightCard({ profile }: { profile: PropertyProfile }) {
  const property = profile.property;
  const address = formatAddressDisplay(property.address);
  const { beds, baths, sqft, lot, year, estValue, estRent, hasLimitedData } = deriveEnrichedFields(profile);

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-md">
      <div className="h-36 w-full rounded-lg bg-gradient-to-br from-gray-50 to-white ring-1 ring-gray-100 shadow-inner" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-900">{address}</p>
        <p className="text-xs text-gray-500">Confidential property snapshot</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 sm:grid-cols-4">
        <Stat label="Beds" value={beds} />
        <Stat label="Baths" value={baths} />
        <Stat label="Sqft" value={sqft} />
        <Stat label="Year" value={year} />
        <Stat label="Lot Size" value={lot} />
        <Stat label="Est. Value" value={estValue} />
        <Stat label="Est. Rent" value={estRent} />
      </div>
      {hasLimitedData && (
        <p className="text-xs text-gray-500">Limited data — estimate only.</p>
      )}
    </div>
  );
}
