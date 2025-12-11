import {
  ArrowTrendingUpIcon,
  LinkIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const steps = [
  {
    title: "Connect your Jobber account",
    body: "Authenticate once and we’ll keep properties and requests in sync.",
    icon: LinkIcon,
  },
  {
    title: "Pick a client property",
    body: "Select a property to enrich with AI, aerial context, and history.",
    icon: MapPinIcon,
  },
  {
    title: "Get instant insights + ready-to-send quotes",
    body: "Deliver clean, trustworthy summaries and PDF-ready quotes for clients.",
    icon: ArrowTrendingUpIcon,
  },
];

export function HowItWorks() {
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-md">
      <h2 className="text-xl font-semibold text-gray-900">How it works</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
              <step.icon className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
            <p className="text-sm text-gray-600">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
