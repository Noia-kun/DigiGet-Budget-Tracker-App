# DigiGet — Plan

## Product

A portrait-first, local-only personal finance app on Expo Router, React Native, TypeScript and NativeWind. All data lives on the device in AsyncStorage. There is no backend, login or sync, and the app must not imply multi-device access or account-backed recovery.

The main experience is a dashboard with a month selector, balance/income/expense summary, a category visualization, recent activity and a one-tap add action. Add opens a compact composer: income/expense toggle, amount, category, date, optional note. It validates before saving and confirms success inline.

- **Activity:** dated transactions with search and type/category/date/amount filters. Tapping opens edit; delete requires confirmation.
- **Insights:** selected-month summary and category breakdown.
- **Settings:** currency, notification permission/schedule, custom categories, onboarding replay.
- **First launch:** short skippable three-step introduction and currency choice, then an empty ledger with a clear first-entry action.
- **Currency:** Philippine Peso (PHP) is the default for new installs; a saved preference is never overwritten.

Removing a category archives it: it disappears from new-entry choices, keeps its metadata for past transactions and reports, and can be restored. At least one active category per type must remain.

Daily reminders use `expo-notifications`. Permission is requested only after the user enables reminders, and denial or unsupported platforms are handled with clear guidance. Web shows a native-device notice instead of pretending a reminder was scheduled.

## Data and safety

- One snapshot (transactions, categories, preferences, onboarding state) under `pocket-ledger.v1`.
- Writes must never fail silently. A failed save has to be visible to the user.
- Backup: export/import a validated JSON file from Settings. Planned: an optional biometric app lock.
- Never log or transmit transaction contents.

## Design

- **Movement:** calm editorial personal-finance design, like a printed household ledger with friendly modern mobile controls.
- **Principles:** the current month's story first; recording an entry is one obvious action; restrained color for income, spending and neutral info; legible text, accessible touch targets, clear recovery paths.
- **Color:** warm oat-paper backgrounds, near-black ink, DigiGet Green `#2F7A58` for primary actions and active navigation, restrained coral for expenses, muted blue-gray for secondary data. Never convey transaction type by color alone.
- **Layout:** single-column dashboard with an asymmetric balance card, a scrollable month control and a chronological ledger. Four bottom tabs (Home, Activity, Insights, Settings). Add is a primary action, not a fifth tab.
- **Interaction:** thumb-first, minimal typing, large amount field, remembered defaults, immediate local save. Destructive actions use a real confirmation dialog on native and web.
- **Motion:** 140–220 ms gentle transitions, respecting reduced motion. No state depends on motion.
- **Typography:** system sans-serif; heavier numeric display for balances; tabular figures where supported; sizes 12/14/16/20/28/34.
- **Voice:** plain, specific, non-judgmental. Errors give the next step. Example: "Saved on this phone."
- **Logo:** an open ledger-book outline whose pages form a subtle upward leaf/check shape.

## Structure

- `app/(tabs)/` — Home, Activity, Insights, Settings
- `app/_layout.tsx` — providers (theme, safe area, gesture handler, ledger)
- `components/ledger/` — shared UI, icons, composer, confirmation dialogs
- `hooks/ledger-context.tsx` — hydration, local state and persistence
- `shared/ledger.ts` — types, defaults, currency/date helpers, monthly summaries
- `app.config.ts` — app identity (`com.noiakun.digiget`, scheme `digiget`)
- `assets/images/` — icon, splash and adaptive-icon assets

## Constraints

- No backend, authentication, paid dependencies or unrelated screens unless we decide otherwise.
- Keep the interface responsive and accessibility-labeled.
- Notifications stay user-controlled and permission-gated.
- Keep the storage key and snapshot format backward compatible. Add a version and migration before changing them.

## Roadmap

1. ~~Backup: JSON export/import with validation, and visible save-failure handling.~~ Done.
2. Optional biometric lock.
3. Preview APK via EAS Build, tested on a real phone.
4. Later, if needed: accounts and sync (for example Supabase).
