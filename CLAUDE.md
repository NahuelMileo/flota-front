# Flota — Mileo Express Fleet Management - Frontend

Sistema de gestión de flotas de transporte. Next.js 16 + React 19, shadcn/ui, Tailwind CSS 4, Recharts, React Hook Form + Zod, TanStack Table v8.

**Locale:** es-UY · **Monedas soportadas:** BRL, USD, UYU

---

## Auth

- Login con email + password → sesión vía **cookies httpOnly** (no Bearer token, no JWT en localStorage)
- Signup con username, email, password (mín 8 chars, confirmación)
- Refresh automático en respuesta 401 (`fetchWithAuth`) vía `POST /api/auth/refresh`, con `credentials: "include"` — el refresh token no se maneja en el cliente, viaja en cookie
- Multitenant: al login, si no hay `tenantId` redirige a `/onboarding`
- Onboarding: crear empresa (POST `/api/tenants`) o unirse con invite code (POST `/api/companies/join`)
- AuthGuard protege rutas del dashboard; GuestGuard protege rutas públicas
- Datos en localStorage: solo `tenantId` y `displayCurrency` — `accessToken`, `refreshToken`, `username`, `email`, `userId`, `tenantName` ya **no** se persisten en el cliente (migración a cookies httpOnly)

---

## Multi-moneda

- Toda respuesta de income, expense y costEntry incluye `value` (original) + `valueUSD`, `valueBRL`, `valueUYU` (convertidos al momento de creación)
- El usuario elige moneda de visualización (USD / BRL / UYU) desde el selector en el header → persiste en localStorage y en `/api/users/me/currency`
- **Contexto:** `CurrencyProvider` en `context/currency-context.tsx` — provee `displayCurrency`, `setDisplayCurrency`, `getDisplayValue(item)`
- **Formateo:** `formatCurrency(value, currency)` y `formatCurrency2(value, currency)` en `lib/format.ts`
  - USD → `U$S 518`, BRL → `R$ 3.000`, UYU → `UYU 20.488`
- `getDisplayValue(item)` elige el campo correcto (`valueUSD`/`valueBRL`/`valueUYU`) con fallback a `value`
- **Nunca usar `formatBRL`/`formatBRL2` para mostrar montos** — usar siempre `formatCurrency` con `displayCurrency`
- Tipos que tienen los 3 campos: `Income`, `Expense`, `CostEntry`, `CostTemplate`

---

## Landing (`/landing`)

- Página de marketing: HeroSection, ProblemSection, FeaturesSection, KPISection, HowItWorks, CTASection
- No requiere autenticación

---

## Dashboard (`/dashboard`)

- KPI cards (4): Total Ingresos, Total Egresos, Balance Neto, Costo/km
- Variación % vs mes anterior (verde/rojo) en ingreso y egreso
- Gráfico de barras: comparativa últimos 6 meses (ingresos vs egresos)
- Filtro por mes/año (DateFilterContext compartido con todo el dashboard)
- Skeletons de carga para cada métrica

---

## Camiones (`/camiones`)

- Listado con tabla: Matrícula (link a detalle), Modelo, Año, Km actual, Km/mes estimado, Acciones
- Alta/Edición: `TruckForm` (React Hook Form + Zod) — matrícula (requerida), modelo, año, km iniciales (decimal, opcional), km mensuales estimados (opcional, tooltip explicativo) → POST/PUT `/api/trucks/{id}`
- El PUT preserva `currentKm` del estado existente (no es campo editable)
- Eliminación: AlertDialog de confirmación → DELETE `/api/trucks/{id}`
- Badge naranja "Falta configurar km estimados" en detalle si no tiene `estimatedMonthlyKm`

### Detalle de camión (`/camiones/[id]`)

- Header: matrícula, modelo, año, botón volver, link "Costos fijos"
- KPI cards (3): Total Ingresos, Total Egresos, Balance Neto del camión
- Métricas fila 1 (3): Total km (con conteo de viajes), Costo/km (egresos/km de viajes), Ingreso/km
- Métricas fila 2 (condicional): Costo/km desde costos fijos (`monthlyCost / estimatedMonthlyKm`), Km actual (con "Hace X días" si hay `lastKmUpdatedAt`), Km mensuales estimados
- Tabla de viajes del camión (filtrada por truckId)
- Tabla de ingresos del camión
- Tabla de egresos del camión

### Costos de camión (`/camiones/[id]/costos`)

