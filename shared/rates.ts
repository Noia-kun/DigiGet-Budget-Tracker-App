import { CURRENCIES, type Transaction } from "./ledger";

export type Rates = Record<string, number>;

// Units of each currency per 1 USD. Approximate offline fallback (mid-2026);
// QAR is pegged at 3.64. Live rates replace these when online.
export const FALLBACK_RATES: Rates = {
  USD: 1,
  QAR: 3.64,
  PHP: 58,
  EUR: 0.86,
  GBP: 0.75,
  CAD: 1.38,
  AUD: 1.5,
  JPY: 150,
};

export function convertCents(
  cents: number,
  from: string,
  to: string,
  rates: Rates = FALLBACK_RATES,
) {
  if (from === to) return cents;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return cents; // unknown currency: leave unconverted
  return Math.round((cents / fromRate) * toRate);
}

export function convertTransactions(
  items: Transaction[],
  display: string,
  rates: Rates = FALLBACK_RATES,
): Transaction[] {
  return items.map((t) => {
    const from = t.currency ?? display;
    if (from === display) return t;
    return {
      ...t,
      amountCents: convertCents(t.amountCents, from, display, rates),
      currency: display,
    };
  });
}

// Overlays valid live values onto the bundled table. Returns null if nothing usable.
export function mergeRates(live: unknown): Rates | null {
  const source = (live as { rates?: Record<string, unknown> } | null)?.rates;
  if (!source || typeof source !== "object") return null;
  const out: Rates = { ...FALLBACK_RATES };
  let any = false;
  for (const code of CURRENCIES) {
    const value = source[code];
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      out[code] = value;
      any = true;
    }
  }
  return any ? out : null;
}