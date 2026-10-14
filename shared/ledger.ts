export type TransactionKind = "expense" | "income";
export type Transaction = {
  id: string;
  kind: TransactionKind;
  amountCents: number;
  categoryId: string;
  note: string;
  date: string;
  updatedAt: string;
};
export type Category = {
  id: string;
  name: string;
  kind: TransactionKind;
  color: string;
  icon: string;
  builtIn?: boolean;
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
  currency: "USD",
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
export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];
export const currencySymbol = (currency: string) =>
  ({ USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$", JPY: "¥" })[
    currency
  ] ?? `${currency} `;
export function formatMoney(cents: number, currency = "USD") {
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
