# DigiGet

A personal income and expense tracker built with Expo Router, React Native, TypeScript and NativeWind. It is local-only: all data is stored on the device (AsyncStorage) and works fully offline. There is no backend, account or sync.

## Features

- Income and expense entries with categories, notes and dates
- Monthly summary, category breakdown, search and filters
- Custom categories (archive/restore keeps history)
- Currencies: PHP (default), QAR, USD, EUR, GBP, CAD, AUD, JPY. Each entry keeps the currency it was entered in, and totals are shown in the currency you select
- Daily reminders at a time you pick
- First-use onboarding that can be replayed
- JSON backup: export your data to a file and restore it from Settings

## Run locally

Requirements: Node.js and pnpm 9.12.0.

```sh
pnpm install
pnpm dev        # Expo web on http://localhost:8081
pnpm android    # or: pnpm ios
```

Checks: `pnpm check` (TypeScript), `pnpm lint`, `pnpm test`.

No `.env` file is needed.

## Currency

Each entry stores the currency it was entered in. The currency in Settings is the display currency: Home, Activity and Insights convert every entry to it using exchange rates. Stored amounts are never changed, so switching back is exact.

Rates come from the free [Exchange Rate API](https://www.exchangerate-api.com) open endpoint. They are refreshed when the cached copy is older than 12 hours and cached on the phone. Offline, the app uses the cached rates, or an approximate bundled table (`shared/rates.ts`) if none were ever fetched. Only the rates list is requested; no ledger data leaves the phone.

## Build an APK

Requires an Expo account (`npx eas-cli login`).

```sh
npx eas-cli build --platform android --profile preview
```

Open the build link on your phone to download and install the `.apk`. Test reminders on this build, because they don't work in Expo Go on Android.

## Project layout

- `app/` — Expo Router screens (`(tabs)`: Home, Activity, Insights, Settings)
- `components/ledger/` — shared UI, inline SVG icons, transaction composer
- `hooks/ledger-context.tsx` — local persistence and ledger state
- `shared/ledger.ts` — types, default categories, currency/date/summary helpers
- `lib/` — theme provider, backup export/import and exchange-rate cache
- `tests/` — Vitest unit tests

## Data

The ledger is one JSON snapshot in AsyncStorage under the key `pocket-ledger.v1`. Uninstalling the app or clearing its data deletes it.
