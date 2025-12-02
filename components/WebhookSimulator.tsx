"use client";
import { useState } from "react";

const SAMPLE_EVENT = {
  id: "jobber-webhook-1",
  type: "request.created",
  createdAt: new Date().toISOString(),
  payload: {
    request: {
      id: "REQ-123",
      title: "Pressure wash driveway",
      status: "new",
      property: {
        id: "PROP-1",
        address: { line1: "123 Harbor Ln", city: "Southold", province: "NY", postalCode: "11971" },
      },
      client: { id: "CLIENT-1", firstName: "Jamie", lastName: "Chen" },
    },
  },
};

export function WebhookSimulator() {
  const [event, setEvent] = useState(JSON.stringify(SAMPLE_EVENT, null, 2));
  const [response, setResponse] = useState<string>("");

  const simulate = async () => {
    try {
      const parsed = JSON.parse(event);
      setResponse(JSON.stringify(parsed, null, 2));
    } catch (err) {
      setResponse("Invalid JSON: " + (err as Error).message);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Webhook simulator</p>
        <button onClick={simulate} className="rounded bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">Preview</button>
      </div>
      <textarea
        value={event}
        onChange={(e) => setEvent(e.target.value)}
        className="mt-2 h-40 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      <pre className="mt-2 max-h-32 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-100">{response || "Ready"}</pre>
    </div>
  );
}
