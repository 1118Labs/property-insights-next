"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import PaginationControls from "@/components/dashboard/requests/PaginationControls";
import RequestDrawer from "@/components/dashboard/requests/RequestDrawer";
import RequestsSkeleton from "@/components/dashboard/requests/RequestsSkeleton";
import RequestsTable from "@/components/dashboard/requests/RequestsTable";
import PIButton from "@/components/ui/PIButton";
import PICard from "@/components/ui/PICard";
import StatusFilters, {
  StatusOption,
} from "@/components/dashboard/requests/StatusFilters";
import {
  RequestRow,
  SortKey,
  SortState,
} from "@/components/dashboard/requests/types";
import Hint from "@/components/onboarding/Hint";
import { isDemoModeEnabled, isOnboardingHintsEnabled } from "@/lib/featureFlags";

const PAGE_SIZE = 10;

type RequestsApiError = Error & { error?: string; status?: number };

function isRequestsApiError(err: unknown): err is RequestsApiError {
  return err instanceof Error;
}

async function fetchRequests(): Promise<RequestRow[]> {
  const res = await fetch("/api/jobber/requests?mode=cache-first");
  const json = await res.json();

  if (!res.ok) {
    const err: RequestsApiError = new Error(
      (json && json.message) || "Failed to load requests."
    );
    err.error = json?.error;
    err.status = res.status;
    throw err;
  }

  return (json.requests as RequestRow[]) ?? [];
}

function formatAddress(address?: RequestRow["address"], addressString?: string) {
  if (addressString) return addressString;
  const { line1, city, state, postalCode } = address ?? {};
  return [line1, city, state, postalCode].filter(Boolean).join(", ");
}

function compareValues(
  a: unknown,
  b: unknown,
  direction: "asc" | "desc"
) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  const order = direction === "asc" ? 1 : -1;

  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b) * order;
  }

  if (typeof a === "number" && typeof b === "number") {
    return (a > b ? 1 : a < b ? -1 : 0) * order;
  }

  return String(a).localeCompare(String(b)) * order;
}

function getComparableValue(row: RequestRow, key: SortKey) {
  switch (key) {
    case "clientName":
      return row.contactName ?? row.clientName ?? row.title ?? "";
    case "address":
      return formatAddress(row.address, row.addressString);
    case "createdAt":
      return row.createdAt ? new Date(row.createdAt).getTime() : null;
    case "status":
      return row.status ?? "";
    case "beds":
      return row.property?.bedrooms ?? row.enrichment?.beds ?? null;
    case "baths":
      return row.property?.bathrooms ?? row.enrichment?.baths ?? null;
    case "sqft":
      return row.property?.squareFeet ?? row.enrichment?.sqft ?? null;
    case "yearBuilt":
      return row.property?.yearBuilt ?? row.enrichment?.yearBuilt ?? null;
    case "estimatedValue":
      return (
        row.estimatedValue ??
        row.enrichment?.estimatedValue ??
        row.property?.priceEstimate ??
        null
      );
  }
}

