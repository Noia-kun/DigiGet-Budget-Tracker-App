export type TransactionKind = "expense" | "income";
export type Transaction = {
  id: string;
  kind: TransactionKind;
  amountCents: number;
  categoryId: string;
  note: string;
  date: string;
  updatedAt: string;
  currency?: string;
};
export type Category = {
  id: string;
  name: string;
  kind: TransactionKind;
  color: string;
  icon: string;
  builtIn?: boolean;
  archived?: boolean;
};
export type Preferences = {
  currency: string;
  reminderEnabled: boolean;
  reminderTime: string;
};
export type LedgerSnapshot = {
  transactions: Transaction[];
  categories: Category[];
  preferences: Preferences;
  onboardingComplete: boolean;
  updatedAt: string;
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food & drink",
    kind: "expense",
    color: "#F3A47E",
    icon: "restaurant-outline",
    builtIn: true,
  },
  {
    id: "home",
    name: "Home",
    kind: "expense",
    color: "#89A7D2",
    icon: "home-outline",
    builtIn: true,
  },
  {
    id: "transport",
    name: "Transport",
    kind: "expense",
    color: "#DFBF62",
    icon: "train-outline",
    builtIn: true,
  },
  {
    id: "shopping",
    name: "Shopping",
    kind: "expense",
    color: "#C493BD",
    icon: "bag-outline",
    builtIn: true,
  },
  {
    id: "health",
    name: "Health",
    kind: "expense",
    color: "#7FB9A1",
    icon: "heart-outline",
    builtIn: true,
  },
  {
    id: "other-expense",
    name: "Other",
    kind: "expense",
    color: "#9A9C94",
    icon: "ellipsis-horizontal-circle-outline",
    builtIn: true,
  },
  {
    id: "salary",
    name: "Salary",
    kind: "income",
    color: "#4B9A72",
    icon: "briefcase-outline",
    builtIn: true,
  },
  {
    id: "freelance",
    name: "Freelance",
    kind: "income",
    color: "#83AE75",
    icon: "laptop-outline",
    builtIn: true,
  },
  {
    id: "other-income",
    name: "Other",
    kind: "income",
    color: "#8AA9B2",
    icon: "add-circle-outline",
    builtIn: true,
  },
];
export const DEFAULT_PREFERENCES: Preferences = {
  currency: "PHP",
  reminderEnabled: false,
  reminderTime: "20:00",
};
export const EMPTY_SNAPSHOT: LedgerSnapshot = {
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  preferences: DEFAULT_PREFERENCES,
  onboardingComplete: false,
  updatedAt: new Date(0).toISOString(),
};
export const CURRENCIES = ["PHP", "QAR", "USD", "EUR", "GBP", "CAD", "AUD", "JPY"];
export const currencySymbol = (currency: string) =>
  ({
    PHP: "₱",
    QAR: "QR",
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
    JPY: "¥",
  })[currency] ?? `${currency} `;
export function formatMoney(
  cents: number,
  currency = DEFAULT_PREFERENCES.currency,
) {
  const value = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(value);
  } catch {
    return `${currencySymbol(currency)}${value.toFixed(2)}`;
  }
}
export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
export const monthLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
export const monthTransactions = (items: Transaction[], date: Date) =>
  items.filter((item) => item.date.startsWith(monthKey(date)));
export const monthTotals = (items: Transaction[]) =>
  items.reduce(
    (total, item) => {
      if (item.kind === "income") total.income += item.amountCents;
      else total.expense += item.amountCents;
      return total;
    },
    { income: 0, expense: 0 },
  );

const isKind = (v: unknown) => v === "income" || v === "expense";
const isTransaction = (v: unknown) => {
  const t = v as Partial<Transaction> | null;
  return (
    !!t &&
    typeof t.id === "string" &&
    isKind(t.kind) &&
    Number.isFinite(t.amountCents) &&
    typeof t.categoryId === "string" &&
    typeof t.note === "string" &&
    typeof t.date === "string" &&
    (t.currency === undefined || typeof t.currency === "string") &&
    typeof t.updatedAt === "string"
  );
};
const isCategory = (v: unknown) => {
  const c = v as Partial<Category> | null;
  return (
    !!c &&
    typeof c.id === "string" &&
    typeof c.name === "string" &&
    isKind(c.kind) &&
    typeof c.color === "string" &&
    typeof c.icon === "string"
  );
};

export const makeBackup = (snapshot: LedgerSnapshot) =>
  JSON.stringify({ app: "digiget", version: 1, snapshot });

// Returns the snapshot, or null if the text is not a valid DigiGet backup.
export function parseBackup(text: string): LedgerSnapshot | null {
  try {
    const parsed = JSON.parse(text);
    const s = parsed?.snapshot as Partial<LedgerSnapshot> | undefined;
    const p = s?.preferences as Partial<Preferences> | undefined;
    const valid =
      parsed?.app === "digiget" &&
      !!s &&
      Array.isArray(s.transactions) &&
      s.transactions.every(isTransaction) &&
      Array.isArray(s.categories) &&
      s.categories.every(isCategory) &&
      typeof p?.currency === "string" &&
      typeof p?.reminderEnabled === "boolean" &&
      typeof p?.reminderTime === "string" &&
      typeof s.onboardingComplete === "boolean" &&
      typeof s.updatedAt === "string";
    return valid ? (s as LedgerSnapshot) : null;
  } catch {
    return null;
  }
}
// Entries saved before per-transaction currency existed get the snapshot's currency.
export const withTransactionCurrency = (s: LedgerSnapshot): LedgerSnapshot => {
  const fallback = s.preferences?.currency || DEFAULT_PREFERENCES.currency;
  return {
    ...s,
    transactions: s.transactions.map((t) =>
      t.currency ? t : { ...t, currency: fallback },
    ),
  };
};
