import { cn } from "@/lib/utils"

// "Kilometr" in Geist, "IA" in JetBrains Mono + accent green — a small,
// recurring signature tying the name to the product's data-driven core.
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-base font-medium tracking-tight text-[var(--home-text)]", className)}>
      Kilometr
      <span className="font-[family-name:var(--font-jetbrains-mono)] font-medium text-[var(--home-accent)]">
        IA
      </span>
    </span>
  )
}