- Tabla anual de costos fijos y variables (12 columnas, una por mes) — componente `CostTable`
- Fila "Costo x KM": usa `costPerKm` del summary del backend; si es null y el camión tiene `estimatedMonthlyKm`, calcula `monthTotal / estimatedMonthlyKm`
- PATCH `/api/costs/entries/{id}` para marcar pagado o editar monto
- DELETE para templates, entries e installment plans

---

## Viajes (`/trips`)

- Filtros: por camión, por estado, y checkbox "Solo viajes abiertos" (InProgress) — activo por defecto muestra todos
- Viajes con estado InProgress o Scheduled siempre se muestran independientemente del filtro de mes
- Stats cards: total de viajes, kilómetros totales
- Tabla: Salida, Ruta (origen → destino), Camión, Chofer, Km, Estado (badge con color), Acciones
- Alta: fecha salida, fecha llegada, origen, destino, camión (required), chofer, km, estado, notas → POST `/api/trips`
- Edición: mismos campos → PUT `/api/trips/{id}`
- Eliminación: AlertDialog → DELETE `/api/trips/{id}`
- Filtro por mes/año del contexto global

### Detalle de viaje (`/trips/[id]`)

- Header: título "origen → destino", fecha, botones editar/eliminar
- Info grid (2 col): datos del viaje + resumen financiero
- Resumen financiero: ingresos, egresos, utilidad, margen %, costo/km, ingreso/km
- Sección ingresos: lista + botón agregar ingreso (dialog)
- Sección egresos: lista + botón agregar egreso (dialog)
- Tabla de breakdown de egresos por tipo (%, monto)
- FuelEfficiencyCard: km/L, costo/km, precio/L, tendencia, gráfico, tabla detalle

---

## Ingresos (`/ingresos`)

- Filtros: por camión, por tipo (Flete / Otro)
- KPI card: total ingresos con variación %
- Gráfico: ingresos por camión (barras, ordenado desc, "Sin asignar" para sin camión)
- Tabla: Descripción, Valor (en moneda de visualización), Moneda original (badge), Camión (badge), Fecha, Tipo (badge), Acciones
- Alta: descripción, valor, fecha, camión (opcional), tipo (Flete/Otro), moneda (BRL/USD/UYU) → POST `/api/incomes`
  - Si tipo = Flete: opción de crear egreso de salario para chofer (default 15%, configurable 0-100%)
- Edición: mismos campos pre-cargados → PUT `/api/incomes/{id}`
- Eliminación: AlertDialog → DELETE `/api/incomes/{id}`
- Exportar CSV: `incomes.csv` (descripción, valor, camión, fecha, tipo)
- Filtro por mes/año del contexto global
- **Enum normalización:** API devuelve `type` como string (`"Freight"`, `"Other"`); usar `normalizeIncomeType()` de `columns.tsx` para mapear a `"1"`/`"2"` en formularios y filtros

---

## Egresos (`/egresos`)

- **Categorías dinámicas:** los egresos usan `ExpenseCategory` (`{ id, name, isDefault }`) de GET `/api/expense-categories` — ya no existe el enum numérico de 17 tipos ni `lib/expense-types.ts`
- Las categorías se administran (CRUD) desde `/configuracion`
- Filtros: por camión, por categoría (`expenseCategoryId`)
- Filtro por camión también coincide por `truckLicensePlate` cuando `truckId` es null
- KPI card: Total Egresos con variación % (si hay camión seleccionado, suma el costo fijo mensual del summary)
- Gráfico: egresos por categoría (barras, ordenado desc)
- Tabla: Nombre, Tipo (badge con `categoryName`), Valor (en moneda de visualización), Camión, Fecha, Km, Litros, Acciones
- Alta: nombre (opcional), valor, fecha, camión (opcional), categoría, moneda (BRL/USD/UYU), km y litros solo si la categoría es combustible → POST `/api/expenses`
- **Detección de combustible por nombre de categoría:** `FUEL_CATEGORY_NAMES` = `Gasoil`, `Arla32`/`Arla 32`, `Aceite` (en AddExpenseForm y EditExpenseForm)
- Edición: mismos campos → PUT `/api/expenses/{id}`
- Eliminación: AlertDialog → DELETE `/api/expenses/{id}`
- Exportar CSV: `egresos.csv` (nombre, tipo, valor, camión, fecha, km, litros)
- Filtro por mes/año del contexto global

---

## Cuentas a Recibir (`/cuentas-a-recibir`)

