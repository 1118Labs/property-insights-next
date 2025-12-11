import { notFound } from "next/navigation";
import { ClientPortalLayout } from "@/components/ClientPortalLayout";
import ClientInsightCard from "@/components/ClientInsightCard";
import { ClientQuoteView } from "@/components/ClientQuoteView";
import { PropertyProfile } from "@/lib/types";
import { formatAddress } from "@/lib/utils/address";
import { PortalHero } from "@/components/portal/PortalHero";

export const DEMO_TOKEN_PREFIX = "demo-";

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

export default async function PortalPage(props: { params: Promise<{ token: string }> }) {
  const resolved = await props.params;
  const token = resolved.token;

  // Safety check: if no token, return 404
  if (!token) {
    return <div>Missing token</div>;
  }

  // Support demo preview tokens such as "demo-preview-token-123"
  if (token.startsWith(DEMO_TOKEN_PREFIX)) {
    return (
      <ClientPortalLayout>
        <PortalHero title="Demo Preview" subtitle={`This is a demo portal preview for: ${token}`} />
      </ClientPortalLayout>
    );
  }

  // ORIGINAL PORTAL LOGIC BELOW — leave untouched
  // ------------------------------------------------
  // Load the real client or property portal content
  return <RealPortalPage token={token} />;
}

async function RealPortalPage({ token }: { token: string }) {
  const sessionRes = await fetchSession(token);
  if (!sessionRes?.data) return notFound();
  const session = sessionRes.data;
  const profile = await fetchProfile(session.propertyId);
  if (!profile) return notFound();
  const quote = await fetchQuote(session.quoteId);
  const address = formatAddress(profile.property.address);

  return (
    <ClientPortalLayout>
      <PortalHero title="Your Property Insights" subtitle={`Confidential link for: ${address}`} />
      <div className="space-y-4">
        <ClientInsightCard profile={profile} />
        <ClientQuoteView quote={quote} />
      </div>
    </ClientPortalLayout>
  );
}
