import { notFound } from "next/navigation";
import { ClientPortalLayout } from "@/components/ClientPortalLayout";
import { ClientQuoteView } from "@/components/ClientQuoteView";
import { PortalHero } from "@/components/portal/PortalHero";
import { formatAddress } from "@/lib/utils/address";
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

async function fetchQuote(quoteId?: string | null) {
  if (!quoteId) return null;
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/quote/${quoteId}`, { cache: "no-store" });
  if (!res.ok) return null;
  const body = await res.json();
  return body.data;
}

export default async function PortalQuotePage({ params }: { params: { token: string } }) {
  const sessionRes = await fetchSession(params.token);
  if (!sessionRes?.data) return notFound();
  const session = sessionRes.data;
  const profile = session.propertyId ? await fetchProfile(session.propertyId) : null;
  const quote = await fetchQuote(session.quoteId);
  return (
    <ClientPortalLayout>
      <PortalHero
        title="Your Quote"
        subtitle={
          profile ? `Prepared for: ${formatAddress(profile.property.address)}` : "Client-ready summary"
        }
      />
      <ClientQuoteView quote={quote} />
    </ClientPortalLayout>
  );
}
