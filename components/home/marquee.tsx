import { MARQUEE_ITEMS } from "@/components/home/demo-data"

// Franja de metadata operativa — no es un banner publicitario. Se duplica el
// contenido una vez para poder loopear con un desplazamiento continuo del 50%.
export function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div
      className="relative overflow-hidden border-y border-[var(--home-border)] bg-[var(--home-surface)] py-4"
      aria-hidden="true"
    >
      <div className="flex w-max animate-[home-marquee_60s_linear_infinite] motion-reduce:animate-none">
        {items.map((item, i) => (
          <div key={i} className="flex shrink-0 items-center gap-8 px-8">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium tracking-[0.14em] text-[var(--home-text-tertiary)]">
              {item}
            </span>
            <span className="block h-1 w-1 shrink-0 rounded-full bg-[var(--home-border-strong)]" />
          </div>
        ))}
      </div>
    </div>
  )
}
