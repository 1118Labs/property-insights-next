import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminPage from "@/app/admin/page";

describe("admin page render without supabase", () => {
  it("renders and shows guidance links", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({}), ok: true })) as unknown as typeof fetch);
    render(<AdminPage />);
    expect(await screen.findByText(/Jobber Connection/)).toBeDefined();
    expect(screen.getByText(/Getting Started/)).toBeDefined();
  });
});
