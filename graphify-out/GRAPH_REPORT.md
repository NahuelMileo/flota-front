# Graph Report - .  (2026-05-08)

## Corpus Check
- 123 files · ~71,411 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 737 nodes · 2051 edges · 62 communities (33 shown, 29 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.82)
- Token cost: 4,800 input · 1,200 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core Dashboard CRUD|Core Dashboard CRUD]]
- [[_COMMUNITY_Fleet & Cost Pages|Fleet & Cost Pages]]
- [[_COMMUNITY_Data Table Layer|Data Table Layer]]
- [[_COMMUNITY_Layout & Landing|Layout & Landing]]
- [[_COMMUNITY_App Shell & KPIs|App Shell & KPIs]]
- [[_COMMUNITY_Shared Infrastructure|Shared Infrastructure]]
- [[_COMMUNITY_UI Primitives|UI Primitives]]
- [[_COMMUNITY_Sidebar & Sheet UI|Sidebar & Sheet UI]]
- [[_COMMUNITY_Date & Monthly Costs|Date & Monthly Costs]]
- [[_COMMUNITY_Navigation & Menus|Navigation & Menus]]
- [[_COMMUNITY_App Sidebar Composition|App Sidebar Composition]]
- [[_COMMUNITY_Currency & Filter Context|Currency & Filter Context]]
- [[_COMMUNITY_Cost Data Types|Cost Data Types]]
- [[_COMMUNITY_CRUD Forms|CRUD Forms]]
- [[_COMMUNITY_Auth Flow|Auth Flow]]
- [[_COMMUNITY_Odometer Tracking|Odometer Tracking]]
- [[_COMMUNITY_Fixed Cost Management|Fixed Cost Management]]
- [[_COMMUNITY_Landing & Onboarding|Landing & Onboarding]]
- [[_COMMUNITY_Marketing Sections|Marketing Sections]]
- [[_COMMUNITY_Toggle & Utility|Toggle & Utility]]
- [[_COMMUNITY_Auth Guards & Login|Auth Guards & Login]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_Expense Type Enums|Expense Type Enums]]
- [[_COMMUNITY_Toggle Components|Toggle Components]]
- [[_COMMUNITY_Currency Display Utils|Currency Display Utils]]
- [[_COMMUNITY_Expense Type Utilities|Expense Type Utilities]]
- [[_COMMUNITY_Truck Management|Truck Management]]
- [[_COMMUNITY_Build & Monitoring Config|Build & Monitoring Config]]
- [[_COMMUNITY_Guest Auth Pages|Guest Auth Pages]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Project Documentation|Project Documentation]]
- [[_COMMUNITY_Landing Layout Alt|Landing Layout Alt]]
- [[_COMMUNITY_Site Header|Site Header]]
- [[_COMMUNITY_Total Expense Card|Total Expense Card]]
- [[_COMMUNITY_Total Income Card|Total Income Card]]
- [[_COMMUNITY_Features Section|Features Section]]
- [[_COMMUNITY_How It Works|How It Works]]
- [[_COMMUNITY_KPI Section|KPI Section]]
- [[_COMMUNITY_Landing Footer|Landing Footer]]
- [[_COMMUNITY_Problem Section|Problem Section]]
- [[_COMMUNITY_Avatar UI|Avatar UI]]
- [[_COMMUNITY_Breadcrumb UI|Breadcrumb UI]]
- [[_COMMUNITY_Tooltip Provider|Tooltip Provider]]
- [[_COMMUNITY_Mobile Hook|Mobile Hook]]
- [[_COMMUNITY_Fixed Expense Types|Fixed Expense Types]]
- [[_COMMUNITY_Date Formatter|Date Formatter]]
- [[_COMMUNITY_BRL Formatter v2|BRL Formatter v2]]
- [[_COMMUNITY_KM Formatter|KM Formatter]]
- [[_COMMUNITY_File Icon|File Icon]]
- [[_COMMUNITY_Vercel Logo|Vercel Logo]]
- [[_COMMUNITY_Next.js Logo|Next.js Logo]]
- [[_COMMUNITY_Truck Hero Image 2|Truck Hero Image 2]]
- [[_COMMUNITY_Globe Icon|Globe Icon]]
- [[_COMMUNITY_Truck Hero Image|Truck Hero Image]]
- [[_COMMUNITY_Window Icon|Window Icon]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 172 edges
2. `Button()` - 41 edges
3. `useCurrency()` - 31 edges
4. `fetchWithAuth()` - 25 edges
5. `Input()` - 24 edges
6. `formatCurrency()` - 22 edges
7. `lib/utils cn() utility` - 19 edges
8. `Truck` - 18 edges
9. `Field()` - 16 edges
10. `Skeleton()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Rationale: Multi-currency display — all values stored in BRL/USD/UYU, user picks display currency, never hardcode formatBRL` --rationale_for--> `context/currency-context.tsx — CurrencyProvider with displayCurrency, getDisplayValue`  [EXTRACTED]
  CLAUDE.md → context/currency-context.tsx
- `Rationale: Multi-currency display — all values stored in BRL/USD/UYU, user picks display currency, never hardcode formatBRL` --rationale_for--> `lib/format.ts — formatCurrency, formatCurrency2, formatDate utilities`  [EXTRACTED]
  CLAUDE.md → lib/format.ts
- `Rationale: Enum normalization — API returns string enums (Freight, Gasoil, InProgress); must normalise before use as numeric select defaultValues` --rationale_for--> `app/(dashboard)/ingresos/columns.tsx — Column defs for Income table, normalizeIncomeType`  [EXTRACTED]
  CLAUDE.md → app/(dashboard)/ingresos/columns.tsx
- `getDisplayValue Function` --semantically_similar_to--> `formatCurrency Function`  [INFERRED] [semantically similar]
  context/currency-context.tsx → lib/format.ts
- `PopoverHeader()` --calls--> `cn()`  [EXTRACTED]
  components/ui/popover.tsx → lib/utils.ts

## Hyperedges (group relationships)
- **Dashboard KPI card group — dashboard_page renders all 4 KPI cards using shared income/expense data and displayCurrency** —  [INFERRED 0.90]
- **Auth flow — dashboard_layout wraps all routes with AuthGuard which relies on JWT stored in localStorage (fetchWithAuth refreshes on 401)** —  [EXTRACTED 1.00]
- **Truck cost pipeline — camion_costos_page uses use_truck_costs hook + CostTable component + AddCostModal to manage annual fixed/variable cost tracking** —  [EXTRACTED 1.00]
- **Expense CRUD data flow: ExpensePage orchestrates AddExpenseForm, EditExpenseForm, DataTable, and columns, all sharing the Expense type and calling fetchWithAuth** — expensepage_component, addexpenseform_component, editexpenseform_component, egresos_datatable, egresos_columns, expense_type, fetchwithauth_fn [INFERRED 0.95]
- **Income CRUD data flow: IncomePage orchestrates AddIncomeForm, EditIncomeForm, DataTable, and columns, all sharing the Income type and calling fetchWithAuth** — incomepage_component, addincomeform_component, editincomeform_component, ingresos_datatable, ingresos_columns, income_type, fetchwithauth_fn [INFERRED 0.95]
- **TripDetailPage composes AddIncomeForm, AddExpenseForm, and EditTripForm to allow inline creation of incomes, expenses, and editing of the trip, all connected via tripId and defaultTruckId** — tripdetailpage_component, addincomeform_component, addexpenseform_component, edittripform_component, trip_type, income_type, expense_type [INFERRED 0.95]
- **Authentication flow: login stores tokens, AuthGuard checks tokens, GuestGuard redirects authenticated users, NavUser clears tokens on logout** — login_form, auth_guard, guest_guard, nav_user, localstorage_auth [INFERRED 0.95]
- **Currency display chain: useCurrency provides displayCurrency -> formatCurrency/formatCurrency2 formats values -> displayed in CostPerKmCard, FuelEfficiencyCard, NetBalanceCard, CostTable** — currency_context, format_lib, cost_per_km_card, fuel_efficiency_card, net_balance_card, cost_table [INFERRED 0.95]
- **Cost management components: AddCostModal and AddFixedCostModal create costs via /api/costs/templates, /api/costs/entries, /api/costs/installments; CostTable displays and edits them via useTruckCosts** — add_cost_modal, add_fixed_cost_modal, cost_table, use_truck_costs_hook, api_costs_templates, api_costs_entries, api_costs_installments [INFERRED 0.90]
- **Components built on top of Base UI React primitives** —  [EXTRACTED 1.00]
- **Sidebar component composes Sheet, Input, Separator, Skeleton, Tooltip, Button, and useIsMobile hook** —  [EXTRACTED 1.00]
- **DatePicker composes Popover, Calendar, and Button for month-based date selection (locale es)** —  [EXTRACTED 1.00]
- **Multi-currency display system: context + format functions + display type** —  [INFERRED 0.95]
- **Expense type enum normalization pipeline: string API responses to numeric form values** —  [EXTRACTED 1.00]
- **Truck cost data pipeline: hook fetches costs using API and shapes them into typed rows** —  [EXTRACTED 1.00]

## Communities (62 total, 29 thin omitted)

### Community 0 - "Core Dashboard CRUD"
Cohesion: 0.05
Nodes (83): getColumns(), AddCostModal(), AddCostModalProps, FixedFormValues, fixedSchema, InstallmentsFormValues, installmentsSchema, MONTHS_OPTIONS (+75 more)

### Community 1 - "Fleet & Cost Pages"
Cohesion: 0.06
Nodes (74): CostPerKmCard(), FUEL_CATEGORY_NAMES, Props, CellPopover(), CostTable(), CostTableProps, getEntryDisplayAmount(), MONTHS (+66 more)

### Community 2 - "Data Table Layer"
Cohesion: 0.07
Nodes (41): DataTable(), DataTableProps, chartData, columns, schema, DataTable(), DataTableProps, DataTable() (+33 more)

### Community 3 - "Layout & Landing"
Cohesion: 0.05
Nodes (36): CURRENCIES, SiteHeader(), CurrencyProvider(), DateFilterContext, DateFilterContextType, DateFilterProvider(), useDateFilter(), ExpensePage() (+28 more)

### Community 4 - "App Shell & KPIs"
Cohesion: 0.11
Nodes (32): app/layout.tsx — Root layout with Toaster, app/page.tsx — Root redirect to /dashboard, app/(dashboard)/camiones/[id]/costos/page.tsx — Annual cost table for a truck, app/(dashboard)/camiones/[id]/page.tsx — Truck detail page with KPIs, trips, incomes, expenses, components/cost-per-km-card.tsx — KPI card for cost per km (fuel only), app/(dashboard)/costos/mensual/page.tsx — Monthly cost entries grouped by truck, types/costs.ts — CostEntry, CostTemplate, SummaryMonth type definitions, context/currency-context.tsx — CurrencyProvider with displayCurrency, getDisplayValue (+24 more)

### Community 5 - "Shared Infrastructure"
Cohesion: 0.11
Nodes (31): Auth via localStorage (accessToken, tenantId), Base UI React primitives library, ChartContext React context for chart config sharing, useIsMobile hook, lib/utils cn() utility, Recharts library (ResponsiveContainer, Tooltip, Legend), SidebarContext React context for sidebar state, Button UI Component (+23 more)

### Community 6 - "UI Primitives"
Cohesion: 0.1
Nodes (28): cn(), AlertDialogMedia(), AlertDialogOverlay(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount() (+20 more)

### Community 7 - "Sidebar & Sheet UI"
Cohesion: 0.09
Nodes (22): TableCellViewer(), useIsMobile(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay() (+14 more)

### Community 8 - "Date & Monthly Costs"
Cohesion: 0.13
Nodes (15): AmountCell(), getEntryDisplayAmount(), MONTH_NAMES, MonthlyCostsContent(), parseMonthParam(), Calendar(), CalendarDayButton(), Checkbox() (+7 more)

### Community 9 - "Navigation & Menus"
Cohesion: 0.17
Nodes (14): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+6 more)

### Community 10 - "App Sidebar Composition"
Cohesion: 0.18
Nodes (15): AppSidebar(), NavDocuments(), NavMain(), NavSecondary(), NavUser(), Sidebar(), SidebarContent(), SidebarFooter() (+7 more)

### Community 11 - "Currency & Filter Context"
Cohesion: 0.14
Nodes (18): CostPerKmCard, CurrencyContext / useCurrency, DateFilterContext / useDateFilter, EditIncomeForm, DataTable (egresos), lib/expense-types.ts — normalizeExpenseType, expenseTypeStringToNumber mappings, ExpenseBreakdownChart, ExpensePage (+10 more)

### Community 12 - "Cost Data Types"
Cohesion: 0.14
Nodes (17): AllMonthsData Type, CellPopover (inner), CostEntry Type, CostRow Type, components/cost-table.tsx — Annual cost table (12 monthly columns), CostRow, SummaryMonth, CostEntry types, DataTable, fetchWithAuth Function (+9 more)

### Community 13 - "CRUD Forms"
Cohesion: 0.3
Nodes (15): AddExpenseForm, AddIncomeForm, AddTripForm, EditExpenseForm, EditTripForm, Expense (data model), ExpenseCategory (type), fetchWithAuth() (+7 more)

### Community 14 - "Auth Flow"
Cohesion: 0.18
Nodes (13): POST /api/auth/login, components/app-sidebar.tsx — Application sidebar navigation, components/auth-guard.tsx — AuthGuard protects dashboard routes, GuestGuard, localStorage auth tokens (accessToken, refreshToken, tenantId, userId, username, email, tenantName, displayCurrency), LoginForm, NavDocuments, NavMain (+5 more)

### Community 15 - "Odometer Tracking"
Cohesion: 0.27
Nodes (7): OdometerReadingsPanel(), OdometerReadingsPanelProps, useOdometerReadings(), getOdometerSourceLabel(), OdometerReading, OdometerSource, SOURCE_LABELS

### Community 16 - "Fixed Cost Management"
Cohesion: 0.27
Nodes (11): components/add-cost-modal.tsx — Modal to add fixed/variable cost, AddFixedCostModal, POST /api/costs/entries, POST /api/costs/installments, POST /api/costs/templates, app/(dashboard)/configuracion/page.tsx — Expense category management, app/(dashboard)/costos/page.tsx — Fixed cost templates list and KPIs, types/expense-category.ts — ExpenseCategory type definition (+3 more)

### Community 17 - "Landing & Onboarding"
Cohesion: 0.22
Nodes (10): CTASection, HeroSection, LandingNav, SignupForm, TruckForm, AlertDialog (UI), Badge (UI), Button (UI) (+2 more)

### Community 18 - "Marketing Sections"
Cohesion: 0.22
Nodes (9): CTASection, FeaturesSection, LandingFooter, HeroSection, HowItWorks, KPISection, LandingNav, LandingPage (+1 more)

### Community 19 - "Toggle & Utility"
Cohesion: 0.39
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 21 - "Root Layout & Fonts"
Cohesion: 0.33
Nodes (4): geistMono, geistSans, metadata, Toaster()

### Community 22 - "Expense Type Enums"
Cohesion: 0.29
Nodes (4): expenseTypeLabels, expenseTypeStringLabels, expenseTypeStringToNumber, FIXED_EXPENSE_TYPES

### Community 23 - "Toggle Components"
Cohesion: 0.38
Nodes (7): cn Utility Function (clsx + tailwind-merge), Toggle UI Component, ToggleGroup UI Component, ToggleGroupItem UI Component, toggleVariants CVA definition, Tooltip UI Component, TooltipContent UI Component

### Community 24 - "Currency Display Utils"
Cohesion: 0.47
Nodes (6): CurrencyProvider React Provider, DisplayCurrency Type, formatBRL Function, formatCurrency2 Function, formatCurrency Function, getDisplayValue Function

### Community 25 - "Expense Type Utilities"
Cohesion: 0.5
Nodes (5): expenseTypeLabels Record (numeric), expenseTypeStringLabels Record (string), expenseTypeStringToNumber Record, getExpenseTypeLabel Function, normalizeExpenseType Function

### Community 26 - "Truck Management"
Cohesion: 0.5
Nodes (4): app/(dashboard)/camiones/columns.tsx — TanStack column defs for Truck list, app/(dashboard)/camiones/data-table.tsx — Generic DataTable component (TanStack Table), app/(dashboard)/camiones/page.tsx — Truck list page (CRUD), components/truck-form.tsx — TruckForm (React Hook Form + Zod)

### Community 27 - "Build & Monitoring Config"
Cohesion: 0.67
Nodes (3): next.config.ts — Next.js + Sentry config, sentry.client.config.ts — Sentry client-side init, sentry.server.config.ts — Sentry server-side init

### Community 28 - "Guest Auth Pages"
Cohesion: 0.67
Nodes (3): GuestGuard, LoginPage, LoginForm

## Knowledge Gaps
- **187 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `OdometerSource`, `SOURCE_LABELS` (+182 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Primitives` to `Core Dashboard CRUD`, `Fleet & Cost Pages`, `Data Table Layer`, `Layout & Landing`, `Sidebar & Sheet UI`, `Date & Monthly Costs`, `Navigation & Menus`, `App Sidebar Composition`, `Toggle & Utility`, `Auth Guards & Login`?**
  _High betweenness centrality (0.197) - this node is a cross-community bridge._
- **Why does `Button()` connect `Core Dashboard CRUD` to `Fleet & Cost Pages`, `Data Table Layer`, `Layout & Landing`, `UI Primitives`, `Sidebar & Sheet UI`, `Date & Monthly Costs`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Skeleton()` connect `Core Dashboard CRUD` to `Fleet & Cost Pages`, `UI Primitives`, `Sidebar & Sheet UI`, `Date & Monthly Costs`, `Odometer Tracking`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _187 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core Dashboard CRUD` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Fleet & Cost Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Data Table Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._