import { FeatureGrid } from "@/components/homepage/FeatureGrid";
import { Hero } from "@/components/homepage/Hero";
import { HowItWorks } from "@/components/homepage/HowItWorks";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <footer className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-4 text-xs text-gray-400 shadow-sm">
        © 2025 Property Insights by 1118 Labs
      </footer>
    </main>
  );
}
