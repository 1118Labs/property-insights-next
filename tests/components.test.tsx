import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreBadge } from "@/components/ScoreBadge";
import { RiskPills } from "@/components/RiskPills";
import { PropertyInsightCard } from "@/components/PropertyInsightCard";
import { ProviderDiagnosticsDashboard } from "@/components/ProviderDiagnosticsDashboard";
import { RiskFactorBreakdown } from "@/components/RiskFactorBreakdown";
import { AddressNormalizePreview } from "@/components/AddressNormalizePreview";
import { PropertyProfile } from "@/lib/types";

const mockProfile: PropertyProfile = {
  property: { address: { line1: "123 Test" } },
  insights: {
    score: 75,
    breakdown: { livability: 50, efficiency: 50, marketStrength: 50, risk: 50, lotAppeal: 40, ageFactor: 60, equityDelta: 55 },
    riskFlags: [],
    recommendations: [],
    summary: "Test summary",
    lastUpdated: new Date().toISOString(),
    source: "test",
  },
};

describe("components", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders score badge quality labels", () => {
    render(<ScoreBadge score={85} />);
    expect(screen.getByText(/High quality/)).toBeDefined();
  });

  it("renders preset risk pills", () => {
    render(<RiskPills flags={[]} />);
    expect(screen.getByText(/Zoning risk/)).toBeTruthy();
  });

  it("renders insight card with compare variant", () => {
    render(<PropertyInsightCard profile={mockProfile} variant="compare" />);
    expect(screen.getByText(/123 Test/)).toBeDefined();
    expect(screen.getByText(/Insight/)).toBeDefined();
  });

  it("renders provider diagnostics with mocked fetch", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ providers: [{ label: "zillow", configured: true, uptime: 1 }] }),
        ok: true,
      })
    ) as unknown as typeof fetch;
    vi.stubGlobal("fetch", mockFetch);
    render(<ProviderDiagnosticsDashboard autoRefreshMs={0} />);
    expect(await screen.findByText(/zillow/)).toBeDefined();
  });

  it("renders risk factor breakdown", () => {
    render(<RiskFactorBreakdown breakdown={mockProfile.insights.breakdown} flags={[{ code: "TEST", label: "Test", severity: "low" }]} />);
    expect(screen.getByText(/Risk factors/)).toBeTruthy();
  });

  it("normalizes address input", () => {
    render(<AddressNormalizePreview initial={{ line1: "1 St", city: "X" }} />);
    expect(screen.getByText(/Normalized/)).toBeTruthy();
  });
});
