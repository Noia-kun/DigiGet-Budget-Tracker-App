import { describe, expect, it } from "vitest";
import { convertCents, convertTransactions } from "../shared/rates";

const rates = { USD: 1, QAR: 3.64, PHP: 58 };

describe("convertCents", () => {
  it("keeps the amount for the same currency", () => {
    expect(convertCents(12345, "PHP", "PHP", rates)).toBe(12345);
  });
  it("converts through USD", () => {
    expect(convertCents(364, "QAR", "USD", rates)).toBe(100);
    expect(convertCents(100, "USD", "PHP", rates)).toBe(5800);
    expect(convertCents(364, "QAR", "PHP", rates)).toBe(5800);
  });
  it("leaves unknown currencies unconverted", () => {
    expect(convertCents(500, "XXX", "USD", rates)).toBe(500);
  });
});

describe("convertTransactions", () => {
  const base = {
    id: "a",
    kind: "expense" as const,
    categoryId: "food",
    note: "",
    date: "2026-01-01",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
  it("converts to the display currency without changing the input", () => {
    const items = [
      { ...base, amountCents: 5800, currency: "PHP" },
      { ...base, id: "b", amountCents: 100, currency: "USD" },
    ];
    const out = convertTransactions(items, "USD", rates);
    expect(out.map((t) => t.amountCents)).toEqual([100, 100]);
    expect(out.every((t) => t.currency === "USD")).toBe(true);
    expect(items[0].amountCents).toBe(5800);
  });
});