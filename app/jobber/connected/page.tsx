"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import PIButton from "@/components/ui/PIButton";

export default function JobberConnectedPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <section className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
        <div className="flex justify-center">
          <CheckCircleIcon className="h-12 w-12 text-emerald-500" aria-hidden />
        </div>
        <div className="mt-4 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Your Jobber account is now connected</h1>
          <p className="text-sm text-gray-600">You can now sync clients, properties, and requests.</p>
        </div>
        <div className="mt-6 flex justify-center">
          <PIButton href="/dashboard">Go to Dashboard</PIButton>
        </div>
      </section>
    </main>
  );
}
