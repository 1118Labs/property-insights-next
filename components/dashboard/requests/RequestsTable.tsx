import { RequestRow, SortKey, SortState } from "./types";
import {
  ArrowSmallDownIcon,
  ArrowSmallUpIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import PICard from "@/components/ui/PICard";
import PIButton from "@/components/ui/PIButton";
import StatusPill from "@/components/ui/StatusPill";

type RequestsTableProps = {
  rows: RequestRow[];
  sort: SortState;
  onSortChange: (key: SortKey) => void;
  onRowClick: (row: RequestRow) => void;
};

const columns: { key: SortKey; label: string }[] = [
  { key: "clientName", label: "Request" },
  { key: "address", label: "Address" },
  { key: "createdAt", label: "Request Date" },
  { key: "status", label: "Status" },
  { key: "beds", label: "Beds" },
  { key: "baths", label: "Baths" },
  { key: "sqft", label: "Sqft" },
  { key: "yearBuilt", label: "Year" },
  { key: "estimatedValue", label: "Value" },
];

function formatAddress(row: RequestRow) {
  if (row.addressString) return row.addressString;
  const { line1, city, state, postalCode } = row.address ?? {};
  return [line1, city, state, postalCode].filter(Boolean).join(", ");
}

function formatNumber(value?: number | null) {
  if (!value && value !== 0) return "—";
  return value.toLocaleString();
}

function SortGlyph({
  sort,
  column,
}: {
  sort: SortState;
  column: SortKey;
}) {
  if (sort.key !== column) {
    return (
      <ArrowsUpDownIcon className="h-4 w-4 text-slate-400" aria-hidden />
    );
  }
  return sort.direction === "asc" ? (
    <ArrowSmallUpIcon className="h-4 w-4 text-slate-600" aria-hidden />
  ) : (
    <ArrowSmallDownIcon className="h-4 w-4 text-slate-600" aria-hidden />
  );
}

export default function RequestsTable({
  rows,
  sort,
  onSortChange,
  onRowClick,
}: RequestsTableProps) {
  if (!rows.length) {
    return (
      <PICard className="text-slate-800 space-y-3">
        <div className="text-lg font-semibold text-slate-900">
          No requests yet
        </div>
        <p className="text-sm text-slate-600">
          Connect Jobber to automatically sync new customer inquiries.
        </p>
        <PIButton href="/dashboard/jobber">Connect Jobber</PIButton>
      </PICard>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wide border-b border-slate-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => onSortChange(col.key)}
                    className="cursor-pointer select-none px-4 py-3 text-left"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      <SortGlyph sort={sort} column={col.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row)}
                  className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 text-sm text-slate-800 font-semibold">
                    {row.title || row.clientName || "Jobber Request"}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-800">
                    {formatAddress(row) || "Address pending"}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-700">
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleString()
                      : "—"}
                  </td>

                  <td className="px-4 py-3">
                    <StatusPill
                      status={row.status ? "connected" : "disconnected"}
                      label={row.status || "Unknown"}
                    />
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-700">
                    {row.property?.bedrooms ??
                      row.enrichment?.beds ??
                      "—"}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-700">
                    {row.property?.bathrooms ??
                      row.enrichment?.baths ??
                      "—"}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-700">
                    {formatNumber(
                      row.property?.squareFeet ??
                        row.enrichment?.sqft ??
                        null
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-700">
                    {row.property?.yearBuilt ??
                      row.enrichment?.yearBuilt ??
                      "—"}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-700">
                    {(() => {
                      const value =
                        row.estimatedValue ??
                        row.enrichment?.estimatedValue ??
                        row.property?.priceEstimate ??
                        null;
                      return typeof value === "number"
                        ? `$${value.toLocaleString()}`
                        : "—";
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <button
            key={row.id}
            onClick={() => onRowClick(row)}
            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50"
          >
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-slate-900">
                {row.title ||
                  row.contactName ||
                  row.clientName ||
                  "Jobber Request"}
              </div>

              <StatusPill
                status={row.status ? "connected" : "disconnected"}
                label={row.status || "Unknown"}
              />
            </div>

            <div className="mt-1 text-sm font-medium text-slate-800">
              {formatAddress(row) || "Address pending"}
            </div>

            <div className="text-xs text-slate-500">
              {row.createdAt
                ? new Date(row.createdAt).toLocaleDateString()
                : "—"}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <div className="font-semibold text-slate-900">
                  Beds / Baths
                </div>
                <div>
                  {row.property?.bedrooms ??
                    row.enrichment?.beds ??
                    "—"}{" "}
                  bd /{" "}
                  {row.property?.bathrooms ??
                    row.enrichment?.baths ??
                    "—"}{" "}
                  ba
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-900">
                  Sq Ft
                </div>
                <div>
                  {formatNumber(
                    row.property?.squareFeet ??
                      row.enrichment?.sqft ??
                      null
                  )}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-900">
                  Year
                </div>
                <div>
                  {row.property?.yearBuilt ??
                    row.enrichment?.yearBuilt ??
                    "—"}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-900">
                  Value
                </div>
                <div>
                  {(() => {
                    const value =
                      row.estimatedValue ??
                      row.enrichment?.estimatedValue ??
                      row.property?.priceEstimate ??
                      null;
                    return typeof value === "number"
                      ? `$${value.toLocaleString()}`
                      : "—";
                  })()}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