- Reemplaza el Excel de cobranza: cada fila es un flete a cobrar, con **adelanto** (70% del flete, al cargar), **saldo** (30%, al descargar) y **peaje** (aparte del split)
- Filtros: por cliente, por camión, por estado (Pendiente / Parcial / Cobrado)
- Resumen (`components/receivables-summary.tsx`): la cifra a recibir, cuántos fletes la componen, cuánto se cobró del total, y una barra de proporción con los mismos verde/rojo de la grilla. Los totales se calculan con `useMemo`, no vienen del backend. Deliberadamente **no** son cards: la pantalla responde una sola pregunta (cuánto falta cobrar)
- Tabla: Fecha, Camión, Cliente, Adelanto, Saldo, Peaje, Total, Estado, Acciones
- **Colores replicando la planilla original:** las celdas de identidad (fecha, camión, cliente, total, estado) van pintadas a color pleno con el `color` del camión; las de monto, verde si está cobrado y rojo si está pendiente (vacías si el ítem es 0). El color del texto se calcula por luminancia con `readableTextColor()` de `lib/color-contrast.ts`, porque el color lo elige el usuario y un gris oscuro necesita texto blanco
- **Cada celda de monto es clickeable:** roja → POST `/api/receivables/{id}/collect`; verde → confirmación → DELETE `/api/receivables/{id}/collect/{kind}`. Ambos endpoints devuelven la cuenta actualizada, así que se reemplaza la fila sin refetchear
- El pintado se aplica con la prop `getCellStyle` de `DataTable` (opcional, la usa solo esta pantalla), alimentada por `getReceivableCellStyle()` de `columns.tsx`
- **El estado de cobro es derivado:** no hay flag; un ítem está cobrado si existe un `Income` de esa cuenta con ese `receivableKind`. Cobrar crea el ingreso, deshacer lo borra
- Alta/Edición: cliente y camión (requeridos), fecha, moneda, valor del flete, peaje → el 70/30 se precarga al tipear el flete y queda editable (al tocar el adelanto, el saldo se recalcula); zod valida que sumen el flete
- Si el camión tiene un viaje activo, el form lo sugiere y lo vincula (`GET /api/trips/active?truckId=`) — nunca obligatorio: los choferes no siempre reportan los km
- Eliminación: AlertDialog que avisa cuántos cobros se borran junto con la cuenta → DELETE `/api/receivables/{id}`
- Exportar CSV: `cuentas-a-recibir.csv`
- Los montos por ítem se muestran en la moneda del registro; los totales, en la moneda de visualización

### Receivable
```
{ id, clientId, clientName, truckId, truckLicensePlate, truckColor, tripId?,
  dateUtc, currency, freightValue, advanceAmount, balanceAmount, tollAmount,
  totalAmount, collectedAmount, pendingAmount, status, items[], notes,
  valueUSD, valueBRL, valueUYU }
```
- `items[]`: `{ kind, amount, status, incomeId, collectedAt }` — `kind` (API string): `"Advance"` | `"Balance"` | `"Toll"`; `status`: `"NotApplicable"` | `"Pending"` | `"Collected"`
- `status` de la cuenta (API string): `"Pending"` | `"Partial"` | `"Collected"`
- `Income` suma `receivableId`, `receivableKind` y `receivableClientName` cuando es el cobro de una cuenta — el diálogo de borrado en `/ingresos` lo usa para avisar
- Tipos y helpers en `types/receivable.ts`; clientes vía `hooks/use-clients.ts`

### Truck.color

Hex `#RRGGBB` opcional, editable en el ABM de camiones con una paleta predefinida. Es cómo se reconoce el camión de un vistazo en cuentas a recibir (en el Excel era el color de fondo de la fila).

---

## Resúmenes de pantalla (patrón compartido)

Las pantallas **no** usan cards de KPI. Total, hecho y pendiente suelen ser el mismo dato visto de tres ángulos, así que se muestran como una cifra prominente, una línea de contexto y una barra de proporción:

- `components/proportion-summary.tsx` — "cuánto falta de X": headline + contexto + barra. Lo usan `/cuentas-a-recibir` (vía `receivables-summary.tsx`), `/costos/mensual` y `/costos`. Los colores de la barra son los mismos que usa la tabla de esa pantalla.
- `components/month-balance.tsx` — balance de un período: utilidad, margen, barra de egresos sobre ingresos y la composición con variación %. Lo usan `/dashboard`, `/camiones/[id]` y `/trips/[id]` (este último le pasa costo/km e ingreso/km como children y `period="en este viaje"`).
- `components/total-line.tsx` — una sola cifra con su conteo y variación, para `/ingresos` y `/egresos`.

Cifras siempre con `tabular-nums`, si no las columnas de números bailan al cambiar de ancho los dígitos.

