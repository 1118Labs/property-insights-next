// app/admin/property-test/page.tsx
'use client';

import { useState } from 'react';

type RequestSummary = {
  id: string;
  title?: string;
  status?: string;
  createdAt?: string;
  clientName?: string;
  addressLine1?: string;
  city?: string;
};

type JobberRequestEdge = {
  node: {
    id: string;
    title?: string;
    status?: string;
    createdAt?: string;
    client?: { firstName?: string; lastName?: string };
    property?: { address?: { line1?: string; city?: string } };
  };
};

export default function PropertyTestPage() {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleConnectJobber = () => {
    // This hits our /api/jobber/authorize route
    window.location.href = '/api/jobber/authorize';
  };

  const handleFetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/jobber/requests');

      const body = (await res.json().catch(() => ({}))) as {
        data?: { requests?: { edges?: JobberRequestEdge[] } };
        error?: string;
      };

      if (!res.ok) {
        throw new Error(body?.error || `Request failed with status ${res.status}`);
      }

      // Map the GraphQL result into a simple array
      const edges: JobberRequestEdge[] = body?.data?.requests?.edges ?? [];
      const summaries: RequestSummary[] = edges.map((edge) => {
        const clientName = [edge.node.client?.firstName, edge.node.client?.lastName]
          .filter(Boolean)
          .join(' ')
          .trim();

        return {
          id: edge.node.id,
          title: edge.node.title || undefined,
          status: edge.node.status || undefined,
          createdAt: edge.node.createdAt || undefined,
          clientName: clientName || undefined,
          addressLine1: edge.node.property?.address?.line1,
          city: edge.node.property?.address?.city,
        };
      });

      setRequests(summaries);
    } catch (err) {
      console.error('Error fetching Jobber requests:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-8 space-y-8 border border-slate-100">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Property Insights — Dev Shell
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            This page is wired to the live Netlify + Jobber OAuth flow.
            Use it to test pulling recent <strong>Jobber Requests</strong>.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handleConnectJobber}
            className="inline-flex items-center justify-center rounded-lg border border-emerald-500 bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition"
          >
            Connect Jobber
          </button>

          <button
            type="button"
            onClick={handleFetchRequests}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Loading Requests…' : 'Fetch Jobber Requests'}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {requests.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Recent Jobber Requests
            </h2>
            <ul className="space-y-2 max-h-80 overflow-auto">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-900">
                      {r.title || 'Untitled Request'}
                    </span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                      {r.status || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="mt-1 text-slate-700">
                    {r.clientName && <span>{r.clientName}</span>}
                    {r.clientName && (r.addressLine1 || r.city) && <span> • </span>}
                    {(r.addressLine1 || r.city) && (
                      <span>
                        {[r.addressLine1, r.city].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                  {r.createdAt && (
                    <div className="mt-1 text-xs text-slate-500">
                      Created at: {new Date(r.createdAt).toLocaleString()}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {requests.length === 0 && !error && (
          <p className="text-xs text-slate-500">
            No requests loaded yet. Click <strong>Fetch Jobber Requests</strong> after
            connecting Jobber.
          </p>
        )}
      </div>
    </main>
  );
}
