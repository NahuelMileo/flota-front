# AGENTS.md - Instrucciones para AI Agents y Developers (frontend)

**Reglas obligatorias para escribir código en `flota-front`.** El detalle de cada pantalla, los modelos de datos y el porqué de cada decisión están en [`CLAUDE.md`](./CLAUDE.md). Este archivo resume lo que no se puede romper. Las reglas del backend (DTOs, tenants, seguridad) están en `flota-back/AGENTS.md`.

---

## Tabla de contenidos

1. [Antes de empezar](#1-antes-de-empezar)
2. [Diseño - sin cards](#2-diseño---sin-cards)
3. [Componentes compartidos](#3-componentes-compartidos)
4. [Movimiento y cargas](#4-movimiento-y-cargas)
5. [Datos y API](#5-datos-y-api)
6. [Fechas, monedas y enums](#6-fechas-monedas-y-enums)
7. [Formularios](#7-formularios)
8. [Tiempo real y notificaciones](#8-tiempo-real-y-notificaciones)
9. [Seguridad](#9-seguridad)
10. [Textos](#10-textos)
11. [Git commits](#11-git-commits)
12. [Workflow - pantalla o módulo nuevo](#12-workflow---pantalla-o-módulo-nuevo)

---

# 1. Antes de empezar

- **Stack:** Next.js 16 (App Router, rutas del panel en `app/(dashboard)/`), React 19, Tailwind 4 y shadcn con estilo `base-nova` sobre **`@base-ui/react`**, no Radix. Además React Hook Form + Zod 4, TanStack Table 8, date-fns 4, Recharts, sonner y SignalR.
- **Mirá cómo están hechas las pantallas existentes antes de diseñar una nueva.** Buenos modelos:
  - `/dashboard`
  - `/camiones/[id]`
  - `/cuentas-a-recibir`
  - `/vencimientos`
  - `components/month-balance.tsx`
  - `components/proportion-summary.tsx`

  Si algo nuevo no se parece al resto, está mal aunque se vea bien.
- **Comandos de verificación.** No hay tests de front, así que estos dos son el piso:
  - `npm run typecheck`
  - `npm run lint`

  Los errores de lint que ya existían en archivos que no tocaste no son tuyos; no sumes nuevos.
- Si cambiás cómo funciona una pantalla, actualizá su sección en `CLAUDE.md` en el mismo cambio.

# 2. Diseño - sin cards

**Ninguna pantalla del panel usa cards.** Tampoco sirven como reemplazo las cajas con borde redondeado, los "bento" ni las grillas de tarjetas de KPI. Esto vale aunque el pedido diga "card": se resuelve con el patrón de sección.

```tsx
// ✅ CORRECTO - sección
<section className="space-y-3">
  <h2 className="border-b pb-2 font-semibold">Próximos vencimientos</h2>
  <dl className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
    <div className="flex gap-1.5">
      <dt className="text-muted-foreground">Vencidos</dt>
      <dd className="font-medium tabular-nums">3</dd>
    </div>
  </dl>
  <ul className="divide-y">…</ul>
</section>

// ❌ INCORRECTO
<Card><CardHeader>Vencidos</CardHeader><CardContent>3</CardContent></Card>
<div className="rounded-xl border p-4">…</div>   // una card con otro nombre
```

- **Secciones:** `<h2 className="border-b pb-2 font-semibold">` y espaciado.
- **Datos que acompañan una cifra** (km, ratios, conteos, fechas): `<dl>` en línea, no una caja por dato.
- **Resúmenes de pantalla:**
  - Una cifra prominente, una línea de contexto y, si aplica, una barra de proporción.
  - Componentes: `MonthBalance`, `ProportionSummary`, `TotalLine`.
- **Tablas y listas:** sin marco exterior, con divisorias horizontales y encabezado `text-xs font-medium text-muted-foreground`.
- **Cifras:** siempre con `tabular-nums`.
- **Colores de estado:** tokens `danger`, `warning` y `success`, con sus variantes `-surface` y `-border`. Nunca `red-500`/`green-500` sueltos.
  - El color nunca es el único indicador: va acompañado de texto o ícono.
- **Color del camión:** `truck.color` (hex) identifica al camión en toda la app: cuentas a recibir, calendario de vencimientos, matrículas.
  - El texto sobre ese color se calcula con `readableTextColor()` de `lib/color-contrast.ts`, nunca con un color fijo.
- **Responsive:** tiene que funcionar a ~400px.
  - Una grilla ancha (calendario, matriz de costos) va dentro de `overflow-x-auto` o se reemplaza por lista en móvil (`useIsMobile`).
- **Componentes base-ui:** los triggers usan `render={<Button …/>}`. No existe `asChild`.

# 3. Componentes compartidos

Usá el que existe; no crees una variante local.

| Necesidad | Usar |
|---|---|
| Listado | `components/data-table.tsx` (`DataTable`, `DataTableSkeleton`). Con paginado del servidor: prop `serverSide` |
| Filtro de listado | `components/filter-select.tsx` (`FilterSelect`), no un `<Select>` con borde |
| Formulario de alta/edición | `Sheet` + formulario + `components/sheet-form-actions.tsx` |
| Borrar | `AlertDialog` con confirmación |
| Recarga con datos en pantalla | `components/refreshing.tsx` |
| Cifras que cambian | `components/animated-figure.tsx` |
| Camiones | `useTrucks()` de `hooks/use-trucks.ts` |
| Toasts | `toast` de `sonner`, sin pasar `position`/`richColors` |
| Tipos | `types/*.ts`, nunca duplicados en la pantalla |

# 4. Movimiento y cargas

- Duraciones solo con los tokens `--dur-fast`, `--dur-base` y `--dur-figure` y la curva `ease-emphasis`.
- Nada de scroll reveals ni animaciones de landing dentro del panel.
- **Skeletons** solo en la primera carga (`isLoading && !data`). Un refetch con datos en pantalla usa `<Refreshing busy>`.
- Contenido que reemplaza un skeleton: clase `.fv-rise`.
- **Las columnas de `DataTable` van en `useMemo` con dependencias estables.** Estado que cambia seguido no entra en `getColumns`, porque desmonta todas las celdas (ver "Movimiento" en `CLAUDE.md`).

# 5. Datos y API

```ts
// ✅ CORRECTO
const res = await fetchWithAuth(`/api/due-dates?from=${from}&to=${to}`)
if (!res.ok) throw new Error(await errorMessage(res, "Error al cargar"))

// ❌ INCORRECTO
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/due-dates`, { headers: { Authorization: … } })
```

- **Siempre `fetchWithAuth` con ruta relativa** (`lib/api.ts`): manda las cookies y refresca en 401.
  - Solo login y registro usan `apiUrl()` sin auth.
  - La pantalla OAuth usa `fetchWithSession`.
- No hay react-query ni SWR: `useCallback` + `useEffect` + `useState`, o un contexto si varias pantallas comparten el dato.
- **Errores:** el back responde `{ message }` o un ProblemDetails (`title`, `errors`). Leelo con `errorMessage(res, fallback)` de `lib/api.ts` y mostralo con `toast.error`.
- Si un endpoint devuelve la entidad actualizada, reemplazá la fila en memoria en vez de refetchear todo.
- **Pantallas con filtro de mes:** al crear o editar en memoria respetá el mes elegido con `isInSelectedMonth()` de `lib/month-filter.ts`.
- **Nunca mandes `tenantId` ni `userId` en el body o la URL.** El back los toma del token.

# 6. Fechas, monedas y enums

- **Fechas de negocio** (`yyyy-MM-dd`):
  - Parsear con `parseIsoDate()` y serializar con `toIsoDate()` (`lib/due-date-format.ts`).
  - ❌ `new Date("2026-09-20")` la interpreta como UTC y en Uruguay cae el día anterior.
- **"Hoy" y estados que dependen de la fecha** (vencido, próximo, días restantes) **los calcula el back** en hora de Montevideo. El front los muestra, no los recalcula.
- **Montos:**
  - Mostralos en la moneda de visualización: `useCurrency()` + `getDisplayValue(item)` + `formatCurrency(value, currency)`.
  - ❌ `formatBRL`.
- **Enums:** llegan como string (`"Overdue"`, `"Freight"`). Normalizalos antes de usarlos como `defaultValue` de un select numérico.
- **Locale** `es-UY` para `Intl` y `date-fns` (`locale: es`). La semana empieza el lunes.

# 7. Formularios

- React Hook Form + `zodResolver`.
- **El schema de Zod refleja las validaciones del DTO del back** (`flota-back/AGENTS.md` §10): mismos requeridos, largos y rangos. Si cambia el DTO, cambia el schema.
- Números opcionales con `setValueAs`, no `valueAsNumber`.
- Labels con `*` en los obligatorios. `FieldError` debajo de cada campo y `FieldDescription` para explicar el efecto (ej. cuándo avisa).
- El botón de guardar va en `SheetFormActions`, pegado abajo, con estado `isSubmitting`.

# 8. Tiempo real y notificaciones

- **Una sola conexión SignalR:** `RealtimeProvider` (`context/realtime-context.tsx`).
  - Para reaccionar a un evento: `useRealtimeEvent("DueDatesChanged", refetch)`.
  - ❌ Abrir otra `HubConnection`.
- **Los eventos no traen datos.** Siempre se refetchea el GET: la fuente de verdad es REST.
- **La campanita es una sola** (`components/notifications/notifications-bell.tsx`), con secciones por tipo y contador sumado. Un tipo nuevo de aviso suma una sección, no otra campanita.
- **Lo leído es por usuario**, y lo decide el back.
  - El `isRead` que llega ya es del usuario logueado: lo que marca uno no le cambia nada a otro de la empresa.
  - No guardes leídos en `localStorage` ni los compartas entre usuarios.
  - Marcar como leído: update optimista y rollback + toast si falla.
- Avisos que dependen del día: además del evento, refetch al volver a la pestaña (`visibilitychange`).

# 9. Seguridad

- **Sesión solo en cookies httpOnly.**
  - En `localStorage` solo `isAuthenticated`, `tenantId`, `displayCurrency` y datos de presentación.
  - ❌ Tokens, emails de otros o cualquier dato sensible.
- ❌ `dangerouslySetInnerHTML` con datos del usuario o de la API.
- **Redirecciones:**
  - Nunca armes URLs de redirección OAuth en el front: se usa el `redirectUrl` que devuelve el back.
  - `returnTo` pasa siempre por `lib/return-to.ts`.
- Colores, nombres y notas vienen del usuario: se renderizan como texto. Un color va en `style`, nunca interpolado en clases de Tailwind.
- No expongas IDs internos ni datos de otro tenant en URLs compartibles. Los query params de la UI (`?fecha=`, `?vista=`) son solo estado de vista.

# 10. Textos

- Español rioplatense con voseo, como el resto de la app: "Elegí", "Marcá", "Agregá".
- Breves y en palabras del negocio: "Vencido", "Falta 1 día", "Cuentas a recibir", no "Registro expirado".
- Estados vacíos que digan qué pasa ("Nada vence en los próximos 30 días."), no solo "Sin datos".

# 11. Git commits

Mismo estándar que el back (`flota-back/AGENTS.md` §8): `categoría: descripción corta` en minúsculas y en español.

| Categoría | Uso |
|---|---|
| `feat:` | Pantalla o funcionalidad nueva |
| `fix:` | Bug |
| `refactor:` | Cambio interno sin cambio visible |
| `style:` | Ajuste visual sin cambiar comportamiento |
| `docs:` | `AGENTS.md`, `CLAUDE.md` |
| `security:` | Cambio de seguridad |

Ramas `feat/<modulo>` o `fix/<tema>`, con el mismo nombre que la del back si el cambio va en los dos repos.

# 12. Workflow - pantalla o módulo nuevo

1. **Tipos** en `types/<modulo>.ts`, alineados con el `ResponseDto` del back.
2. **Helpers** de formato y labels en `lib/<modulo>-format.ts`.
3. **Página** en `app/(dashboard)/<ruta>/page.tsx`, columnas en `columns.tsx` y formulario en `components/<modulo>/`.
4. **Navegación:**
   - Ítem en `navGroups` de `components/app-sidebar.tsx`, en el grupo que corresponda.
   - Título en `PAGE_TITLES` de `components/site-header.tsx`.
5. **Tiempo real** si el back emite un evento: `useRealtimeEvent`.
6. **Revisión visual:**
   - Comparala con dos pantallas existentes.
   - Sin cards, cifras `tabular-nums`, colores con tokens.
   - Probar a 400px.
7. `npm run typecheck && npm run lint`.
8. **Documentar** la sección del módulo en `CLAUDE.md`.

### Checklist antes de commitear

- [ ] ¿Sin `Card` ni cajas con borde que hagan de card?
- [ ] ¿Usé `DataTable`, `FilterSelect`, `Sheet` + `SheetFormActions` en vez de variantes locales?
- [ ] ¿Todos los fetch con `fetchWithAuth` y ruta relativa?
- [ ] ¿Las fechas `yyyy-MM-dd` con `parseIsoDate`/`toIsoDate`?
- [ ] ¿El schema de Zod coincide con el DTO del back?
- [ ] ¿Columnas de tabla en `useMemo` estable?
- [ ] ¿Skeleton solo en la primera carga?
- [ ] ¿Funciona a 400px?
- [ ] ¿`typecheck` y `lint` sin errores nuevos?
- [ ] ¿Actualicé `CLAUDE.md`?
