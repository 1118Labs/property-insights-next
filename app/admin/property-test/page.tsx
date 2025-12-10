'use client';

import { useState } from 'react';
import Image from 'next/image';
import PIButton from '@/components/ui/PIButton';

export default function PropertyTestPage() {
  const [loading, setLoading] = useState(false);
  const [rawBody, setRawBody] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [portalLink, setPortalLink] = useState<string>('');

  const handleConnectJobber = () => {
    window.location.href = '/api/jobber/authorize';
  };

  const handleFetchRequests = async () => {
    setLoading(true);
    setError(null);
    setRawBody(null);

    try {
      const res = await fetch('/api/jobber/requests');

      const body = (await res.json().catch(() => ({}))) as {
        requests?: unknown;
        error?: string;
        message?: string;
      };
      setRawBody(body);

      if (!res.ok) {
        if (body?.error === 'missing_token') {
          throw new Error('No Jobber connection found. Click Connect Jobber first.');
        }
        if (body?.error === 'callback_failed' || body?.error === 'token_resolution_failed') {
          throw new Error(body?.message || 'Jobber OAuth/token handling failed.');
        }
        throw new Error(body?.message || body?.error || `Request failed with status ${res.status}`);
      }
    } catch (err) {
      console.error('Error fetching Jobber requests:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePortalLink = async () => {
    setPortalLink('');
    try {
      const res = await fetch('/api/dev/generate-portal-link');
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to generate link.');
      }
      setPortalLink(data.url);
    } catch (err) {
      console.error('Error generating portal link:', err);
      setPortalLink('Error generating link.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] px-6 py-10 text-slate-900">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Image src="/brand/pi-logo.png" alt="Property Insights Logo" width={42} height={42} className="h-8 w-auto opacity-90" />
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-slate-900">
                Property Insights — Dev Shell
              </h1>
              <p className="text-sm text-slate-600">
                Developer-only diagnostics for Jobber OAuth and request pulls.
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Dev-only / diagnostics
              </span>
            </div>
            <a
              href="/dashboard"
              className="text-[#0A84FF] hover:underline font-medium"
            >
              ← Back to dashboard
            </a>
          </div>

          <div className="flex flex-wrap gap-3">
            <PIButton type="button" onClick={handleConnectJobber}>
              Connect Jobber (dev)
            </PIButton>

            <PIButton
              type="button"
              onClick={handleFetchRequests}
              disabled={loading}
              variant="secondary"
              className="disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading Requests…' : 'Fetch Jobber Requests (raw)'}
            </PIButton>

            <PIButton
              type="button"
              onClick={handleGeneratePortalLink}
              variant="secondary"
            >
              Generate Test Portal Link
            </PIButton>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {rawBody && !error && (
            <div className="w-full">
              <div className="text-xs font-semibold text-slate-600 mb-2">
                Raw response
              </div>
              <pre className="w-full overflow-auto rounded-lg bg-[#F5F5F7] text-slate-800 text-xs p-4 border border-slate-200">
                {JSON.stringify(rawBody, null, 2)}
              </pre>
            </div>
          )}

          {!rawBody && !error && (
            <p className="text-xs text-slate-500">
              Use the controls above to connect and fetch raw data. This view is intentionally
              barebones for debugging.
            </p>
          )}

          {portalLink && (
            <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
              <p className="font-semibold">Portal Test Link</p>
              <a
                href={portalLink}
                className="text-[#0A84FF] underline font-medium break-all"
                target="_blank"
                rel="noreferrer"
              >
                {portalLink}
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
