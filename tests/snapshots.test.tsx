import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ScoreBadge } from "@/components/ScoreBadge";
import { RiskPills } from "@/components/RiskPills";
import { HealthStatusBanner } from "@/components/HealthStatusBanner";

describe("snapshot core components", () => {
  it("matches snapshot for score badge", () => {
    const { container } = render(<ScoreBadge score={82} label="Score" />);
    expect(container).toMatchSnapshot();
  });

  it("matches snapshot for risk pills", () => {
    const { container } = render(<RiskPills flags={[]} />);
    expect(container).toMatchSnapshot();
  });

  it("matches snapshot for health banner", () => {
    const { container } = render(<HealthStatusBanner status="ok" supabase="ok" jobber="fresh" providerCount={2} />);
    expect(container).toMatchSnapshot();
  });
});
