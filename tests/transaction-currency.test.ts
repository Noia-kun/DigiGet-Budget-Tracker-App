import { expect, it } from "vitest";
import {
  EMPTY_SNAPSHOT,
  withTransactionCurrency,
  type Transaction,
} from "../shared/ledger";

const tx = (currency?: string): Transaction => ({
  id: "a",
  kind: "expense",
  amountCents: 100,
  categoryId: "food",
  note: "",
  date: "2026-01-01",
  updatedAt: "2026-01-01T00:00:00.000Z",
  currency,
});

it("fills a missing currency with the snapshot's currency", () => {
  const s = {
    ...EMPTY_SNAPSHOT,
    preferences: { ...EMPTY_SNAPSHOT.preferences, currency: "QAR" },
    transactions: [tx(), tx("USD")],
  };
  expect(withTransactionCurrency(s).transactions.map((t) => t.currency)).toEqual([
    "QAR",
    "USD",
  ]);
});