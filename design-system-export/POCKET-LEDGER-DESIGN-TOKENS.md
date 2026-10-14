# DigiGet Design Tokens

DigiGet uses a calm editorial-finance visual language: warm paper, crisp white cards, near-black ink, and an ownable deep leaf green. These values are extracted from the shipped app, principally `components/ledger/ui.tsx`, the screen styles, `shared/ledger.ts`, and the Expo theme configuration. The app-level ledger palette and the starter’s generic semantic theme are documented separately because they are not currently the same token source.

## 1. Brand and surface colors

| Token | Value | Intended use |
| --- | --- | --- |
| `paper` | `#F7F7F1` | Main page canvas; warm, low-glare ground. |
| `card` | `#FFFFFF` | Main elevated surfaces, sheets, and dialog backgrounds. |
| `ink` | `#17231C` | Primary text, strong numbers, and dark primary CTA. |
| `muted` | `#7D867F` | Secondary text, hints, inactive controls. |
| `line` | `#E6E9E1` | Card/input borders and quiet separators. |
| `green` / DigiGet Green | `#2F7A58` | Signature action, selected states, sync/positive cues, and brand mark. |
| `paleGreen` | `#E6F1E9` | Soft selected/success backing and empty-state icon tile. |
| `coral` | `#C97158` | Expense/destructive/emphasis color. Use alongside text or icon cues. |
| `paleCoral` | `#FAEAE4` | Soft expense selection surface. |
| `gold` | `#D9B85B` | Accent data color. |
| `blue` | `#819CA6` | Secondary category/data accent. |

Additional surface/state values used in component styles: pale neutral `#EEF0E8`, input surface `#F7F8F4`, soft neutral `#F2F3EF`, subtle panel `#F5F6F1`, border neutral `#D8DDD5`, pale expense `#FBEAE4`, pale income `#E3F0E7`, pale selected green `#EAF3EC`, coral warning surface `#FFF2E8`, pending sync surface `#EDF3E8`, muted placeholder `#A2AAA3`, and expense text `#96533E`.

### Category data colors

These colors belong to user-visible category badges and charts (not semantic UI roles). Keep a text legend with charts and never encode transaction meaning by color alone.

| Category | Value | Kind |
| --- | --- | --- |
| Food & drink | `#F3A47E` | Expense |
| Home | `#89A7D2` | Expense |
| Transport | `#DFBF62` | Expense |
| Shopping | `#C493BD` | Expense |
| Health | `#7FB9A1` | Expense |
| Other expense | `#9A9C94` | Expense |
| Salary | `#4B9A72` | Income |
| Freelance | `#83AE75` | Income |
| Other income | `#8AA9B2` | Income |

## 2. Typography

The product uses platform system fonts—no downloaded fonts. On iOS, sans resolves to `system-ui`; elsewhere it resolves to the platform default. Web fallback stack: `system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif`. Use weight to establish hierarchy: 800 for page/display amounts and prominent headings, 700 for card titles/controls, 600 for secondary labels, regular for explanatory body copy. Numeric balances use heavier weights and `adjustsFontSizeToFit`/single-line containment where the screen can be narrow.

| Role | Typical size | Typical treatment |
| --- | ---: | --- |
| Small data/meta | 11–12 | Muted; often 600–800; uppercase/letter-spaced for eyebrow labels. |
| Body / control | 13–15 | Regular to 700, line-height around 19–23 for descriptive copy. |
| Card/section title | 16–17 | Ink, 700. |
| Dialog/page title | 19–28 | Ink, 800; page title uses slight negative tracking. |
| Display amount | 30–34 | 800, modest negative tracking, one-line scaling. |

## 3. Spacing and sizing

The app’s spacing is expressed as direct React Native style values rather than a centralized spacing scale; these reference steps capture the recurring rhythm.

| Token | Value (dp) | Common use |
| --- | ---: | --- |
| `space-1` | 4 | Small control padding/gaps. |
| `space-2` | 8 | Chip/control gaps and compact spacing. |
| `space-3` | 12 | Card-internal groups and row gaps. |
| `space-4` | 16 | Default section rhythm and content padding top. |
| `space-5` | 18 | Shared page vertical gap. |
| `space-6` | 22 | Mobile horizontal page inset and card/dialog padding. |
| `space-7` | 24 | Dialog shade inset. |

Mobile-first pages use 22 dp horizontal inset, 16 dp top inset, 18 dp section gaps, and a 108 dp bottom content inset to clear the persistent tab bar. Main page content is full width, capped at 560 dp, and centered when there is more room. Interactive targets should retain visible labels and comfortable hit areas; icon-only actions in the app have explicit accessibility labels.

## 4. Shape and borders

| Element | Radius |
| --- | ---: |
| Small chips | 11–12 dp |
| Compact buttons / icon wells | 12–14 dp |
| Inputs / medium controls | 14–16 dp |
| Cards / major surfaces | 22–24 dp |
| Brand mark | 34% of mark size |
| Category dot | 6 dp radius (11 dp diameter) |

Most white cards use a 1 dp border in `line`, 18 dp padding, and 22 dp rounded corners. The balance card and insights overview use 24 dp radii. Inputs use 14 dp radii, minimum 48 dp height, and 14 dp horizontal inset.

## 5. Elevation and chart geometry

Cards use restrained low elevation. Web shadow: `0 8px 24px rgba(26,43,32,0.06)`. Native shadow: `#27392E` at 0.06 opacity, 12 dp blur radius, y-offset 4, elevation 2. Donut charts use a radius of 37% of the component size and stroke width of 13%; use `#EEF0E8` as the empty ring, and category colors for positive-value arcs. The chart center includes a short label/value; the legend carries exact labels, amounts, and shares.

## 6. Motion and feedback

Motion should be quiet, fast, and nonessential to comprehension; the product direction specifies 140–220 ms for tab selection, sheet opening, save feedback, and chart changes. Favor gentle opacity/translation, preserve native modal motion where it is already platform-provided, and avoid requiring animation to understand state. Feedback is concise and recoverable: saved locally, syncing, offline, retry, form validation, permission denied, and confirmation before irreversible deletion.

## 7. Semantic starter theme (distinct from ledger `C`)

`src/theme/theme.config.js` is the Expo template’s general semantic light/dark palette. It is re-exported through `constants/theme.ts` and remains useful to theme-provider consumers, but ledger screens use the product palette above directly.

| Semantic token | Light | Dark |
| --- | --- | --- |
| `primary` | `#0A7EA4` | `#0A7EA4` |
| `background` | `#FFFFFF` | `#151718` |
| `surface` | `#F5F5F5` | `#1E2022` |
| `foreground` | `#11181C` | `#ECEDEE` |
| `muted` | `#687076` | `#9BA1A6` |
| `border` | `#E5E7EB` | `#334155` |
| `success` | `#22C55E` | `#4ADE80` |
| `warning` | `#F59E0B` | `#FBBF24` |
| `error` | `#EF4444` | `#F87171` |

## 8. Usage principles

1. Lead with DigiGet Green for the primary action or active state, not as a fill for every surface.
2. Put dark ink on light paper/cards for reading; use muted only for secondary information, never key values or critical state.
3. Pair category color with a category name, and income/expense color with explicit words, signs, or icons.
4. Use whitespace, rounded cards, and subtle borders instead of heavy dividers or dense tables on phone screens.
5. Keep number formatting tied to the selected currency and represent monetary values internally in integer cents.
6. Keep system fonts and inline SVG icons local; avoid runtime webfont dependencies that can block the embedded Expo Preview.
