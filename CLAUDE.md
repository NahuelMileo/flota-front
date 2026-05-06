# Flota — Mileo Express Fleet Management - Frontend

Sistema de gestión de flotas de transporte. Next.js 16 + React 19, shadcn/ui, Tailwind CSS 4, Recharts, React Hook Form + Zod, TanStack Table v8.

**Locale:** es-UY · **Monedas soportadas:** BRL, USD, UYU

---

## Auth

- Login con email + password → Bearer token (JWT) en localStorage
- Signup con username, email, password (mín 8 chars, confirmación)
- Refresh automático de token en respuesta 401 (fetchWithAuth)
- Multitenant: al login, si no hay `tenantId` redirige a `/onboarding`
- Onboarding: crear empresa (POST `/api/tenants`) o unirse con invite code (POST `/api/companies/join`)
- AuthGuard protege rutas del dashboard; GuestGuard protege rutas públicas
- Datos en localStorage: `accessToken`, `refreshToken`, `username`, `email`, `userId`, `tenantId`, `tenantName`, `displayCurrency`

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

- Filtros: por camión, por tipo (17 tipos)
- Filtro por camión también coincide por `truckLicensePlate` cuando `truckId` es null
- Filtro por tipo normaliza el string enum del API (`"Gasoil"` → `1`) via `expenseTypeStringToNumber`
- KPI cards (2): Total Egresos con variación %, Costo/km (solo combustible)
- Gráfico: egresos por categoría (barras, ordenado desc)
- FuelEfficiencyCard (si hay registros con km + litros): km/L promedio, badge de eficiencia, tendencia, gráfico, tabla
- Tabla: Nombre, Tipo (badge), Valor (en moneda de visualización), Camión, Fecha, Km, Litros, Acciones
- Alta: nombre (opcional), valor, fecha, camión (opcional), tipo, moneda (BRL/USD/UYU), km y litros (solo si tipo es combustible: 1, 2, 5) → POST `/api/expenses`
- Edición: mismos campos → PUT `/api/expenses/{id}`
- Eliminación: AlertDialog → DELETE `/api/expenses/{id}`
- Exportar CSV: `egresos.csv` (nombre, tipo, valor, camión, fecha, km, litros)
- Filtro por mes/año del contexto global
- **Enum normalización:** API devuelve `type` como string (`"Gasoil"`, `"Arla32"`, etc.); usar `normalizeExpenseType()` de `lib/expense-types.ts` en formularios de edición

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

**Tipos combustible** (para filtros km/L y costo/km): 1=Gasoil, 2=Arla 32, 5=Aceite

---

## Modelos de datos

### Truck
```
{ id, licensePlate, model?, year?, currentKm?, estimatedMonthlyKm?, lastKmUpdatedAt? }
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
{ id, description, value, valueUSD, valueBRL, valueUYU, currency, truckId, truckLicensePlate, dateUtc, type, tripId? }
```
- `type` (API string): `"Freight"` = Flete, `"Other"` = Otro — usar `normalizeIncomeType()` para mapear a `"1"`/`"2"`
- `currency` (API string): `"USD"` | `"BRL"` | `"UYU"`

### Expense
```
{ id, date, type, value, valueUSD, valueBRL, valueUYU, currency, truckId, truckLicensePlate, name, kilometers, liters, tripId? }
```
- `type` (API string): `"Gasoil"`, `"Arla32"`, `"Maintenance"`, etc. — usar `normalizeExpenseType()` para mapear a `"1"`–`"17"`
- `currency` (API string): `"USD"` | `"BRL"` | `"UYU"`
- Types numéricos: 1=Gasoil, 2=Arla 32, 3=Mantenimiento, 4=Gomería, 5=Aceite, 6=Estacionamiento, 7=Peaje, 8=Salario, 9=Contador, 10=Financiamiento, 11=Otro, 12=Administrativo, 13=IPVA, 14=Rastreador, 15=Cooperativa, 16=Seguro, 17=Equipo Operacional

### CostEntry
```
{ id, name, amount, valueUSD?, valueBRL?, valueUYU?, type, scope?, isPaid, truckId?, truckLicensePlate?, month?, year?, ... }
```
- `amount`: valor original; usar `valueUSD`/`valueBRL`/`valueUYU` para mostrar en moneda de visualización
- Edición de monto (PATCH) siempre envía el valor en moneda original

### CostTemplate
```
{ id, name, amount, valueUSD?, valueBRL?, valueUYU?, type, scope, truckId?, isActive, expenseType, truckLicensePlate? }
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

## Arquitectura

- **Autenticación:** `fetchWithAuth()` en `lib/api.ts` — agrega Bearer token, refresca en 401
- **Filtro global de fecha:** `DateFilterContext` en `context/date-filter-context.tsx`, provisto en el layout del dashboard
- **Moneda de visualización:** `CurrencyProvider` en `context/currency-context.tsx`, provisto en el layout del dashboard (wrappea a DateFilterProvider)
- **Tablas:** componente genérico `DataTable` (TanStack Table) con búsqueda, ordenamiento y export CSV opcional
- **Formularios:** React Hook Form + Zod en todos los CRUD; campos numéricos opcionales usan `setValueAs` (no `valueAsNumber`) para evitar conflictos con el resolver
- **Enum normalización en formularios de edición:** la API devuelve strings (`"Freight"`, `"Gasoil"`, `"InProgress"`) — siempre normalizar antes de usar como defaultValue en selects numéricos
- **Tipos compartidos:** `types/truck.ts`, `types/costs.ts` — no duplicar tipos localmente
- **Notificaciones:** `sonner` (toast)
- **Monitoreo:** Sentry (`sentry.client.config.ts`, `sentry.server.config.ts`)
