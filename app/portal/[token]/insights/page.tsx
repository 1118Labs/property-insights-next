import { notFound } from "next/navigation";
import { ClientPortalLayout } from "@/components/ClientPortalLayout";
import { ClientInsightCard } from "@/components/ClientInsightCard";
import { PropertyProfile } from "@/lib/types";

async function fetchSession(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/portal/verify?token=${token}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function fetchProfile(propertyId: string): Promise<PropertyProfile | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/properties/${propertyId}`, { cache: "no-store" });
  if (!res.ok) return null;
  const body = await res.json();
  return body.data as PropertyProfile;
}

export default async function PortalInsightsPage({ params }: { params: { token: string } }) {
  const sessionRes = await fetchSession(params.token);
  if (!sessionRes?.data) return notFound();
  const session = sessionRes.data;
  const profile = await fetchProfile(session.propertyId);
  if (!profile) return notFound();

  return (
    <ClientPortalLayout>
      <ClientInsightCard profile={profile} />
    </ClientPortalLayout>
  );
}
