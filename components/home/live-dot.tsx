import { cn } from "@/lib/utils"

export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--home-accent)] motion-safe:animate-[home-pulse-dot_2s_ease-in-out_infinite]",
        className
      )}
      aria-hidden="true"
    />
  )
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LiveDot />
      <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--home-text-tertiary)]">
        {children}
      </span>
    </div>
  )
}
