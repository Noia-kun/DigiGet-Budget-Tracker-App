# DigiGet UI Component Library

This export contains the app’s reusable React Native UI source, the shared ledger data contract it expects, and token references. It is a source bundle, not a separately versioned npm package. Components are designed for Expo/React Native, Expo Web, and `react-native-svg`.

## Source inventory

| File | Exports | Responsibility |
| --- | --- | --- |
| `src/components/ledger/Icon.tsx` | `Icon` | Inline SVG icon set; intentionally avoids runtime webfont loading. |
| `src/components/ledger/ui.tsx` | `C`, `shadow`, `page`, `BrandMark`, `SyncBanner`, `MonthPicker`, `TransactionRow`, `EmptyState`, `DonutChart`, `ConfirmDialog`, `TextField`, `LoadingState`, `SummaryMini`, `totalsFor` | Shared visual tokens, primitives, money-summary widgets, and recovery/status patterns. |
| `src/components/ledger/TransactionComposer.tsx` | `TransactionComposer` | Accessible modal sheet for adding/editing income or expense entries with inline validation and save feedback. |
| `src/shared/ledger.ts` | Ledger types, defaults and helpers | Data contract and date/currency/month calculations used by the UI. |
| `src/theme/theme.config.js` | `themeColors` | Starter-level semantic light/dark theme colors. The ledger screens currently use `C` as their direct visual palette. |
| `docs/DESIGN-TOKENS.md` | — | Color, typography, spacing, geometry, elevation, and behavior references. |
| `docs/COMPONENT-LIBRARY.md` | — | This component catalog and use guidance. |
| `tokens/design-tokens.json` | — | Machine-readable token snapshot. |

## Installation and import assumptions

The source bundle preserves its project-relative imports (`@/components/ledger/...` and `@/shared/ledger`). In another Expo project, copy `src/components/ledger` and `src/shared/ledger` into the project and either configure the same `@/` alias or update those imports. Runtime dependencies used by these files: `react`, `react-native`, `react-native-svg`, and standard Expo-compatible modal/input primitives supplied by React Native. The starter also uses TypeScript and React Native Safe Area Context at the screen layer.

`TransactionComposer` is a UI component, not a persistence adapter: its `onSave` callback should connect to the consuming app’s data store. `Icon` accepts arbitrary string names for compatibility with the category model; unsupported names render a simple outlined-circle fallback. All SVG paths are local inline geometry; no network fonts or image assets are required.

## Component APIs

### `Icon`

```tsx
<Icon name="book-outline" size={20} color="#2F7A58" />
```

Props: `name: string`, `size?: number` (default 20), `color?: ColorValue` (default `#17231C`). Supported names: `add`, `add-circle-outline`, `close`, `checkmark`, `checkmark-circle`, `chevron-down`, `chevron-back`, `chevron-forward`, `arrow-forward`, `grid-outline`, `receipt-outline`, `pie-chart-outline`, `settings-outline`, `person-outline`, `book-outline`, `leaf`, `leaf-outline`, `flash-outline`, `sparkles-outline`, `restaurant-outline`, `home-outline`, `train-outline`, `bag-outline`, `heart-outline`, `ellipsis-horizontal-circle-outline`, `briefcase-outline`, `laptop-outline`, `pricetag-outline`, `search-outline`, `options-outline`, `refresh-outline`, `cloud-offline-outline`, `cloud-upload-outline`, `trash-outline`, `arrow-down-circle-outline`, `arrow-up-circle-outline`, and `ellipse-outline`.

### Shared primitives (`ui.tsx`)

