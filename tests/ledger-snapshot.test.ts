import { describe, expect, it } from "vitest";
import { snapshotSchema } from "../server/routers";
import { DEFAULT_CATEGORIES, DEFAULT_PREFERENCES } from "../shared/ledger";

describe("ledger snapshot validation", () => {
  it("preserves archived category state for remote sync", () => {
    const parsed = snapshotSchema.parse({
      transactions: [],
      categories: [{ ...DEFAULT_CATEGORIES[0], archived: true }],
      preferences: DEFAULT_PREFERENCES,
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    });

    expect(parsed.categories[0].archived).toBe(true);
  });
});
