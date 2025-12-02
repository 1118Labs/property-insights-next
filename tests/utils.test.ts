import { describe, expect, it } from "vitest";
import { isNonEmptyString, toNumberOrNull, pickFirst } from "@/lib/utils/validation";
import { withRetry } from "@/lib/utils/retry";

describe("validation utils", () => {
  it("checks non-empty strings", () => {
    expect(isNonEmptyString("abc")).toBe(true);
    expect(isNonEmptyString("  ")).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
  });

  it("parses numbers safely", () => {
    expect(toNumberOrNull(5)).toBe(5);
    expect(toNumberOrNull("10")).toBe(10);
    expect(toNumberOrNull("bad")).toBeNull();
  });

  it("picks first non-null", () => {
    expect(pickFirst(null, undefined, "hello", "later")).toBe("hello");
    expect(pickFirst()).toBeNull();
  });
});

describe("retry util", () => {
  it("retries failing operations", async () => {
    let attempts = 0;
    const value = await withRetry(async () => {
      attempts += 1;
      if (attempts < 2) throw new Error("fail");
      return "ok";
    }, { attempts: 3, delayMs: 5 });
    expect(value).toBe("ok");
    expect(attempts).toBe(2);
  });
});