| Export | API / behavior |
| --- | --- |
| `BrandMark` | `size?: number` (default 34). DigiGet green rounded-square mark with a book/leaf motif. |
| `SyncBanner` | `state: "loading" \| "synced" \| "pending" \| "offline"`, `onRetry: () => void`. Hides for loading/synced; pending/offline states expose a retry button and explanatory copy. |
| `MonthPicker` | `date: Date`, `onChange: (next: Date) => void`. Previous/next month controls. |
| `TransactionRow` | `item: Transaction`, `category?: Category`, `currency: string`, `onPress: () => void`, `onDelete?: () => void`. Accessible edit row with optional delete action. |
| `EmptyState` | `title`, `text`, optional `action`, optional `onAction`. Reusable no-data/no-results treatment. |
| `DonutChart` | `items: { value: number; color: string }[]`, `size?: number` (default 142). SVG ring chart; pair with text labels/values rather than relying on color alone. |
| `ConfirmDialog` | `visible`, `title`, `message`, optional `confirmLabel` (default “Delete”), `onCancel`, `onConfirm`. Accessible destructive-action confirmation. |
| `TextField` | forwards React Native `TextInput` props; additionally supports `accessibilityLabel` and `style`. Uses shared field styling and placeholder color. |
| `LoadingState` | No props. Centered progress indicator and “Opening your ledger…” status. |
| `SummaryMini` | `title`, `value` (integer cents), optional `income`, `currency`. Compact amount summary tile. |
| `totalsFor` | `totalsFor(items: Transaction[])` returns `{ income, expense }` totals in integer cents. |

Shared styling exports: `C` is the canonical palette; `page.root`, `page.content`, `page.title`, `page.subtitle`, `page.card`, `page.sectionTitle`, `page.label`, `page.body`, and `page.row` provide screen foundations; `shadow` is platform aware.

### `TransactionComposer`

```tsx
<TransactionComposer
  visible={isOpen}
  categories={categories}
  currency="PHP"
  editing={transactionOrNull}
  onClose={closeSheet}
  onSave={saveTransaction}
/>
```

Props: `visible: boolean`, `categories: Category[]`, `currency: string`, optional `editing?: Transaction | null`, `onClose: () => void`, and `onSave: (item: Transaction) => void`. Provides an expense/income segmented switch, amount/category/date/note fields, validation, inline errors, and local-save confirmation. Dates use strict `YYYY-MM-DD`; notes are capped at 100 characters; category names/icons are supplied by the caller. The component builds a transaction ID/timestamp for new entries and preserves the ID when editing.

## Data contract

`Transaction` uses `amountCents` (integer cents), `kind` (`expense` or `income`), category ID, note, ISO day string, and update timestamp. `Category` includes ID/name/kind/color/icon, optional `builtIn`, and optional `archived`. Archived categories are excluded from new-entry choices but retain their labels in history and reports; they may be restored, and remain selectable when editing an existing transaction that already uses them. `Preferences` contains currency and reminder settings. New installations default to PHP (Philippine peso); existing saved currency preferences are preserved. `LedgerSnapshot` groups transactions, categories, preferences, onboarding completion, and update time. Default categories/prefs and formatting/month helpers are in `src/shared/ledger.ts`.

## Screen-level composition in the app

The library is assembled into four routes: **Home** combines `BrandMark`, `SyncBanner`, `MonthPicker`, balance and summary tiles, category `DonutChart`, `TransactionRow`, `EmptyState`, and `TransactionComposer`; **Activity** composes searchable/filterable rows, sync/empty states, composer, and `ConfirmDialog`; **Insights** combines month navigation, monthly totals, category chart/legend, and comparison panels; **Settings** uses semantic cards, selection chips, reminder permission feedback, category management, and sync recovery controls. Bottom tabs use the inline `Icon` component. `Onboarding`, activity filter chips, and some page-specific summary/setting blocks are currently screen-local patterns rather than exported standalone components.

## Accessibility and states

Controls in the reusable library have visible labels or accessibility labels and roles for their primary actions. Keep non-color cues for income/expense and chart categories. The status library distinguishes first hydration (loading), no records/no matches (empty), local-only changes (pending), and connection loss (offline), with a retry affordance for recoverable sync states. Composer validation preserves values; destructive removal is explicitly confirmed; success is announced in plain language.
