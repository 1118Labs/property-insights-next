import { describe, expect, it, vi } from "vitest";
import { mapJobberEdgeToRecords, JobberRequestEdge, ensureJobberAccessToken, isTokenStale } from "@/lib/jobber";
import { JobberTokenRow } from "@/lib/types";

const sampleEdge: JobberRequestEdge = {
  node: {
    id: "req-1",
    title: "Test Request",
    status: "OPEN",
    createdAt: "2024-01-01T00:00:00Z",
    client: { id: "c1", firstName: "Ada", lastName: "Lovelace" },
    property: { id: "p1", address: { line1: "1 Binary Rd", city: "Code", province: "CA" } },
  },
};

describe("jobber mapping", () => {
  it("maps edges to records with defaults", () => {
    const { clientRecord, propertyRecord, requestRecord } = mapJobberEdgeToRecords(sampleEdge);
    expect(clientRecord.firstName).toBe("Ada");
    expect(propertyRecord.address.line1).toBe("1 Binary Rd");
    expect(requestRecord.jobberRequestId).toBe("req-1");
  });

  it("throws on invalid edges", () => {
    expect(() => mapJobberEdgeToRecords({ node: {} } as JobberRequestEdge)).toThrow();
  });

  it("refreshes stale tokens when refresh token exists", async () => {
    const stale: Partial<JobberTokenRow> = { access_token: "old", refresh_token: "refresh", expires_at: 0 };
    const refreshed: Partial<JobberTokenRow> = { access_token: "new", refresh_token: "refresh", expires_at: Date.now() / 1000 + 3600 };

    const refreshSpy: (token: string) => Promise<JobberTokenRow> = vi.fn().mockResolvedValue(refreshed as JobberTokenRow);
    const storeSpy: (row: Partial<JobberTokenRow> & { access_token: string }) => Promise<JobberTokenRow> =
      vi.fn().mockResolvedValue(refreshed as JobberTokenRow);

    const result = await ensureJobberAccessToken(stale as JobberTokenRow, {
      refresh: refreshSpy,
      store: storeSpy,
      getLatest: async () => stale as JobberTokenRow,
    });
    expect(result.accessToken).toBe("new");
    expect(result.tokenStatus).toBe("refreshed");
  });

  it("returns stale-no-refresh when no refresh token", async () => {
    const stale: Partial<JobberTokenRow> = { access_token: "old", expires_at: 0 };
    const result = await ensureJobberAccessToken(stale as JobberTokenRow, {
      refresh: async () => stale as JobberTokenRow,
      store: async () => stale as JobberTokenRow,
    });
    expect(result.tokenStatus).toBe("stale-no-refresh");
    expect(result.accessToken).toBe("old");
  });

  it("handles refresh failure gracefully", async () => {
    const stale: Partial<JobberTokenRow> = { access_token: "old", refresh_token: "refresh", expires_at: 0 };
    const refreshSpy: (token: string) => Promise<JobberTokenRow> = vi.fn().mockRejectedValue(new Error("fail"));
    const storeSpy: (row: Partial<JobberTokenRow> & { access_token: string }) => Promise<JobberTokenRow> =
      vi.fn().mockResolvedValue(stale as JobberTokenRow);

    const result = await ensureJobberAccessToken(stale as JobberTokenRow, {
      refresh: refreshSpy,
      store: storeSpy,
    });
    expect(result.tokenStatus).toBe("stale-refresh-failed");
    expect(result.accessToken).toBe("old");
  });

  it("logs stale detection paths", () => {
    const now = Date.now();
    const stale: Partial<JobberTokenRow> = { expires_at: Math.floor((now - 10_000) / 1000) };
    const fresh: Partial<JobberTokenRow> = { expires_at: Math.floor((now + 60 * 60 * 1000) / 1000) };
    console.debug("Testing token staleness", stale, fresh);
    expect(isTokenStale(stale as JobberTokenRow)).toBe(true);
    expect(isTokenStale(fresh as JobberTokenRow)).toBe(false);
  });
});