export default function RequestsDashboardPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const accountId =
    process.env.NEXT_PUBLIC_JOBBER_ACCOUNT_ID || "default-account";
  const [sort, setSort] = useState<SortState>({
    key: "createdAt",
    direction: "desc",
  });
  const [page, setPage] = useState<number>(1);
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(
    null
  );

  const {
    data: requests,
    isLoading,
    isError,
    error,
    isFetching,
    dataUpdatedAt,
  } = useQuery<RequestRow[]>({
    queryKey: ["jobber-requests", accountId],
    queryFn: fetchRequests,
  });
  const hintsEnabled = isOnboardingHintsEnabled();
  const demoMode = isDemoModeEnabled();

  const statusOptions: StatusOption[] = useMemo(() => {
    const counts: Record<string, number> = {};
    (requests ?? []).forEach((row) => {
      const key = row.status || "unknown";
      counts[key] = (counts[key] ?? 0) + 1;
    });

    const options = Object.entries(counts).map(([value, count]) => ({
      value,
      label: value.replace(/_/g, " "),
      count,
    }));

    options.sort((a, b) => a.label.localeCompare(b.label));

    const total = (requests ?? []).length;

    return [{ value: "all", label: "All", count: total }, ...options];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    if (statusFilter === "all") return requests;
    return requests.filter((row) => (row.status || "unknown") === statusFilter);
  }, [requests, statusFilter]);

  const sortedRequests = useMemo(() => {
    const copy = [...filteredRequests];
    copy.sort((a, b) =>
      compareValues(
        getComparableValue(a, sort.key),
        getComparableValue(b, sort.key),
        sort.direction
      )
    );
    return copy;
  }, [filteredRequests, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);

  const paginatedRequests = useMemo(() => {
    const start = (clampedPage - 1) * PAGE_SIZE;
    return sortedRequests.slice(start, start + PAGE_SIZE);
  }, [sortedRequests, clampedPage]);

  const handleSortChange = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const handleRefresh = () => {
    // Force invalidation so the query refetches with a clean state.
    queryClient.invalidateQueries({ queryKey: ["jobber-requests", accountId] });
  };

  const lastSync = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : undefined;

  const missingToken =
    isError &&
    isRequestsApiError(error) &&
    (error.error === "missing_token" ||
      error.error === "token_resolution_failed" ||
      error.status === 401);

  const errorMessage = missingToken
    ? "Jobber is not connected. Connect to start syncing requests."
    : isRequestsApiError(error) && (error.message || error.error)
    ? error.message || error.error || "Something went wrong."
    : "Something went wrong.";

  return (
    <div className="relative flex min-h-screen bg-[#F5F5F7] text-slate-900">
      <Sidebar />
      <div className="relative z-10 flex flex-1 flex-col">
        <TopBar title="Requests" userName="Ops Team" lastSync={lastSync} showJobberStatus />

        <main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-10 text-slate-900 md:px-10">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/pi-logo.png"
              alt="Property Insights Logo"
              width={40}
              height={40}
              className="h-9 w-auto opacity-90"
            />
            <span className="text-sm font-semibold text-slate-700">Property Insights</span>
          </div>

          {hintsEnabled && demoMode && (
            <Hint
              title="You’re viewing demo data"
              body="Connect Jobber to replace demo requests with your live customers."
              actionHref="/dashboard/jobber"
              actionLabel="Connect Jobber"
            />
          )}
          <PICard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-slate-900">
                  Jobber Requests
                </h1>
                <p className="text-sm text-slate-600">
                  Live requests enriched with property intel. Click a row for full detail.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                {isFetching && !isLoading && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-800 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[#0A84FF]" />
                    Refreshing data…
                  </span>
                )}
                <PIButton variant="secondary" onClick={handleRefresh} className="text-sm">
                  Refresh
                </PIButton>
              </div>
            </div>
          </PICard>

          <StatusFilters
            options={statusOptions}
            active={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          />

          {(isLoading || (isFetching && !requests?.length)) && <RequestsSkeleton />}

          {missingToken && !isLoading && (
            <PICard className="text-sm text-slate-900">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="text-lg font-semibold text-slate-900">Jobber is not connected</div>
                  <div className="text-slate-600">
                    Connect your Jobber account to start pulling live requests.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PIButton href="/dashboard/jobber" className="text-sm">
                    Connect Jobber
                  </PIButton>
                  <PIButton variant="secondary" onClick={handleRefresh} className="text-sm">
                    Retry
                  </PIButton>
                </div>
              </div>
            </PICard>
          )}

          {isError && !isLoading && !missingToken && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
              <div className="font-semibold">Error loading requests</div>
              <div className="mt-1">{errorMessage}</div>
              <button
                onClick={handleRefresh}
                className="mt-3 inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && !missingToken && (
            <>
              <RequestsTable
                rows={paginatedRequests}
                sort={sort}
                onSortChange={handleSortChange}
                onRowClick={(row) => setSelectedRequest(row)}
              />
              <PaginationControls
                page={clampedPage}
                totalPages={totalPages}
                onPageChange={(nextPage) => setPage(nextPage)}
              />
            </>
          )}
        </main>
      </div>

      <RequestDrawer
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}
