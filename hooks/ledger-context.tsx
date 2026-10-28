import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PREFERENCES,
  type Category,
  type LedgerSnapshot,
  type Preferences,
  type Transaction,
  withTransactionCurrency,
} from "@/shared/ledger";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { Alert } from "react-native";

type LedgerContextValue = {
  restoreSnapshot: (snapshot: LedgerSnapshot) => void;
  data: LedgerSnapshot;
  ready: boolean;
  onboardingComplete: boolean;
  saveTransaction: (item: Transaction) => void;
  deleteTransaction: (id: string) => void;
  saveCategory: (category: Category) => void;
  archiveCategory: (id: string) => boolean;
  restoreCategory: (id: string) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  finishOnboarding: () => void;
  restartOnboarding: () => void;
};
const STORAGE_KEY = "pocket-ledger.v1";
const LedgerContext = createContext<LedgerContextValue | null>(null);
const newSnapshot = (): LedgerSnapshot => ({
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  preferences: DEFAULT_PREFERENCES,
  onboardingComplete: false,
  updatedAt: new Date(0).toISOString(),
});
const looksLikeSnapshot = (value: unknown): value is LedgerSnapshot => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LedgerSnapshot>;
  return (
    Array.isArray(candidate.transactions) &&
    Array.isArray(candidate.categories) &&
    !!candidate.preferences &&
    typeof candidate.onboardingComplete === "boolean" &&
    typeof candidate.updatedAt === "string"
  );
};

export function LedgerProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<LedgerSnapshot>(newSnapshot);
  const [ready, setReady] = useState(false);
  const latest = useRef(data);
  useEffect(() => {
    latest.current = data;
  }, [data]);

  const writeSnapshot = useCallback(async (next: LedgerSnapshot) => {
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    latest.current = stamped;
    setData(stamped);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ snapshot: stamped }));
    } catch {
      Alert.alert(
        "Couldn’t save",
        "Your last change wasn’t saved to this phone. Free up storage and try again.",
      );
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const parsed = raw ? JSON.parse(raw) : null;
        if (looksLikeSnapshot(parsed?.snapshot)) {
          const migrated = withTransactionCurrency(parsed.snapshot);
          latest.current = migrated;
          setData(migrated);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const saveTransaction = useCallback(
    (item: Transaction) => {
      const prior = latest.current;
      const exists = prior.transactions.some((entry) => entry.id === item.id);
      const transactions = exists
        ? prior.transactions.map((entry) =>
            entry.id === item.id ? item : entry,
          )
        : [item, ...prior.transactions];
      void writeSnapshot({ ...prior, transactions });
    },
    [writeSnapshot],
  );
  const deleteTransaction = useCallback(
    (id: string) => {
      const prior = latest.current;
      void writeSnapshot({
        ...prior,
        transactions: prior.transactions.filter((item) => item.id !== id),
      });
    },
    [writeSnapshot],
  );
  const saveCategory = useCallback(
    (category: Category) => {
      const prior = latest.current;
      const exists = prior.categories.some((item) => item.id === category.id);
      const categories = exists
        ? prior.categories.map((item) =>
            item.id === category.id ? category : item,
          )
        : [...prior.categories, category];
      void writeSnapshot({ ...prior, categories });
    },
    [writeSnapshot],
  );
  const archiveCategory = useCallback(
    (id: string) => {
      const prior = latest.current;
      const target = prior.categories.find((category) => category.id === id);
      if (!target || target.archived) return false;
      const activeCount = prior.categories.filter(
        (category) => category.kind === target.kind && !category.archived,
      ).length;
      if (activeCount <= 1) return false;
      const categories = prior.categories.map((category) =>
        category.id === id ? { ...category, archived: true } : category,
      );
      void writeSnapshot({ ...prior, categories });
      return true;
    },
    [writeSnapshot],
  );
  const restoreCategory = useCallback(
    (id: string) => {
      const prior = latest.current;
      const target = prior.categories.find((category) => category.id === id);
      if (!target?.archived) return;
      const categories = prior.categories.map((category) =>
        category.id === id ? { ...category, archived: false } : category,
      );
      void writeSnapshot({ ...prior, categories });
    },
    [writeSnapshot],
  );
  const updatePreferences = useCallback(
    (patch: Partial<Preferences>) => {
      void writeSnapshot({
        ...latest.current,
        preferences: { ...latest.current.preferences, ...patch },
      });
    },
    [writeSnapshot],
  );
  const finishOnboarding = useCallback(() => {
    void writeSnapshot({ ...latest.current, onboardingComplete: true });
  }, [writeSnapshot]);
  const restartOnboarding = useCallback(() => {
    void writeSnapshot({ ...latest.current, onboardingComplete: false });
  }, [writeSnapshot]);
  const restoreSnapshot = useCallback(
    (snapshot: LedgerSnapshot) => {
      void writeSnapshot(withTransactionCurrency(snapshot));
    },
    [writeSnapshot],
  );
  const value = useMemo(
    () => ({
      restoreSnapshot,
      data,
      ready,
      onboardingComplete: data.onboardingComplete,
      saveTransaction,
      deleteTransaction,
      saveCategory,
      archiveCategory,
      restoreCategory,
      updatePreferences,
      finishOnboarding,
      restartOnboarding,
    }),
    [
      restoreSnapshot,
      data,
      ready,
      saveTransaction,
      deleteTransaction,
      saveCategory,
      archiveCategory,
      restoreCategory,
      updatePreferences,
      finishOnboarding,
      restartOnboarding,
    ],
  );
  return (
    <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
  );
}
export function useLedger() {
  const value = useContext(LedgerContext);
  if (!value) throw new Error("useLedger must be used inside LedgerProvider");
  return value;
}
