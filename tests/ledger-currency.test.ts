import { describe, expect, it } from "vitest";
import {
  CURRENCIES,
  DEFAULT_PREFERENCES,
  currencySymbol,
} from "../shared/ledger";

describe("Philippine peso support", () => {
  it("is available and selected for new installations", () => {
    expect(CURRENCIES[0]).toBe("PHP");
    expect(CURRENCIES).toContain("PHP");
    expect(DEFAULT_PREFERENCES.currency).toBe("PHP");
    expect(currencySymbol("PHP")).toBe("₱");
  });
});
