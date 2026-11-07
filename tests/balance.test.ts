import { expect, it } from "vitest";
import { balanceThrough, type Transaction } from "../shared/ledger";

const tx = (
  id: string,
  kind: "income" | "expense",
  amountCents: number,
  date: string,
): Transaction => ({
  id,
  kind,
  amountCents,
  categoryId: "food",
  note: "",
  date,
  updatedAt: "2026-01-01T00:00:00.000Z",
});

it("carries the balance over months and ignores later months", () => {
  const items = [
    tx("a", "income", 100000, "2026-09-15"),
    tx("b", "expense", 30000, "2026-09-20"),
    tx("c", "expense", 10000, "2026-10-02"),
    tx("d", "income", 5000, "2026-11-01"),
  ];
  expect(balanceThrough(items, new Date(2026, 8, 1))).toBe(70000);
  expect(balanceThrough(items, new Date(2026, 9, 1))).toBe(60000);
  expect(balanceThrough(items, new Date(2026, 10, 1))).toBe(65000);
});