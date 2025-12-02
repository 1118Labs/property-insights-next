import { describe, expect, it } from "vitest";
import { renderQuoteHTML } from "@/lib/quotes/templates/base";
import { buildQuote } from "@/lib/quotes/builder";
import { buildProfileFromRecord, mockProperty } from "@/lib/insights";

describe("quote snapshot", () => {
  it("renders HTML with totals", () => {
    const profile = buildProfileFromRecord(mockProperty("456 Snapshot"));
    const quote = buildQuote(profile, "cleaning");
    const html = renderQuoteHTML(quote);
    expect(html).toContain("Service Quote");
    expect(html).toContain(quote.serviceProfile);
    expect(html).toContain("Total");
  });
});
