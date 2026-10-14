# DigiGet UI Kit

A source export of the shipped DigiGet UI components, ledger data contract, and design-token documentation.

## Contents

- `src/components/ledger/` — inline SVG `Icon`, shared UI primitives, and the add/edit transaction composer.
- `src/shared/ledger.ts` — public data types, starter categories, and currency/date/month helpers consumed by those components.
- `src/theme/theme.config.js` — the starter's generic semantic light/dark palette (kept distinct from the ledger's direct palette).
- `tokens/design-tokens.json` — machine-readable token snapshot.
- `docs/COMPONENT-LIBRARY.md` — complete exported component inventory, signatures, and screen-level composition notes.
- `docs/DESIGN-TOKENS.md` — human-readable token and usage reference.

## Use in an Expo project

Copy the `src` tree into your project. The sources assume the `@/` alias resolves to your source root; configure it or adjust imports. Ensure `react-native-svg` is installed. These components use built-in React Native components, not an external icon font. They do not include the app's backend, persistence provider, navigation setup, or app screens. Wire `TransactionComposer.onSave` into your own store.

## Important distinction

The app's actual ledger UI palette lives in `C` in `src/components/ledger/ui.tsx`. `src/theme/theme.config.js` documents the template-level semantic palette used by the broader theme provider; it is not currently the source for all ledger screen colors. Refer to the docs before changing either palette.