**Ninguna pantalla del dashboard usa `Card`.** Las secciones se separan con un `<h2 className="border-b pb-2 font-semibold">` y espaciado — incluidos los charts y las listas de movimientos. Los datos que acompañan a una cifra (km, ratios por km, fechas) van como `<dl>` en línea, no como una caja por dato. En `month-balance.tsx` la utilidad va en verde y la pérdida en rojo, con el texto ("de utilidad" / "de pérdida") diciendo lo mismo para no depender solo del color.

---

## Métricas / Cálculos clave

| Métrica | Fórmula |
|---|---|
| Balance neto | ingresos - egresos |
| Variación % | (actual - anterior) / anterior × 100 |
| Costo/km (combustible) | Σ(valor combustible) / Σ(km combustible) |
| Costo/km (viajes) | Σ(todos egresos) / Σ(km de viajes) |
| Costo/km (costos fijos) | monthlyCost / estimatedMonthlyKm — nunca hardcodear km |
| Ingreso/km | Σ(ingresos) / Σ(km de viajes) |
| Eficiencia km/L | Σ(km) / Σ(litros) |
| Margen | utilidad / ingresos × 100 |

**Categorías combustible** (para filtros km/L y costo/km): se detectan por nombre de categoría — `Gasoil`, `Arla32`/`Arla 32`, `Aceite`

---

## Modelos de datos

### Truck
```
{ id, licensePlate, model?, year?, currentKm?, estimatedMonthlyKm?, lastKmUpdatedAt?, color? }
```
- `currentKm`: solo lectura desde frontend (no editable en formulario, se preserva en PUT)
- `estimatedMonthlyKm`: usado para calcular costo/km — nunca hardcodear un valor fijo

### Trip
```
{ id, departureDate, arrivalDate, origin, destination, truckId, truckLicensePlate, driverName, kilometers, status, notes }
```
Status API (string): `"Scheduled"`, `"InProgress"`, `"Completed"`, `"Cancelled"` — EditTripForm mapea a `"1"`/`"2"`/`"3"`/`"4"` internamente

### Income
```
{ id, description, value, valueUSD, valueBRL, valueUYU, currency, truckId, truckLicensePlate, dateUtc, type, tripId?, receivableId?, receivableKind?, receivableClientName? }
```
- `type` (API string): `"Freight"` = Flete, `"Other"` = Otro — usar `normalizeIncomeType()` para mapear a `"1"`/`"2"`
- `currency` (API string): `"USD"` | `"BRL"` | `"UYU"`

### Expense
```
{ id, date, createdAt, expenseCategoryId, categoryName, value, valueUSD, valueBRL, valueUYU, currency, truckId, truckLicensePlate, name, kilometers, liters, tripId? }
```
- `expenseCategoryId` + `categoryName`: referencia a la categoría dinámica (ver Egresos) — reemplazó al viejo enum numérico `type`
- `currency` (API string): `"USD"` | `"BRL"` | `"UYU"`

### ExpenseCategory
```
{ id, name, isDefault }
```
- GET/POST/PUT/DELETE `/api/expense-categories` — administradas por el usuario en `/configuracion`

### CostEntry
```
{ id, name, amount, valueUSD?, valueBRL?, valueUYU?, type, scope?, isPaid, truckId?, truckLicensePlate?, month?, year?, ... }
```
- `amount`: valor original; usar `valueUSD`/`valueBRL`/`valueUYU` para mostrar en moneda de visualización
- Edición de monto (PATCH) siempre envía el valor en moneda original

### CostTemplate
```
{ id, name, amount, valueUSD?, valueBRL?, valueUYU?, type, scope, truckId?, isActive, expenseCategoryId, categoryName, truckLicensePlate? }
```

---

## Costos fijos (`/costos`)

- Lista de templates de costos fijos de la empresa (scope: `PerTruck` | `CompanyWide`)
- CRUD de templates → GET/POST/PUT/DELETE `/api/costs/templates`
- KPIs: Total mensual, Por camión, Toda la empresa — todos en moneda de visualización
- Link a "Vista mensual" del mes actual

### Vista mensual (`/costos/mensual?month=2026-04`)

- Una sola llamada: GET `/api/costs/monthly?month=X&year=Y` (sin truckId = todas las entries del tenant)
- Entries agrupadas por `truckId`; `truckId === null` → bucket "Sin camión"
- KPIs: Total, Pagado, Pendiente — todos en moneda de visualización
- Por grupo: subtotal pagado/total + costo/km si el camión tiene `estimatedMonthlyKm`
- Badge "Falta configurar" si el camión no tiene `estimatedMonthlyKm`
- Marcar pagado: PATCH `/api/costs/entries/{id}` `{ isPaid }`
- Editar monto (solo si `!isPaid`): PATCH `/api/costs/entries/{id}` `{ amount }`
- Los company-wide ya vienen prorrateados con `truckId` asignado por el backend

