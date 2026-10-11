import type { ReactNode } from "react"

function Svg({ size, width = 1.5, children }: { size: number; width?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

// Flecha de los CTA: se corre al hacer hover sobre el [data-btn] que la contiene.
export function ArrowIcon({ size = 17 }: { size?: number }) {
  return (
    <span data-arrow="" style={{ display: "inline-flex" }}>
      <Svg size={size}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </Svg>
    </span>
  )
}

export function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M9 10c.5 2 2 3.5 4 4l1.2-1.2 2 .8v1.6c-4 .4-8-3.6-7.6-7.6H10l.8 2Z" />
    </Svg>
  )
}

export function CheckIcon({ size = 12, width = 2.2 }: { size?: number; width?: number }) {
  return (
    <Svg size={size} width={width}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  )
}

export function BellIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Svg>
  )
}

export function CloseIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Svg>
  )
}

export function MenuIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Svg>
  )
}

export function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Svg>
  )
}

export function ShieldIcon() {
  return (
    <Svg size={24}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </Svg>
  )
}

export function LockIcon() {
  return (
    <Svg size={24}>
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  )
}

export function DownloadIcon() {
  return (
    <Svg size={24}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </Svg>
  )
}

export function CopyIcon() {
  return (
    <Svg size={15}>
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </Svg>
  )
}

export function CursorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#0B0C0E" stroke="#FAFAF8" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
    </svg>
  )
}
