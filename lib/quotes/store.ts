import { Quote } from "@/lib/quotes/quote";
import { randomUUID } from "crypto";

type QuoteRecord = {
  id: string;
  versions: Quote[];
  audit: Array<{ at: string; total: number; serviceProfile: string; propertyId?: string | null }>;
};

const store = new Map<string, QuoteRecord>();

export function saveQuote(q: Quote): Quote {
  const id = q.id || randomUUID();
  const existing = store.get(id);
  const version = existing ? existing.versions.length + 1 : 1;
  const quote: Quote = { ...q, id, version, createdAt: q.createdAt || new Date().toISOString() };
  if (existing) {
    existing.versions.push(quote);
    existing.audit.push({ at: quote.createdAt, total: quote.total, serviceProfile: quote.serviceProfile, propertyId: quote.propertyId });
    store.set(id, existing);
  } else {
    store.set(id, { id, versions: [quote], audit: [{ at: quote.createdAt, total: quote.total, serviceProfile: quote.serviceProfile, propertyId: quote.propertyId }] });
  }
  return quote;
}

export function getQuote(id: string, version?: number): Quote | null {
  const record = store.get(id);
  if (!record) return null;
  if (version && version > 0 && version <= record.versions.length) {
    return record.versions[version - 1];
  }
  return record.versions[record.versions.length - 1];
}

export function listQuotes() {
  return Array.from(store.values()).map((r) => r.versions[r.versions.length - 1]);
}

export function getAuditLog(id: string) {
  return store.get(id)?.audit || [];
}