---

## Mantenimientos (`/mantenimientos`)

- CRUD de mantenimientos de camiones, con conceptos administrables en `/mantenimientos/conceptos`
- Tipos: `Maintenance` y `MaintenanceConcept` en `types/maintenance.ts`; hook `use-maintenance-concepts.ts`
- `Maintenance` sigue el patrón multi-moneda (`value`, `valueUSD`, `valueBRL`, `valueUYU`)
- Se vincula a una categoría de egreso (`expenseCategoryId`) y opcionalmente a un egreso (`expenseId`) o viaje (`tripId`) existente

---

## Lecturas de odómetro

- `OdometerReading` (`types/odometer.ts`) registra actualizaciones de `currentKm` del camión, con `source`: `"Manual"`, `"FuelExpense"`, `"MaintenanceExpense"`, `"TripStart"`, `"TripEnd"`
- Hook `use-odometer-readings.ts`
- `currentKm` del camión ya no se actualiza solo manualmente: se alimenta también desde gastos de combustible/mantenimiento y desde el inicio/fin de viajes

---

## Arquitectura

- **Autenticación:** `fetchWithAuth()` en `lib/api.ts` — envía `credentials: "include"` (cookies httpOnly), refresca en 401 vía `POST /api/auth/refresh`. Acepta rutas relativas (`fetchWithAuth("/api/trucks")`) y las resuelve contra `NEXT_PUBLIC_API_URL`; usar siempre rutas relativas, no repetir el env var en los call sites. Para fetch sin auth (login/signup) usar `apiUrl(path)` del mismo módulo
- **Filtro global de fecha:** `DateFilterContext` en `context/date-filter-context.tsx`, provisto en el layout del dashboard
- **Moneda de visualización:** `CurrencyProvider` en `context/currency-context.tsx`, provisto en el layout del dashboard (wrappea a DateFilterProvider)
- **Filtros de listado:** `components/filter-select.tsx` — `<FilterSelect label value onChange options allLabel />`. Un filtro no es un campo de formulario (no se completa, describe el estado de la vista), así que va sin marco, con el label adentro del control ("Camión · Todos") y el valor resaltado cuando el filtro está activo. `null` significa sin filtrar; el componente se encarga de la opción "todos". No repetir bloques de `<Select>` sueltos por página: dentro de un formulario sí va el `<Select>` con borde
- **Tablas:** componente genérico compartido `components/data-table.tsx` (TanStack Table) con búsqueda, ordenamiento, paginación y export CSV opcional — lo usan **todas** las rutas con listados; no crear data-tables locales por ruta. Para listados que la API pagina y filtra (como `/clientes`), pasar la prop `serverSide={{ page, pageCount, onPageChange, search, onSearchChange }}`: la tabla muestra las filas tal como llegan y delega paginado y búsqueda, en vez de filtrar en memoria solo la página visible.

  Las únicas dos tablas que **no** pasan por `DataTable` son las que no son un listado plano: `components/cost-table.tsx` (matriz concepto × 12 meses con primera columna fija) y la tabla agrupada por camión de `/costos/mensual`. Mantienen a mano el mismo encabezado (`text-xs font-medium text-muted-foreground`), sin marco exterior y con divisorias horizontales.
- **Camiones:** hook `useTrucks()` en `hooks/use-trucks.ts` para cargar la lista de camiones (solo lectura) — no duplicar el fetch en cada página
- **Formularios:** React Hook Form + Zod en todos los CRUD; campos numéricos opcionales usan `setValueAs` (no `valueAsNumber`) para evitar conflictos con el resolver
- **Enum normalización en formularios de edición:** la API devuelve strings (`"Freight"`, `"InProgress"`) — siempre normalizar antes de usar como defaultValue en selects numéricos (`normalizeIncomeType`, mapeo de status en EditTripForm)
- **Tipos compartidos:** `types/truck.ts`, `types/costs.ts`, `types/expense-category.ts` — no duplicar tipos localmente
- **Notificaciones:** `sonner` (toast) — `position` y `richColors` se configuran globalmente en el `<Toaster />` de `app/layout.tsx`; no pasarlos por llamada
- **Monitoreo:** Sentry (`sentry.client.config.ts`, `sentry.server.config.ts`)
