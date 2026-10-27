import { fetchWithAuth } from "@/lib/api";

/*
  Cola local de la pantalla del chofer (/chofer).

  En ruta no hay señal: cada acción ("Salí", "Llegué", "Gasoil") se guarda primero en el
  teléfono y se sube cuando vuelve la conexión, igual que un mensaje de WhatsApp. La hora
  que vale es la del teléfono (`at`), no la de la subida.

  "Llegué" puede quedar en la cola antes de que "Salí" haya subido: los dos comparten el
  `localTripId` que genera el teléfono, y el id real del viaje se resuelve al subir.

  Pendiente del back (ver choferes.md): rol Driver con acceso de larga duración, fotos en
  el servidor e idempotencia por id de acción. Hoy usa las APIs de viajes y egresos con la
  sesión de la web, y la foto queda solo en el teléfono.
*/

export type DriverActionType = "depart" | "arrive" | "fuel";

export type DriverAction = {
  id: string;
  type: DriverActionType;
  truckId: string;
  // Viaje del lado del teléfono: "Salí" lo crea, "Llegué" y "Gasoil" lo referencian.
  localTripId: string | null;
  // Id real del viaje si ya se conocía al cargar la acción (viaje abierto antes).
  tripId: string | null;
  at: string;
  km: number | null;
  value?: number;
  liters?: number | null;
  attempts: number;
  error?: string;
};

const QUEUE_KEY = "chofer.outbox";
const TRIP_MAP_KEY = "chofer.tripMap";
const CHANGE_EVENT = "chofer-outbox-change";

// localStorage puede fallar (modo privado, cuota llena): la pantalla tiene que seguir.
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sin almacenamiento la acción igual se intenta subir mientras la pantalla esté abierta.
  }
}

export function readQueue(): DriverAction[] {
  return read<DriverAction[]>(QUEUE_KEY, []);
}

function saveQueue(queue: DriverAction[]) {
  write(QUEUE_KEY, queue);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function onQueueChange(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function enqueue(action: Omit<DriverAction, "id" | "attempts">) {
  saveQueue([...readQueue(), { ...action, id: crypto.randomUUID(), attempts: 0 }]);
}

export function discard(id: string) {
  saveQueue(readQueue().filter((a) => a.id !== id));
}

function tripMap(): Record<string, string> {
  return read<Record<string, string>>(TRIP_MAP_KEY, {});
}

function resolveTripId(action: DriverAction): string | null {
  if (action.tripId) return action.tripId;
  return action.localTripId ? (tripMap()[action.localTripId] ?? null) : null;
}

// Fecha local del teléfono (YYYY-MM-DD): el viaje es del día en que el chofer apretó.
function localDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

class PermanentError extends Error {}

async function ensureOk(res: Response) {
  if (res.ok) return;
  const body = await res.json().catch(() => ({}));
  const message = body.message || body.title || `Error ${res.status}`;
  // 4xx no se arregla reintentando: queda marcado para que el chofer o el dueño lo vean.
  if (res.status >= 400 && res.status < 500) throw new PermanentError(message);
  throw new Error(message);
}

async function sendDepart(action: DriverAction) {
  const res = await fetchWithAuth(`/api/trips`, {
    method: "POST",
    body: JSON.stringify({
      departureDate: localDate(action.at),
      // La ruta la pone la fila de la planilla al vincular la cuenta a recibir.
      origin: "Sin ruta",
      destination: "Sin ruta",
      truckId: action.truckId,
      driverName: null,
      kilometers: null,
      initialKm: action.km,
      status: 2, // InProgress
      notes: "Cargado desde el celular del chofer",
    }),
  });
  await ensureOk(res);
  const trip = await res.json();
  if (action.localTripId) write(TRIP_MAP_KEY, { ...tripMap(), [action.localTripId]: trip.id });
}

async function sendArrive(action: DriverAction) {
  const tripId = resolveTripId(action);
  // "Salí" todavía no subió: se reintenta en la próxima vuelta, en orden.
  if (!tripId) throw new Error("Esperando que suba la salida");
  const current = await fetchWithAuth(`/api/trips/${tripId}`);
  await ensureOk(current);
  const trip = await current.json();
  const res = await fetchWithAuth(`/api/trips/${tripId}`, {
    method: "PUT",
    body: JSON.stringify({
      departureDate: trip.departureDate,
      arrivalDate: localDate(action.at),
      origin: trip.origin,
      destination: trip.destination,
      truckId: trip.truckId,
      driverName: trip.driverName ?? null,
      kilometers: trip.kilometers ?? null,
      initialKm: trip.initialKm ?? null,
      finalKm: action.km,
      status: 3, // Completed
      notes: trip.notes ?? null,
    }),
  });
  await ensureOk(res);
}

async function sendFuel(action: DriverAction, fuelCategoryId: string | null) {
  const res = await fetchWithAuth(`/api/expenses`, {
    method: "POST",
    body: JSON.stringify({
      date: localDate(action.at),
      value: action.value,
      currency: "BRL",
      truckId: action.truckId,
      tripId: resolveTripId(action),
      name: "Gasoil",
      kilometers: null,
      liters: action.liters ?? null,
      odometerKm: action.km,
      expenseCategoryId: fuelCategoryId,
    }),
  });
  await ensureOk(res);
}

const FUEL_CATEGORY_KEY = "chofer.fuelCategoryId";

// Categoría "Gasoil" del tenant, guardada en el teléfono: se busca solo cuando hay señal.
async function fuelCategoryId(): Promise<string | null> {
  const cached = read<string | null>(FUEL_CATEGORY_KEY, null);
  if (cached) return cached;
  const res = await fetchWithAuth(`/api/expense-categories`);
  if (!res.ok) return null;
  const categories: { id: string; name: string }[] = await res.json();
  const fuel = categories.find((c) => c.name.trim().toLowerCase() === "gasoil") ?? null;
  if (fuel) write(FUEL_CATEGORY_KEY, fuel.id);
  return fuel?.id ?? null;
}

let flushing: Promise<void> | null = null;

// Sube la cola en orden. Se corta en el primer error de red: sin señal no tiene sentido
// seguir, y el orden importa ("Salí" antes que "Llegué").
export function flushQueue() {
  // El finally se engancha después de asignar: si la cola está vacía la función termina
  // enseguida, y limpiar `flushing` adentro dejaría colgada una promesa ya resuelta.
  if (!flushing) flushing = runQueue().finally(() => (flushing = null));
  return flushing;
}

async function runQueue() {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  // Se relee la cola en cada vuelta: toma también lo que el chofer cargue mientras sube.
  for (;;) {
    const action = readQueue().find((a) => !a.error);
    if (!action) return;
    try {
      if (action.type === "depart") await sendDepart(action);
      else if (action.type === "arrive") await sendArrive(action);
      else await sendFuel(action, await fuelCategoryId());
      saveQueue(readQueue().filter((a) => a.id !== action.id));
    } catch (e) {
      const permanent = e instanceof PermanentError;
      saveQueue(
        readQueue().map((a) =>
          a.id === action.id
            ? { ...a, attempts: a.attempts + 1, error: permanent ? (e as Error).message : undefined }
            : a,
        ),
      );
      if (!permanent) return;
    }
  }
}
