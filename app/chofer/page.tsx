"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTrucks } from "@/hooks/use-trucks";
import { fetchWithAuth } from "@/lib/api";
import {
  discard,
  enqueue,
  flushQueue,
  onQueueChange,
  readQueue,
  type DriverAction,
  type DriverActionType,
} from "@/lib/driver-outbox";
import { Camera, CheckCircle2, CloudUpload, Flag, Fuel, Truck as TruckIcon, WifiOff } from "lucide-react";
import { toast } from "sonner";

// El viaje que el chofer tiene abierto en este teléfono. Se guarda local para saber si
// mostrar "Salí" o "Llegué" aunque no haya señal para preguntarle al servidor.
type OpenTrip = { truckId: string; localTripId: string | null; tripId: string | null; at: string; km: number | null };

const TRUCK_KEY = "chofer.truckId";
const OPEN_TRIP_KEY = "chofer.openTrip";
const RETRY_MS = 30_000;

function load<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sin almacenamiento la pantalla sigue andando mientras esté abierta.
  }
}

const ACTION_LABELS: Record<DriverActionType, string> = {
  depart: "Salida",
  arrive: "Llegada",
  fuel: "Gasoil",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("es-UY", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const parseNumber = (v: string) => {
  const n = parseFloat(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

const subscribeOnline = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

// La cola vive en localStorage: el snapshot se cachea por string para que React no vea
// un objeto nuevo en cada render.
let queueSnapshot: { raw: string; value: DriverAction[] } = { raw: "", value: [] };
function getQueueSnapshot() {
  const value = readQueue();
  const raw = JSON.stringify(value);
  if (raw !== queueSnapshot.raw) queueSnapshot = { raw, value };
  return queueSnapshot.value;
}
const EMPTY_QUEUE: DriverAction[] = [];

export default function DriverPage() {
  const trucks = useTrucks();
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  const queue = useSyncExternalStore(onQueueChange, getQueueSnapshot, () => EMPTY_QUEUE);

  // AuthGuard no renderiza la pantalla hasta montar en el cliente, así que se puede leer
  // lo guardado en el teléfono al inicializar (en el servidor no hay localStorage).
  const [truckId, setTruckIdState] = useState<string | null>(() => load<string>(TRUCK_KEY));
  const [openTrip, setOpenTripState] = useState<OpenTrip | null>(() => load<OpenTrip>(OPEN_TRIP_KEY));
  const [action, setAction] = useState<DriverActionType | null>(null);

  const setTruckId = (id: string) => {
    setTruckIdState(id);
    save(TRUCK_KEY, id);
  };
  const setOpenTrip = (trip: OpenTrip | null) => {
    setOpenTripState(trip);
    save(OPEN_TRIP_KEY, trip);
  };

  // Un solo camión: se elige solo.
  const effectiveTruckId = truckId ?? (trucks.length === 1 ? trucks[0].id : null);
  const truck = trucks.find((t) => t.id === effectiveTruckId);
  const tripOpenHere = openTrip && openTrip.truckId === effectiveTruckId ? openTrip : null;

  // Con señal, el servidor dice si el camión ya tiene un viaje en curso (por ejemplo, lo
  // abrió el dueño desde la web). Lo local manda si hay algo sin subir.
  useEffect(() => {
    if (!effectiveTruckId || !online || tripOpenHere) return;
    let cancelled = false;
    fetchWithAuth(`/api/trips/by-truck?truckId=${effectiveTruckId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((trips: { id: string; status: string; departureDate: string }[]) => {
        const inProgress = trips.find((t) => t.status === "InProgress");
        if (!cancelled && inProgress) {
          setOpenTrip({ truckId: effectiveTruckId, localTripId: null, tripId: inProgress.id, at: inProgress.departureDate, km: null });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [effectiveTruckId, online, tripOpenHere]);

  // Sube lo pendiente al abrir, al volver la señal y cada 30 s mientras quede algo.
  const flush = useCallback(() => {
    flushQueue().catch(() => {});
  }, []);
  useEffect(() => {
    flush();
    window.addEventListener("online", flush);
    const timer = window.setInterval(() => {
      if (readQueue().length > 0) flush();
    }, RETRY_MS);
    return () => {
      window.removeEventListener("online", flush);
      window.clearInterval(timer);
    };
  }, [flush]);

  function submit(values: { km: number | null; value?: number; liters?: number | null }) {
    if (!effectiveTruckId || !action) return;
    const at = new Date().toISOString();
    if (action === "depart") {
      const localTripId = crypto.randomUUID();
      enqueue({ type: "depart", truckId: effectiveTruckId, localTripId, tripId: null, at, km: values.km });
      setOpenTrip({ truckId: effectiveTruckId, localTripId, tripId: null, at, km: values.km });
    } else if (action === "arrive" && tripOpenHere) {
      enqueue({ type: "arrive", truckId: effectiveTruckId, localTripId: tripOpenHere.localTripId, tripId: tripOpenHere.tripId, at, km: values.km });
      setOpenTrip(null);
    } else if (action === "fuel") {
      enqueue({
        type: "fuel",
        truckId: effectiveTruckId,
        localTripId: tripOpenHere?.localTripId ?? null,
        tripId: tripOpenHere?.tripId ?? null,
        at,
        km: values.km,
        value: values.value,
        liters: values.liters ?? null,
      });
    }
    setAction(null);
    toast.success(navigator.onLine ? "Guardado. Subiendo…" : "Guardado en el teléfono. Se sube cuando haya señal.");
    flush();
  }

  const pending = queue.filter((a) => !a.error);
  const failed = queue.filter((a) => a.error);

  return (
    <div className="flex flex-1 flex-col gap-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <TruckIcon className="size-5 shrink-0 text-muted-foreground" />
          {trucks.length > 1 || !truck ? (
            <Select
              items={trucks.map((t) => ({ label: t.licensePlate, value: t.id }))}
              value={effectiveTruckId ?? ""}
              onValueChange={(v) => v && setTruckId(v)}
            >
              <SelectTrigger className="h-10 min-w-40 text-base font-semibold">
                <SelectValue placeholder="Elegí tu camión" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {trucks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.licensePlate}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <span className="truncate text-lg font-semibold">{truck.licensePlate}</span>
          )}
        </div>
        <SyncBadge online={online} pending={pending.length} />
      </header>

      {tripOpenHere ? (
        <p className="rounded-lg border bg-muted/50 px-4 py-3 text-sm">
          Viaje en curso desde el <span className="font-medium">{formatTime(tripOpenHere.at)}</span>
          {tripOpenHere.km != null && <> · salida en {tripOpenHere.km.toLocaleString("es-UY")} km</>}
        </p>
      ) : (
        <p className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Sin viaje en curso. Al salir, apretá &quot;Salí&quot; y sacale foto al odómetro.
        </p>
      )}

      <div className="grid gap-3">
        {tripOpenHere ? (
          <BigButton icon={Flag} label="Llegué" hint="Foto del odómetro" disabled={!effectiveTruckId} onClick={() => setAction("arrive")} />
        ) : (
          <BigButton icon={Camera} label="Salí" hint="Foto del odómetro" disabled={!effectiveTruckId} onClick={() => setAction("depart")} />
        )}
        <BigButton icon={Fuel} label="Cargué gasoil" hint="Foto del ticket" variant="outline" disabled={!effectiveTruckId} onClick={() => setAction("fuel")} />
      </div>

      {queue.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Por subir</h2>
          <ul className="divide-y rounded-lg border">
            {[...pending, ...failed].map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">
                    {ACTION_LABELS[a.type]}
                    {a.km != null && <span className="font-normal text-muted-foreground"> · {a.km.toLocaleString("es-UY")} km</span>}
                  </p>
                  <p className={a.error ? "truncate text-destructive" : "text-muted-foreground"}>
                    {a.error ? a.error : formatTime(a.at)}
                  </p>
                </div>
                {a.error ? (
                  <Button variant="ghost" size="sm" onClick={() => discard(a.id)}>
                    Descartar
                  </Button>
                ) : (
                  <CloudUpload className="size-4 shrink-0 text-muted-foreground" />
                )}
              </li>
            ))}
          </ul>
          {online && pending.length > 0 && (
            <Button variant="outline" className="w-full" onClick={flush}>
              Subir ahora
            </Button>
          )}
        </section>
      )}

      <ActionDrawer
        action={action}
        lastKm={tripOpenHere?.km ?? truck?.currentKm ?? null}
        onClose={() => setAction(null)}
        onSubmit={submit}
      />
    </div>
  );
}

function SyncBadge({ online, pending }: { online: boolean; pending: number }) {
  if (!online) {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-xs text-warning">
        <WifiOff className="size-3.5" />
        Sin señal{pending > 0 ? ` · ${pending}` : ""}
      </span>
    );
  }
  if (pending > 0) {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground">
        <CloudUpload className="size-3.5" />
        {pending} por subir
      </span>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-success-border bg-success-surface px-3 py-1 text-xs text-success">
      <CheckCircle2 className="size-3.5" />
      Todo subido
    </span>
  );
}

function BigButton({
  icon: Icon,
  label,
  hint,
  variant = "default",
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  variant?: "default" | "outline";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={variant}
      disabled={disabled}
      onClick={onClick}
      className="h-24 w-full justify-start gap-4 rounded-2xl px-6 text-left"
    >
      <Icon className="size-8 shrink-0" />
      <span className="flex flex-col">
        <span className="text-xl font-semibold">{label}</span>
        <span className="text-sm font-normal opacity-70">{hint}</span>
      </span>
    </Button>
  );
}

const DRAWER_TITLES: Record<DriverActionType, string> = {
  depart: "Salida",
  arrive: "Llegada",
  fuel: "Carga de gasoil",
};

function ActionDrawer({
  action,
  lastKm,
  onClose,
  onSubmit,
}: {
  action: DriverActionType | null;
  lastKm: number | null;
  onClose: () => void;
  onSubmit: (values: { km: number | null; value?: number; liters?: number | null }) => void;
}) {
  return (
    <Drawer open={action !== null} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        {/* Se remonta en cada apertura: arranca vacío sin resetear a mano. */}
        {action && <ActionForm key={action} action={action} lastKm={lastKm} onClose={onClose} onSubmit={onSubmit} />}
      </DrawerContent>
    </Drawer>
  );
}

function ActionForm({
  action,
  lastKm,
  onClose,
  onSubmit,
}: {
  action: DriverActionType;
  lastKm: number | null;
  onClose: () => void;
  onSubmit: (values: { km: number | null; value?: number; liters?: number | null }) => void;
}) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [km, setKm] = useState("");
  const [value, setValue] = useState("");
  const [liters, setLiters] = useState("");
  const isFuel = action === "fuel";

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo);
  }, [photo]);

  const kmNumber = parseNumber(km);
  const valueNumber = parseNumber(value);
  // Un km menor al último conocido casi siempre es un dígito mal leído: se avisa, no se bloquea.
  const kmLooksWrong = kmNumber != null && lastKm != null && kmNumber < lastKm;
  const canSave = isFuel ? valueNumber != null && valueNumber > 0 : kmNumber != null;

  return (
    <div className="mx-auto w-full max-w-md">
      <DrawerHeader>
        <DrawerTitle>{DRAWER_TITLES[action]}</DrawerTitle>
        <DrawerDescription>
          {isFuel ? "Sacale foto al ticket y anotá el monto." : "Sacale foto al odómetro y anotá los km."}
        </DrawerDescription>
      </DrawerHeader>

      <div className="space-y-4 px-4">
        <label className="flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted/40 text-muted-foreground">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Foto cargada" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-sm">
              <Camera className="size-8" />
              {isFuel ? "Foto del ticket" : "Foto del odómetro"}
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPhoto(URL.createObjectURL(file));
            }}
          />
        </label>

        {isFuel && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fuel-value">Monto (R$)</Label>
              <Input id="fuel-value" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="h-12 text-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fuel-liters">Litros</Label>
              <Input id="fuel-liters" inputMode="decimal" value={liters} onChange={(e) => setLiters(e.target.value)} className="h-12 text-lg" />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="km">Km del odómetro{isFuel ? " (opcional)" : ""}</Label>
          <Input
            id="km"
            inputMode="numeric"
            placeholder={lastKm != null ? `Último: ${lastKm.toLocaleString("es-UY")}` : "152340"}
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="h-12 text-lg tabular-nums"
          />
          {kmLooksWrong && (
            <p className="text-sm text-warning">Es menor que el último registrado. Revisá el número.</p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          La foto queda en el teléfono por ahora; todavía no se sube al sistema.
        </p>
      </div>

      <DrawerFooter>
        <Button
          className="h-12 text-base"
          disabled={!canSave}
          onClick={() =>
            onSubmit({
              km: kmNumber,
              ...(isFuel ? { value: valueNumber ?? 0, liters: parseNumber(liters) } : {}),
            })
          }
        >
          Guardar
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </DrawerFooter>
    </div>
  );
}
