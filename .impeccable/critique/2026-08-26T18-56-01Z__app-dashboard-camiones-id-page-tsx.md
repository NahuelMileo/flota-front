---
target: app/(dashboard)/camiones/[id]/page.tsx
total_score: 21
max_score: 36
na_heuristics: 10
p0_count: 2
p1_count: 2
timestamp: 2026-08-26T18-56-01Z
slug: app-dashboard-camiones-id-page-tsx
---
Method: dual-agent (A: general-purpose critique agent · B: general-purpose detector agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeletons mirror final layout well, but one `isLoading` gates 6 parallel fetches — a slow `/api/trips` blocks even the truck header, which is already available from `truckRes`. |
| 2 | Match System / Real World | 3 | Correct es-UY terms, km/currency units make sense to a trucking operator. |
| 3 | User Control and Freedom | 2 | Delete is confirm-only, no undo toast after deleting an income/expense — the mistake is final the moment "Eliminar" is clicked. |
| 4 | Consistency and Standards | 2 | Trips get only a view icon (link away to `/trips/id`) while incomes/expenses get inline edit+delete — two interaction models for structurally similar rows on the same page. |
| 5 | Error Prevention | 3 | AlertDialog confirmations present and name the entity being deleted — solid. |
| 6 | Recognition Rather Than Recall | 3 | Badges label state in text, not just color; subtitles under metric cards explain the formula. |
| 7 | Flexibility and Efficiency | 2 | No bulk actions, no keyboard shortcuts; a manual scroll-position hack in `data-table.tsx` patches a pagination jump instead of designing around it. |
| 8 | Aesthetic and Minimalist Design | 2 | Nine metric cards + three full tables stacked in one continuous scroll; ad hoc color utilities clash rather than compose. |
| 9 | Error Recovery | 1 | A single generic "Error al cargar datos del camión" toast covers any of 6 endpoints failing — no indication which call failed, no retry. |
| 10 | Help and Documentation | n/a | Internal Operate-mode tool for trained staff; no sibling page in the app has a help affordance either. |
| **Total** | | **21/36** | **Acceptable (58%)** |

## Design Specificity Verdict

**LLM assessment**: This reads as a generic shadcn admin CRUD detail page wearing a trucking-company label. Nothing in layout, iconography, or color signals "fleet/logistics" specifically — swap "km" for "units" and "camión" for "widget" and it is structurally identical to any inventory or CRM detail page. The only domain cue is the literal text "km" appended to numbers; there is no route/map affordance and no truck iconography, despite `lucide-react`'s `Truck` icon being available and unused. It is the same 3-KPI-cards-plus-tables template already reused verbatim across `/trips`, `/ingresos`, `/egresos`. Verdict: authored for "a CRUD entity," not for a fleet operator's actual mental model of an asset.

**Deterministic scan**: The bundled detector (`detect.mjs`) ran against the page file and its 8 directly-composed components (`total-income-card.tsx`, `total-expense-card.tsx`, `net-balance-card.tsx`, `data-table.tsx`, `ui/card.tsx`, `ui/badge.tsx`, `ui/skeleton.tsx`, `ui/button.tsx`), individually and batched. **Zero findings, exit code 0 on every run.** A sanity check against a synthetic file with a known anti-pattern (bounce/elastic easing) correctly triggered one finding at exit code 2, confirming the detector is operational and the clean result on the real files is a genuine negative, not a silent failure. The detector's static regex-based scan over TSX source cannot catch computed contrast, actual cascade-resolved spacing, responsive breakpoints, or runtime state — those gaps are covered qualitatively in Assessment A instead (see the dark-mode/contrast finding below).

**Visual overlays**: Not available this session — no dev server was running and no browser automation tool is exposed, so the `[Human]` tab overlay could not be attempted. This is reported as a fallback signal, not a failure: findings below rely on source-level reasoning, not rendered-pixel verification.

## Overall Impression

Functionally solid — loading states are shape-matched, defensive fallbacks for missing km data are good, delete confirmations are in place — but the page is a flat, generic data dump with two real accessibility blockers (table sorting and icon-only buttons are both unreachable by keyboard/screen reader) and a structural inconsistency where trips are treated as second-class citizens compared to incomes/expenses on the exact same page. The single biggest opportunity: decide what this page is *for* (a fleet operator's daily financial snapshot of one asset) and design the hierarchy, color system, and trip/income/expense parity around that, instead of stacking nine metric cards and three generic tables in one scroll.

## What's Working

- **Shape-matched loading skeletons**: the card-grid skeleton and table skeletons mirror the real layout, which keeps perceived performance high instead of a generic spinner.
- **"Falta configurar km estimados" badge**: icon + text + color together flag an incomplete setup state that would otherwise silently degrade the cost/km metrics — a genuinely good nudge.
- **Graceful km-metric fallback**: when `kmForMetrics` is null, metrics degrade to `"—"` with an explanatory subtitle instead of `NaN`/`Infinity` — solid handling of the missing-data edge case.

## Priority Issues

**[P0] Table sort headers are keyboard/screen-reader inaccessible**
- Why it matters: the sortable `TableHead` in `components/data-table.tsx` attaches the sort handler to a plain clickable element with no `role="button"`, `tabIndex`, or `onKeyDown`, and no `aria-sort`. A keyboard or screen-reader user cannot sort any of the three tables on this page — sorting silently doesn't exist for them.
- Fix: make the header content a real `<button>` (or add `role="button" tabIndex={0}` plus Enter/Space handling) and expose `aria-sort` on `TableHead`.
- Suggested command: `$impeccable audit`

**[P0] Icon-only action buttons have no accessible name**
- Why it matters: Edit/delete/view buttons on trip, income, and expense rows render only a lucide icon with no `aria-label` or visually-hidden text. A screen reader announces a bare "button" with no purpose — a user cannot tell edit from delete from view without guessing, which is dangerous next to a destructive action.
- Fix: add `aria-label="Editar ingreso"`, `aria-label="Eliminar egreso"`, etc. to every icon-only `Button` on this page.
- Suggested command: `$impeccable audit`

**[P1] Trips are second-class citizens on their own truck's page**
- Why it matters: trip rows get only a view-and-navigate-away action while income/expense rows get full inline edit+delete on the same page. This breaks consistency (Nielsen #4) and forces a context switch to fix the exact same class of record depending on which table it's in.
- Fix: either give trips the same inline-edit pattern as income/expense, or make the asymmetry intentional and legible (a labeled "Editar en Viajes" affordance instead of a bare eye icon).
- Suggested command: `$impeccable layout`

**[P1] Semantic color is hardcoded Tailwind utilities, not theme tokens, and risks breaking in dark mode**
- Why it matters: status/financial colors (`text-green-600`, `text-red-600`, `text-orange-700`, and a mismatched `text-green-400 border-green-400 bg-green-100` combo on the Flete badge) are scattered across the page and its cards instead of routed through CSS variables. Trip status badges use light-only background/border shades with no `dark:` variant despite the app supporting dark mode, and there is no `--success`/`--warning` token defined in `globals.css` to route through.
- Fix: define light+dark `--color-success` / `--color-warning` / `--color-danger` tokens in `globals.css` and replace the ad hoc utility classes across `page.tsx` and the three metric-card components with them.
- Suggested command: `$impeccable colorize`

**[P2] Monolithic loading state hides data that's already available, and tenant-wide data is fetched then filtered client-side**
- Why it matters: a single `isLoading` flag gates the whole page — including the truck header, which resolves as soon as the truck fetch returns — behind `Promise.all` of 6 endpoints. Trips/incomes/expenses are fetched for the entire tenant and filtered client-side by `truckId`, so perceived latency for "open one truck" scales with total company data, not with that truck's data.
- Fix: resolve the truck fetch independently and render the header immediately; move truck-scoped filtering server-side if the API supports a `truckId` query param.
- Suggested command: `$impeccable optimize`

**[P3] No differentiated empty state for a brand-new truck**
- Why it matters: a truck with zero trips/incomes/expenses shows three separate flat "No hay X registrado(s)" table bodies back to back with no unifying message or CTA — reads as broken rather than as an intentional first-run moment.
- Fix: detect the all-empty case and render one consolidated empty-state block with a primary "Agregar el primer viaje" CTA.
- Suggested command: `$impeccable onboard`

## Persona Red Flags

**Alex (Power User)**: Every income/expense fix opens a modal one at a time — no bulk edit/delete, no multi-select on any of the three tables. The global date filter that reshapes every number on this page is invisible here (it lives elsewhere in the layout), so Alex can see stale-looking totals with no on-page explanation. No sticky KPI summary while scrolling a long trip table, so the big-picture numbers disappear while working row by row.

**Sam (Accessibility-Dependent)**: Cannot sort any table column — the click handler has no keyboard equivalent, a hard blocker, not a degradation. Every icon-only action button (edit/delete/view) is unreachable in *meaning* — no `aria-label`, so assistive tech announces "button" with zero context, right next to a destructive delete action. The "Falta configurar" badge is one of the few elements that does pass (icon + text + color together, not color alone); trip status badges also carry text labels but carry dark-mode contrast risk (see P1) that compounds for a low-vision user in dark mode.

## Minor Observations

- Row-2 metrics grid stays a fixed 3-column layout even when only 1-2 of the 3 conditional cards render, leaving lopsided whitespace.
- "Costo/km total" is hardcoded red regardless of actual value — cost isn't inherently bad, but it's always colored as if it were.
- Km values are formatted with locale grouping but no `maximumFractionDigits`, so decimal km (explicitly a supported input) can render with an unpredictable number of decimal places across cells.
- The header row (matrícula + model + year + badge + "Costos fijos" link) has no wrap/truncate behavior defined for narrow viewports or long matrícula/model text.
- `MetricCard` is a bespoke local component duplicating what `TotalIncomeCard`/`TotalExpenseCard`/`NetBalanceCard` already do — a second implementation of the same visual pattern living in the page file instead of `components/`.
- CSV export is wired up in the shared `DataTable` component and used on `/ingresos` and `/egresos` per project docs, but isn't enabled on any of the three tables here — inconsistent capability on the page where a per-truck export arguably matters most.

## Questions to Consider

- This is a fleet-management product built around distance and geography, and this page spends six metric cards computing km-based ratios — so why is there zero spatial/route visual language (map, mileage timeline, truck icon) anywhere on it?
- If incomes and expenses get inline edit here but trips only get a "go look elsewhere" icon, is the real information architecture "truck ledger with trip metadata" — and should the page just admit that instead of implying trips are treated equally?
- When this app eventually needs a colorblind-safe palette or a rebrand, is anyone going to grep six files to find every hand-picked `text-green-600`?
