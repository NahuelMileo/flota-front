# Flota — Mileo Express Fleet Management

Sistema de gestión de flotas de transporte. Next.js 16 + React 19, shadcn/ui, Tailwind CSS 4, Recharts, React Hook Form + Zod, TanStack Table v8.

**Locale:** es-UY · **Moneda principal:** BRL (pt-BR) · **Moneda secundaria:** USD (en-US)

---

## Auth

- Login con email + password → Bearer token (JWT) en localStorage
- Signup con username, email, password (mín 8 chars, confirmación)
- Refresh automático de token en respuesta 401 (fetchWithAuth)
- Multitenant: al login, si no hay `tenantId` redirige a `/onboarding`
- Onboarding: crear empresa (POST `/api/tenants`) o unirse con invite code (POST `/api/companies/join`)
- AuthGuard protege rutas del dashboard; GuestGuard protege rutas públicas
- Datos en localStorage: `accessToken`, `refreshToken`, `username`, `email`, `userId`, `tenantId`, `tenantName`

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

- Listado con tabla: Matrícula (link a detalle), Modelo, Año, Acciones
- Alta: formulario con matrícula (requerida), modelo, año → POST `/api/trucks`
- Edición: mismos campos pre-cargados → PUT `/api/trucks/{id}`
- Eliminación: AlertDialog de confirmación → DELETE `/api/trucks/{id}`

### Detalle de camión (`/camiones/[id]`)

- Header: matrícula, modelo, año, botón volver
- KPI cards (3): Total Ingresos, Total Egresos, Balance Neto del camión
- Métricas (3): Total km (con conteo de viajes), Costo/km (egresos/km), Ingreso/km
- Tabla de viajes del camión (filtrada por truckId)
- Tabla de ingresos del camión
- Tabla de egresos del camión

---

## Viajes (`/trips`)

- Filtros: por camión y por estado (Programado / En progreso / Completado / Cancelado)
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
- Tabla: Descripción, Valor (BRL o USD), Moneda (badge), Camión (badge), Fecha, Tipo (badge), Acciones
- Alta: descripción, valor, fecha, camión (opcional), tipo (Flete/Otro), moneda (BRL/USD) → POST `/api/incomes`
- Edición: mismos campos pre-cargados → PUT `/api/incomes/{id}`
- Eliminación: AlertDialog → DELETE `/api/incomes/{id}`
- Exportar CSV: `incomes.csv` (descripción, valor, camión, fecha, tipo)
- Filtro por mes/año del contexto global

---

## Egresos (`/egresos`)

- Filtros: por camión, por tipo (11 tipos: Gasoil, Arla 32, Mantenimiento, Gomería, Aceite, Estacionamiento, Peaje, Salario, Contador, Financiamiento, Otro)
- KPI cards (2): Total Egresos con variación %, Costo/km (solo combustible)
- Gráfico: egresos por categoría (barras, ordenado desc)
- FuelEfficiencyCard (si hay registros con km + litros): km/L promedio, badge de eficiencia, tendencia, gráfico, tabla
- Tabla: Nombre, Tipo (badge), Valor (BRL), Camión, Fecha, Km, Litros, Acciones
- Alta: nombre (opcional), valor, fecha, camión (opcional), tipo, km y litros (solo si tipo es combustible: 1, 2, 5) → POST `/api/expenses`
- Edición: mismos campos → PUT `/api/expenses/{id}`
- Eliminación: AlertDialog → DELETE `/api/expenses/{id}`
- Exportar CSV: `egresos.csv` (nombre, tipo, valor, camión, fecha, km, litros)
- Filtro por mes/año del contexto global

---

## Métricas / Cálculos clave

| Métrica | Fórmula |
|---|---|
| Balance neto | ingresos - egresos |
| Variación % | (actual - anterior) / anterior × 100 |
| Costo/km (combustible) | Σ(valor combustible) / Σ(km combustible) |
| Costo/km (total) | Σ(todos egresos) / Σ(km de viajes) |
| Ingreso/km | Σ(ingresos) / Σ(km de viajes) |
| Eficiencia km/L | Σ(km) / Σ(litros) |
| Margen | utilidad / ingresos × 100 |

**Tipos combustible** (para filtros km/L y costo/km): 1=Gasoil, 2=Arla 32, 5=Aceite

---

## Modelos de datos

### Truck
```
{ id, licensePlate, model, year }
```

### Trip
```
{ id, departureDate, arrivalDate, origin, destination, truckId, truckLicensePlate, driverName, kilometers, status, notes }
```
Status: 1=Programado, 2=En progreso, 3=Completado, 4=Cancelado

### Income
```
{ id, description, value, truckId, truckLicensePlate, dateUtc, type, currency, tripId? }
```
Type: 1=Flete, 2=Otro · Currency: 1=USD, 2=BRL

### Expense
```
{ id, date, type, value, truckId, truckLicensePlate, name, kilometers, liters, tripId? }
```
Types: 1=Gasoil, 2=Arla 32, 3=Mantenimiento, 4=Gomería, 5=Aceite, 6=Estacionamiento, 7=Peaje, 8=Salario, 9=Contador, 10=Financiamiento, 11=Otro

---

## Arquitectura

- **Autenticación:** `fetchWithAuth()` en `lib/api.ts` — agrega Bearer token, refresca en 401
- **Filtro global de fecha:** `DateFilterContext` en `context/date-filter-context.tsx`, provisto en el layout del dashboard
- **Tablas:** componente genérico `DataTable` (TanStack Table) con búsqueda, ordenamiento y export CSV opcional
- **Formularios:** React Hook Form + Zod en todos los CRUD
- **Notificaciones:** `sonner` (toast)
- **Monitoreo:** Sentry (`sentry.client.config.ts`, `sentry.server.config.ts`)
