# DigiGet — Implementation Plan

## Product and implementation

Build a portrait-first personal finance app on the existing Expo Router, React Native, TypeScript, NativeWind, Express/tRPC and Drizzle starter. Preserve the starter's project identifiers, runtime ports (Metro 8081 and API 3000), Manus runtime, and existing auth/system routes. The app does not add account login: a stable anonymous installation ID scopes the device's records in the managed database; AsyncStorage is the immediate local cache so the ledger opens quickly and remains usable offline. Queue local edits while disconnected, then synchronize and surface recoverable sync status. The server must scope all transaction, category and preference operations by that installation ID. Do not imply multi-device identity or account-backed recovery.

The main experience is a dashboard with a month selector, balance/income/expense summary, a category visualization, recent activity, and a prominent one-tap add action. Add opens a compact transaction composer: income/expense toggle, amount, category, date, optional note; validate before saving and confirm success inline. An activity screen lists dated transactions with search and type/category/date/amount filters; tapping opens edit, and delete requires confirmation. Insights shows a selected-month summary and category breakdown. Settings covers currency, notification permission/schedule, custom categories, onboarding replay, data-sync status, and manual retry. First launch uses a short, skippable three-step introduction and currency choice, then lands directly in an empty ledger with an obvious first-entry CTA. Philippine Peso (PHP) is available and selected for a new installation's first run; preserve currency preferences already saved by existing users.

Persist transactions, default and user-created categories, preferences, and onboarding state locally with AsyncStorage. Synchronize the whole latest snapshot per installation to managed MySQL through an additive Drizzle table and validated tRPC procedures. Serialize snapshot writes, use snapshot timestamps when resolving a fresher remote copy, retain local writes offline, and provide retry/status feedback. Removing a category archives it from new-entry choices, keeps its metadata for historical transactions and reports, and allows restoration; keep at least one active category per transaction type. Native daily reminders use `expo-notifications`; request permission only after the user enables reminders, handle denial and unsupported platforms explicitly, and allow disabling/canceling schedules. Web preview presents a clear native-device guidance state for notification permission instead of pretending notifications were scheduled.

## Design

- **Design Movement:** Contemporary editorial personal-finance design, borrowing the calm structure of a printed household ledger and pairing it with friendly, modern mobile controls.
- **Core Principles:** (1) Put the current month's money story first. (2) Keep recording an entry to one obvious action. (3) Use restrained color to distinguish income, spending, and neutral information. (4) Preserve legibility, accessible touch targets, and clear recovery paths.
- **Color Philosophy:** Warm oat-paper backgrounds and near-black ink make long-term use feel calm rather than alarming; saturated leaf green is the ownable “in control” signal and primary action; restrained coral marks expenses, and muted blue-gray supports secondary data. Never communicate transaction type by color alone.
- **Layout Paradigm:** A single-column editorial dashboard with an asymmetric balance card, a compact horizontally scrollable month control, and a chronological ledger. Four persistent bottom destinations—Home, Activity, Insights, Settings—keep one-handed navigation predictable; Add is a floating/center-weighted primary action rather than a fifth destination.
- **Signature Elements:** A rounded “ledger ticket” summary card with a small running-balance motif; category chips with simple line icons; a circular/monthly category ring paired with explicit labels and values.
- **Interaction Philosophy:** Thumb-first, minimal typing, segmented type toggle, large amount field, remembered defaults, immediate local save, clear save/sync feedback, and a retry path. Destructive changes have a real confirmation dialog on native and web.
- **Animation:** Short 140–220 ms transitions for tab selection, sheet opening, saving, and chart values; use gentle opacity/translation and reduced motion where available; no motion required to understand any state.
- **Typography System:** System sans-serif for all screens, with a heavier numeric display scale for balances and a consistent medium-weight sans for labels; tabular/monospaced figures where supported for aligned amounts. Use 12/14/16/20/28/34 px size roles, generous line height for body copy, and avoid low-contrast small text.
- **Brand Essence:** A quick, quietly reassuring money notebook for people who want to stay aware without turning finance into a chore. **Personality:** calm, capable, human.
- **Brand Voice:** Plain-language, specific, non-judgmental. Headlines orient; actions say what happens; errors give the next step. Examples: “Your money, at a glance.” / “Saved on this phone. We’ll sync when you’re back online.”
- **Wordmark & Logo:** A compact open ledger-book outline whose two pages form a subtle upward leaf/check shape; use the symbol without tiny text in native launcher assets and dashboard brand mark.
- **Signature Brand Color:** DigiGet Green, a saturated deep green (`#2F7A58`), used sparingly for the primary action, active navigation and positive balance cues.

## Project structure

- `app/(tabs)/`: Home, Activity, Insights and Settings destinations with shared bottom navigation.
- `app/_layout.tsx`: Existing Expo/React Query/tRPC providers and app-level data provider; retain safe-area and Manus runtime setup.
- `components/ledger/`: Shared amount card, category icon/chip, transaction row, month selector, empty/offline/sync state banners, composer sheet and accessible confirmation dialogs.
- `hooks/ledger-context.tsx`: AsyncStorage hydration, local-first state, serialized snapshot-write queue, lifecycle reconnect retry, and sync status.
- `shared/ledger.ts`: Transaction/category/preference types, default categories, currency/date helpers, and monthly summary calculations.
- `lib/trpc.ts`: Existing tRPC client transport used to call the ledger procedures.
- `server/db.ts` and `server/routers.ts`: Device-scoped snapshot repository and validated tRPC read/write operations; do not log transaction contents or client IDs.
- `drizzle/schema.ts` and `drizzle/`: Additive ledger-snapshot schema/migration; retain the supplied users table and migration history.
- `assets/images/`: Distinct square brand/icon/splash/adaptive-icon variants matching the DigiGet mark; keep adaptive foreground/background/monochrome and splash usage aligned through `app.config.ts`.

## Constraints and dependencies

Use already-installed `@react-native-async-storage/async-storage`, `@tanstack/react-query`, tRPC/Drizzle/MySQL, `expo-notifications`, `expo-haptics`, and `react-native-svg` where appropriate. Do not add authentication, paid dependencies, or unrelated screens. The database is shared by development and publication; use only additive schema changes and never run destructive data cleanup. Push schema before first API use. Keep server credentials on the server, do not expose a service DSN in the app bundle, and make the interface responsive/accessibility-labeled. All notifications remain user-controlled and permission-gated. Create a real project icon and set the project-root `logoUrl` to a durable public HTTPS brand asset before checkpointing; preserve app identifiers and scheme.

## Serving and recovery behavior

Use the starter's Express/tRPC endpoint on port 3000 and Expo Metro/Web on port 8081. Client starts from cached state, shows loading placeholders only during first hydration, and provides a stable empty first-use state. On network loss, keep local reads and writes active with an “On this device”/pending-sync cue; reconnect and retry queued changes without duplicate records. On invalid form data, show field-level instructions without dropping user input; on API failure, retain local changes and offer Retry. On notification denial, explain the device Settings path and keep reminders off. Keep all sensitive transaction ownership scoped to the anonymous installation identifier.
