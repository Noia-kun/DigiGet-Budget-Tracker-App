import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Platform } from "react-native";
import { trpc } from "@/lib/trpc";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PREFERENCES,
  type Category,
  type LedgerSnapshot,
  type Preferences,
  type Transaction,
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

type SyncState = "loading" | "synced" | "pending" | "offline";
type LedgerContextValue = {
  data: LedgerSnapshot;
  ready: boolean;
  syncState: SyncState;
  onboardingComplete: boolean;
  saveTransaction: (item: Transaction) => void;
  deleteTransaction: (id: string) => void;
  saveCategory: (category: Category) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  finishOnboarding: () => void;
  restartOnboarding: () => void;
  syncNow: () => Promise<void>;
};
const STORAGE_KEY = "pocket-ledger.v1";
const LedgerContext = createContext<LedgerContextValue | null>(null);
const makeDeviceId = () =>
  `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
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
  const api = trpc.useUtils();
  const saveSnapshot = trpc.ledger.saveSnapshot.useMutation();
  const [data, setData] = useState<LedgerSnapshot>(newSnapshot);
  const [ready, setReady] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [syncState, setSyncState] = useState<SyncState>("loading");
  const latest = useRef(data);
  const syncQueue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    latest.current = data;
  }, [data]);

  const enqueue = useCallback((work: () => Promise<void>) => {
    const task = syncQueue.current.then(work);
    syncQueue.current = task.catch(() => undefined);
    return task;
  }, []);

  const writeSnapshot = useCallback(
    async (next: LedgerSnapshot) => {
      const stamped = { ...next, updatedAt: new Date().toISOString() };
      latest.current = stamped;
      setData(stamped);
      setSyncState("pending");
      try {
        const id = deviceId || makeDeviceId();
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ deviceId: id, snapshot: stamped }),
        );
        if (!deviceId) return;
        await enqueue(async () => {
          setSyncState("pending");
          try {
            // Read the latest snapshot when this queued write runs, so rapid edits
            // cannot let an older request finish last and overwrite newer state.
            await saveSnapshot.mutateAsync({
              deviceId,
              snapshot: JSON.stringify(latest.current),
            });
            setSyncState("synced");
          } catch {
            setSyncState("offline");
          }
        });
      } catch {
        setSyncState("offline");
      }
    },
    [deviceId, enqueue, saveSnapshot.mutateAsync],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        const id =
          typeof parsed?.deviceId === "string"
            ? parsed.deviceId
            : makeDeviceId();
        const local = looksLikeSnapshot(parsed?.snapshot)
          ? parsed.snapshot
          : newSnapshot();
        if (!alive) return;
        setDeviceId(id);
        latest.current = local;
        setData(local);
        setReady(true);
        setSyncState("pending");
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ deviceId: id, snapshot: local }),
        );
      } catch {
        if (!alive) return;
        setDeviceId(makeDeviceId());
        setReady(true);
        setSyncState("offline");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const syncNow = useCallback(() => {
    if (!deviceId) return Promise.resolve();
    return enqueue(async () => {
      setSyncState("pending");
      try {
        const localAtStart = latest.current;
        const remote = await api.ledger.getSnapshot.fetch({ deviceId });
        let remoteData: LedgerSnapshot | null = null;
        if (remote?.snapshot) {
          try {
            const parsed: unknown = JSON.parse(remote.snapshot);
            remoteData = looksLikeSnapshot(parsed) ? parsed : null;
          } catch {
            remoteData = null;
          }
        }
        let local = latest.current;
        // Adopt a newer remote snapshot only if no local edit arrived during the read.
        if (
          remoteData &&
          new Date(remoteData.updatedAt).getTime() >
            new Date(localAtStart.updatedAt).getTime() &&
          latest.current.updatedAt === localAtStart.updatedAt
        ) {
          local = remoteData;
          latest.current = remoteData;
          setData(remoteData);
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ deviceId, snapshot: remoteData }),
          );
        }
        if (!remoteData || remoteData.updatedAt !== local.updatedAt) {
          await saveSnapshot.mutateAsync({
            deviceId,
            snapshot: JSON.stringify(local),
          });
        }
        setSyncState("synced");
      } catch {
        setSyncState("offline");
      }
    });
  }, [api, deviceId, enqueue, saveSnapshot.mutateAsync]);

  useEffect(() => {
    if (ready && deviceId) void syncNow();
  }, [ready, deviceId, syncNow]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && ready) void syncNow();
    });
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const reconnect = () => {
        if (ready) void syncNow();
      };
      window.addEventListener("online", reconnect);
      return () => {
        subscription.remove();
        window.removeEventListener("online", reconnect);
      };
    }
    return () => subscription.remove();
  }, [ready, syncNow]);

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
  const value = useMemo(
    () => ({
      data,
      ready,
      syncState,
      onboardingComplete: data.onboardingComplete,
      saveTransaction,
      deleteTransaction,
      saveCategory,
      updatePreferences,
      finishOnboarding,
      restartOnboarding,
      syncNow,
    }),
    [
      data,
      ready,
      syncState,
      saveTransaction,
      deleteTransaction,
      saveCategory,
      updatePreferences,
      finishOnboarding,
      restartOnboarding,
      syncNow,
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
