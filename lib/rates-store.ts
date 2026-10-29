import AsyncStorage from "@react-native-async-storage/async-storage";
import { mergeRates, type Rates } from "@/shared/rates";

const KEY = "digiget.rates.v1";
const RATES_URL = "https://open.er-api.com/v6/latest/USD";
export const STALE_MS = 12 * 60 * 60 * 1000;

export type StoredRates = { rates: Rates; fetchedAt: number };

export async function loadCachedRates(): Promise<StoredRates | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const rates = mergeRates({ rates: parsed?.rates });
    return rates && typeof parsed.fetchedAt === "number"
      ? { rates, fetchedAt: parsed.fetchedAt }
      : null;
  } catch {
    return null;
  }
}

// Returns null on any failure (offline, timeout, bad response).
export async function fetchLiveRates(): Promise<StoredRates | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(RATES_URL, { signal: controller.signal });
    if (!response.ok) return null;
    const body = await response.json();
    const rates = body?.result === "success" ? mergeRates(body) : null;
    if (!rates) return null;
    const stored = { rates, fetchedAt: Date.now() };
    await AsyncStorage.setItem(KEY, JSON.stringify(stored)).catch(() => {});
    return stored;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}