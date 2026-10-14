# Pocket Ledger

A personal expense tracker built with Expo Router, React Native, TypeScript, and an Express/tRPC API. The app supports income/expense entry, categories, monthly summaries, offline-first local storage with server snapshot sync, reminders, and settings.

## Run locally

Requirements: Node.js compatible with the lockfile and pnpm 9.12.0.

```sh
pnpm install
# Configure the required environment values before first use.
pnpm db:push
pnpm dev
```

`pnpm dev` starts the API on port 3000 and Expo Metro/Web Preview on port 8081. Useful checks: `pnpm check`, `pnpm lint`, and `pnpm test`.

## Configuration

This repository intentionally contains no `.env` file or secrets. In a standalone setup, configure the app's public runtime values (`EXPO_PUBLIC_API_BASE_URL`, OAuth portal/API URLs, and app ID) for the client, and the required database/OAuth signing values for the server in your local environment or deployment secret manager. Never commit `.env` files or place server secrets in `EXPO_PUBLIC_*` variables. `pnpm db:push` applies the Drizzle schema to the database identified by your configured `DATABASE_URL`; run it only against a database you control.

The API root (`/`) returns service information; `/api/health` is the health check; typed application procedures are under `/api/trpc`.

## Project layout

- `app/` — Expo Router screens (Home, Activity, Insights, Settings, and OAuth callback).
- `components/ledger/` — shared UI components, inline SVG icons, and transaction composer.
- `hooks/ledger-context.tsx` — local persistence and snapshot sync provider.
- `shared/ledger.ts` — transaction/category types and currency/date/summary helpers.
- `server/` — Express, tRPC, OAuth, and database helpers.
- `drizzle/` — database schema and migrations.
- `design-system-export/` — UI library and token documentation bundle.
