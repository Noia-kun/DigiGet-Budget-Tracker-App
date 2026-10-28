import { describe, expect, it } from "vitest";
import { convertCents } from "../shared/rates";

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