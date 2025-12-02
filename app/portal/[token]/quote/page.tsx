import { notFound } from "next/navigation";
import { ClientPortalLayout } from "@/components/ClientPortalLayout";
import { ClientQuoteView } from "@/components/ClientQuoteView";

async function fetchSession(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/portal/verify?token=${token}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
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
  const quote = await fetchQuote(session.quoteId);
  return (
    <ClientPortalLayout>
      <ClientQuoteView quote={quote} />
    </ClientPortalLayout>
  );
}
