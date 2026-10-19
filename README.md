# DigiGet

A personal income and expense tracker built with Expo Router, React Native, TypeScript and NativeWind. It is local-only: all data is stored on the device (AsyncStorage) and works fully offline. There is no backend, account or sync.

## Features

- Income and expense entries with categories, notes and dates
- Monthly summary, category breakdown, search and filters
- Custom categories (archive/restore keeps history)
- Currency preference (PHP by default) and daily reminders
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

## Project layout

- `app/` — Expo Router screens (`(tabs)`: Home, Activity, Insights, Settings)
- `components/ledger/` — shared UI, inline SVG icons, transaction composer
- `hooks/ledger-context.tsx` — local persistence and ledger state
- `shared/ledger.ts` — types, default categories, currency/date/summary helpers
- `lib/` — theme provider and utilities
- `tests/` — Vitest unit tests

## Data

The ledger is one JSON snapshot in AsyncStorage under the key `pocket-ledger.v1`. Uninstalling the app or clearing its data deletes it.
