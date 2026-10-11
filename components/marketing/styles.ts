import type { CSSProperties } from "react"

export const MONO = "var(--font-geist-mono), ui-monospace, monospace"

export const WRAP: CSSProperties = {
  maxWidth: 1264,
  margin: "0 auto",
  padding: "0 clamp(20px,4vw,32px)",
}

export const SECTION_GAP = "clamp(88px,11vw,128px)"

export const H2: CSSProperties = {
  margin: 0,
  fontSize: "clamp(32px,4vw,52px)",
  fontWeight: 500,
  letterSpacing: "-0.03em",
  lineHeight: 1.06,
}

export const H3_FEATURE: CSSProperties = {
  margin: "14px 0 0",
  fontSize: "clamp(30px,3.4vw,44px)",
  fontWeight: 500,
  letterSpacing: "-0.03em",
  lineHeight: 1.08,
  textWrap: "balance",
}

export const H3_TILE: CSSProperties = { margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }

export const LEAD: CSSProperties = {
  margin: "20px 0 0",
  fontSize: 18,
  lineHeight: 1.6,
  color: "#4A4F57",
  textWrap: "pretty",
}

export const TILE_TEXT: CSSProperties = { margin: "10px 0 0", fontSize: 16, lineHeight: 1.55, color: "#4A4F57" }

export const EYEBROW: CSSProperties = { fontFamily: MONO, fontSize: 13, letterSpacing: ".06em", color: "#13865A" }

export const SR_ONLY: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
}

export const TABLE_HEAD: CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "#5F656E",
  background: "#F7F6F3",
  borderBottom: "1px solid rgba(11,12,14,0.07)",
}

export const INSET_PANEL: CSSProperties = {
  borderRadius: 12,
  background: "#F3F2EE",
  border: "1px solid rgba(11,12,14,0.07)",
}

export const PILL: CSSProperties = {
  padding: "5px 10px",
  borderRadius: 99,
  border: "1px solid rgba(11,12,14,0.10)",
}
