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