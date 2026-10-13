"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { EASE, EVENTS, JOIN_CODE, TODAY, TONES, fmt } from "./demo-data"
import { BellIcon, CopyIcon } from "./icons"
import { useLanding } from "./landing"
import { EYEBROW, H2, H3_FEATURE, H3_TILE, INSET_PANEL, LEAD, MONO, PILL, SECTION_GAP, SR_ONLY, TILE_TEXT } from "./styles"

function FeatureRow({
  id,
  eyebrow,
  title,
  lead,
  srText,
  reverse,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  lead: string
  srText: string
  reverse?: boolean
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      style={{
        display: "flex",
        flexWrap: "wrap",
        flexDirection: reverse ? "row-reverse" : "row",
        gap: "clamp(40px,6vw,88px)",
        alignItems: "center",
      }}
    >
      <div style={{ flex: "1 1 360px", minWidth: 0, maxWidth: 480 }}>
        <div data-reveal="" style={EYEBROW}>
          {eyebrow}
        </div>
        <h3 id={id} data-reveal="" style={H3_FEATURE}>
          {title}
        </h3>
        <p data-reveal="" style={LEAD}>
          {lead}
        </p>
        <p style={SR_ONLY}>{srText}</p>
      </div>
      <div data-reveal="" style={{ flex: "1.4 1 460px", minWidth: 0 }}>
        {children}
      </div>
    </section>
  )
}

function DemoCard({ demo, padding, children }: { demo?: string; padding: string; children: ReactNode }) {
  return (
    <div data-spot="" data-demo={demo} aria-hidden="true" className="kmbr-card" style={{ padding }}>
      <div className="kmbr-spot" />
      {children}
    </div>
  )
}

const LEGEND_ROW: CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 13, color: "#5F656E" }

function LucroDemo() {
  const { c } = useLanding()
  const t = c.lucro
  const [hov, setHov] = useState(c.trucks[0].plate)
  const h = c.trucks.find((tr) => tr.plate === hov) ?? c.trucks[0]
  const maxGain = Math.max(...c.trucks.map((tr) => tr.g))
  const sub: CSSProperties = { fontFamily: "inherit", fontSize: 13, color: "#5F656E" }
  return (
    <DemoCard padding="clamp(16px,2.4vw,28px)">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>{t.card}</div>
        <div style={{ ...PILL, fontFamily: MONO, fontSize: 12, color: "#5F656E" }}>{t.unit}</div>
      </div>
      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 6 }}>
        {c.trucks.map((tr, i) => {
          const tone = TONES[tr.tone]
          const ratio = Math.max(0.06, tr.g / maxGain)
          return (
            <div
              key={tr.plate}
              onMouseEnter={() => setHov(tr.plate)}
              onClick={() => setHov(tr.plate)}
              style={{
                display: "grid",
                gridTemplateColumns: "52px minmax(0,1fr) 56px",
                alignItems: "center",
                gap: 14,
                padding: "12px 10px",
                borderRadius: 10,
                cursor: "default",
                background: hov === tr.plate ? "rgba(11,12,14,0.03)" : "transparent",
                transition: "background-color .2s",
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 500 }}>{tr.plate}</span>
              <span style={{ position: "relative", height: 28, borderRadius: 7, background: "rgba(11,12,14,0.04)", overflow: "hidden" }}>
                <span
                  data-grow="x"
                  data-delay={200 + i * 110}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 7,
                    background: tone.grad,
                    transformOrigin: "0 50%",
                    transform: `scaleX(${ratio.toFixed(3)})`,
                  }}
                />
                {tr.tone === "amber" && (
                  <span
                    style={{
                      position: "absolute",
                      left: `calc(${(ratio * 100).toFixed(1)}% + 10px)`,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#8A560C",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.low}
                  </span>
                )}
              </span>
              <span
                data-count={tr.g}
                data-dec="2"
                style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontSize: 15, textAlign: "right", color: tone.fg }}
              >
                {tr.gain}
              </span>
            </div>
          )
        })}
      </div>
      <div
        style={{
          ...INSET_PANEL,
          marginTop: 18,
          padding: "16px 18px",
          display: "grid",
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          gap: 12,
          fontFamily: MONO,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <div>
          <div style={sub}>
            {t.inc} · {h.plate}
          </div>
          <div style={{ marginTop: 4, fontSize: 18 }}>{h.inc}</div>
        </div>
        <div>
          <div style={sub}>{t.cost}</div>
          <div style={{ marginTop: 4, fontSize: 18, color: "#4A4F57" }}>− {h.cost}</div>
        </div>
        <div>
          <div style={sub}>{t.gain}</div>
          <div style={{ marginTop: 4, fontSize: 18, color: TONES[h.tone].fg }}>= {h.gain}</div>
        </div>
      </div>
      <div style={{ ...LEGEND_ROW, marginTop: 14 }}>
        <span>{t.hint}</span>
        <span className="kmbr-demotag">{c.hero.demoTag}</span>
      </div>
    </DemoCard>
  )
}

function AvisosDemo() {
  const { c } = useLanding()
  const t = c.avisos
  // Octubre 2026 arranca jueves: tres celdas vacías con la semana empezando el lunes.
  const cells = [...Array.from({ length: 3 }, () => null), ...Array.from({ length: 31 }, (_, i) => i + 1)]
  return (
    <DemoCard demo="avisos" padding="clamp(16px,2.4vw,28px)">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        <div style={{ flex: "1 1 240px", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 500 }}>{t.month}</span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: "#5F656E" }}>{t.dueDates}</span>
          </div>
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "repeat(7,minmax(0,1fr))",
              gap: 4,
              textAlign: "center",
              fontFamily: MONO,
              fontSize: 11,
              color: "#5F656E",
            }}
          >
            {t.weekdays.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 4 }}>
            {cells.map((d, i) => {
              const event = d ? EVENTS[d] : undefined
              return (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    aspectRatio: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    fontFamily: MONO,
                    fontVariantNumeric: "tabular-nums",
                    fontSize: 13,
                    color: !d ? "transparent" : d === TODAY ? "#FAFAF8" : d < TODAY ? "#9AA0A8" : "#3A3F47",
                    background: d === TODAY ? "#0B0C0E" : event ? "rgba(11,12,14,0.04)" : "transparent",
                    boxShadow: event ? "inset 0 0 0 1px rgba(11,12,14,0.08)" : "none",
                  }}
                >
                  {d ?? ""}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 4,
                      left: "50%",
                      width: 5,
                      height: 5,
                      marginLeft: -2.5,
                      borderRadius: 99,
                      background: event ?? "transparent",
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ flex: "1 1 240px", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div className="kmbr-odo">
            <div className="kmbr-odo-top">
              <span>{t.odo.title}</span>
              <span>{t.odo.every}</span>
            </div>
            <span className="kmbr-odo-digits" data-odo-num="" data-from={t.odo.from} data-to={t.odo.to} data-service={t.odo.serviceAt}>
              {fmt(t.odo.from)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              data-bell=""
              style={{
                position: "relative",
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "#F3F2EE",
                border: "1px solid rgba(11,12,14,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0B0C0E",
                transformOrigin: "50% 10%",
              }}
            >
              <BellIcon size={19} />
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 18,
                  height: 18,
                  padding: "0 5px",
                  borderRadius: 99,
                  background: "#C8352D",
                  color: "#FAFAF8",
                  fontFamily: MONO,
                  fontSize: 11,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {t.alerts.length}
              </span>
            </span>
            <span style={{ fontSize: 16, fontWeight: 500 }}>{t.alertsTitle}</span>
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {t.alerts.map((a, i) => {
              // El primer aviso es el cambio de aceite: lo maneja el odómetro.
              const odo = i === 0
              return (
                <div
                  key={a.label}
                  data-reveal=""
                  data-delay="500"
                  className="kmbr-alert"
                  data-urgent={a.urgent ? "1" : "0"}
                  data-odo-alert={odo ? "" : undefined}
                >
                  <span className="kmbr-alert-dot" />
                  <span style={{ fontSize: 14, lineHeight: 1.45 }}>
                    {a.label} · <span style={{ fontFamily: MONO }}>{a.plate}</span>
                    <br />
                    <span
                      className="kmbr-alert-when"
                      data-odo-when={odo ? "" : undefined}
                      data-left={odo ? t.odo.left : undefined}
                      data-over={odo ? t.odo.over : undefined}
                    >
                      {a.when}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="kmbr-demotag" style={{ marginTop: 18, textAlign: "right" }}>
        {c.hero.demoTag}
      </div>
    </DemoCard>
  )
}

export function Features() {
  const { c } = useLanding()
  return (
    <div
      style={{
        maxWidth: 1264,
        margin: "0 auto",
        padding: `${SECTION_GAP} clamp(20px,4vw,32px) 0`,
        display: "flex",
        flexDirection: "column",
        gap: "clamp(88px,11vw,140px)",
      }}
    >
      <FeatureRow id="fb-title" eyebrow={c.lucro.eyebrow} title={c.lucro.title} lead={c.lucro.lead} srText={c.lucro.sr}>
        <LucroDemo />
      </FeatureRow>
      <FeatureRow id="fc-title" reverse eyebrow={c.avisos.eyebrow} title={c.avisos.title} lead={c.avisos.lead} srText={c.avisos.sr}>
        <AvisosDemo />
      </FeatureRow>
    </div>
  )
}

// --- Bento ------------------------------------------------------------------

function Tile({
  span,
  demo,
  style,
  children,
}: {
  span: number
  demo?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const { m } = useLanding()
  // Patrón del panel: sección con divisoria arriba, sin caja alrededor.
  return (
    <article data-reveal="" data-demo={demo} className="kmbr-open" style={{ gridColumn: m ? "span 12" : `span ${span}`, ...style }}>
      {children}
    </article>
  )
}

const DONUT = [
  { pct: 52, color: "#13865A", dash: "51 49", offset: "0" },
  { pct: 18, color: "#4A4F57", dash: "17 83", offset: "-52" },
  { pct: 12, color: "#6B7280", dash: "11 89", offset: "-70" },
  { pct: 18, color: "#D4D2CC", dash: "17 83", offset: "-82" },
]

function CurrencyTile() {
  const { c, reduced } = useLanding()
  const t = c.bento.money
  const [cur, setCur] = useState(0)
  const valueRef = useRef<HTMLDivElement>(null)
  const pick = (i: number) => {
    setCur(i)
    if (!reduced)
      valueRef.current?.animate(
        [
          { opacity: 0, filter: "blur(6px)", transform: "translateY(6px)" },
          { opacity: 1, filter: "blur(0)", transform: "none" },
        ],
        { duration: 400, easing: EASE },
      )
  }
  return (
    <Tile span={5} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h3 style={H3_TILE}>{t.title}</h3>
        <p style={TILE_TEXT}>{t.text}</p>
      </div>
      <div style={{ marginTop: "auto" }}>
        <div
          role="group"
          aria-label={t.group}
          style={{ display: "inline-flex", padding: 4, borderRadius: 99, background: "#F3F2EE", border: "1px solid rgba(11,12,14,0.07)", gap: 2 }}
        >
          {t.options.map(([label], i) => (
            <button
              key={label}
              onClick={() => pick(i)}
              aria-pressed={cur === i}
              style={{
                height: 40,
                minWidth: 56,
                padding: "0 14px",
                borderRadius: 99,
                border: 0,
                cursor: "pointer",
                fontFamily: MONO,
                fontSize: 14,
                background: cur === i ? "#0B0C0E" : "transparent",
                color: cur === i ? "#FAFAF8" : "#4A4F57",
                transition: "background-color .2s, color .2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 16, fontSize: 14, color: "#5F656E" }}>{t.profitLabel}</div>
        <div
          ref={valueRef}
          style={{
            marginTop: 4,
            fontFamily: MONO,
            fontVariantNumeric: "tabular-nums",
            fontSize: "clamp(30px,3.2vw,40px)",
            letterSpacing: "-0.02em",
            color: "#13865A",
          }}
        >
          {t.options[cur][1]}
        </div>
        <div className="kmbr-demotag" style={{ marginTop: 4 }}>
          {t.tag}
        </div>
      </div>
    </Tile>
  )
}

function TeamTile() {
  const { c } = useLanding()
  const t = c.bento.team
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = () => {
    navigator.clipboard?.writeText(JOIN_CODE).catch(() => {})
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1800)
  }
  return (
    <Tile span={6} style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <h3 style={H3_TILE}>{t.title}</h3>
        <p style={TILE_TEXT}>{t.text}</p>
      </div>
      <div style={{ ...INSET_PANEL, flex: "0 1 260px", display: "flex", alignItems: "center", gap: 8, padding: "8px 8px 8px 18px" }}>
        <span style={{ fontFamily: MONO, fontSize: 20, letterSpacing: ".08em", flex: 1 }}>{JOIN_CODE}</span>
        <button
          onClick={copy}
          aria-label={t.copyLabel}
          style={{
            height: 44,
            padding: "0 14px",
            borderRadius: 10,
            border: "1px solid rgba(11,12,14,0.12)",
            background: copied ? "rgba(19,134,90,0.12)" : "transparent",
            color: copied ? "#13865A" : "#0B0C0E",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            cursor: "pointer",
            transition: "background-color .2s, color .2s",
          }}
        >
          <CopyIcon />
          {copied ? t.copied : t.copy}
        </button>
      </div>
    </Tile>
  )
}

export function Bento() {
  const { c } = useLanding()
  const b = c.bento
  return (
    <section id="beneficios" aria-labelledby="bento-title" style={{ maxWidth: 1264, margin: "0 auto", padding: `${SECTION_GAP} clamp(20px,4vw,32px) 0` }}>
      <div style={{ maxWidth: 720 }}>
        <h2 id="bento-title" data-reveal="" style={{ ...H2, textWrap: "balance" }}>
          {b.title}
        </h2>
      </div>
      <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(12,minmax(0,1fr))", gap: "clamp(40px,5vw,64px) clamp(24px,4vw,56px)" }}>
        <Tile span={7} demo="donut" style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 220px", minWidth: 0, maxWidth: 300 }}>
            <h3 style={H3_TILE}>{b.fuel.title}</h3>
            <p style={TILE_TEXT}>{b.fuel.text}</p>
          </div>
          <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <svg data-donut="" width="132" height="132" viewBox="0 0 42 42" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="rgba(11,12,14,0.05)" strokeWidth="5" />
              {DONUT.map((d) => (
                <circle
                  key={d.offset}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="none"
                  stroke={d.color}
                  strokeWidth="5"
                  strokeDasharray={d.dash}
                  strokeDashoffset={d.offset}
                />
              ))}
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 14, color: "#4A4F57" }}>
              {DONUT.map((d, i) => (
                <span key={d.offset} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  {b.fuel.slices[i]}
                  <span style={{ fontFamily: MONO, color: "#0B0C0E", marginLeft: "auto", paddingLeft: 12 }}>{d.pct} %</span>
                </span>
              ))}
            </div>
            <div style={{ paddingLeft: 20, borderLeft: "1px solid rgba(11,12,14,0.07)" }}>
              <div style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontSize: 34, letterSpacing: "-0.02em", color: "#13865A" }}>
                <span data-count="3.1" data-dec="1">
                  3,1
                </span>
              </div>
              <div style={{ fontSize: 14, color: "#5F656E" }}>{b.fuel.kml}</div>
            </div>
          </div>
        </Tile>

        <CurrencyTile />

        <Tile span={5} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <h3 style={H3_TILE}>{b.fixed.title}</h3>
            <p style={TILE_TEXT}>{b.fixed.text}</p>
          </div>
          <div aria-hidden="true" style={{ marginTop: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12,minmax(0,1fr))", gap: 5, height: 96, alignItems: "end" }}>
              {b.fixed.months.map((mo, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", height: "100%" }}>
                  <div
                    style={{
                      flex: 1,
                      width: "100%",
                      borderRadius: 5,
                      background: "rgba(11,12,14,0.04)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div data-grow="y" data-delay={i * 60} style={{ height: "78%", transformOrigin: "50% 100%", display: "flex", flexDirection: "column" }}>
                      <div style={{ flex: 3, background: "rgba(19,134,90,0.75)" }} />
                      <div style={{ flex: 2, background: "#D4D2CC" }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "#5F656E" }}>{mo}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 13, color: "#5F656E" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: "#13865A" }} />
                {b.fixed.installment}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: "#D4D2CC" }} />
                {b.fixed.fixed}
              </span>
              <span style={{ marginLeft: "auto" }}>{b.fixed.span}</span>
            </div>
          </div>
        </Tile>

        <Tile span={7} demo="chat" style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
          <div style={{ flex: "1 1 220px", minWidth: 0, maxWidth: 280 }}>
            <h3 style={H3_TILE}>{b.chat.title}</h3>
            <p style={TILE_TEXT}>{b.chat.text}</p>
          </div>
          <div aria-hidden="true" style={{ flex: "1 1 280px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10, justifyContent: "flex-end", minHeight: 170 }}>
            <div
              style={{
                alignSelf: "flex-end",
                maxWidth: "88%",
                padding: "12px 16px",
                borderRadius: "16px 16px 4px 16px",
                background: "#0B0C0E",
                color: "#FAFAF8",
                fontSize: 15,
                lineHeight: 1.45,
                minHeight: 44,
              }}
            >
              <span data-q="" data-text={b.chat.question}>
                {b.chat.question}
              </span>
            </div>
            <div
              data-abubble=""
              style={{
                alignSelf: "flex-start",
                maxWidth: "92%",
                padding: "12px 16px",
                borderRadius: "16px 16px 16px 4px",
                background: "#F3F2EE",
                border: "1px solid rgba(11,12,14,0.08)",
                fontSize: 15,
                lineHeight: 1.5,
                color: "#0B0C0E",
                minHeight: 44,
              }}
            >
              <span data-a="" data-text={b.chat.answer}>
                {b.chat.answer}
              </span>
            </div>
            <div className="kmbr-demotag">{c.hero.demoTag}</div>
          </div>
        </Tile>

        <Tile span={6} style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <h3 style={H3_TILE}>{b.salary.title}</h3>
            <p style={TILE_TEXT}>{b.salary.text}</p>
          </div>
          <div
            aria-hidden="true"
            style={{
              ...INSET_PANEL,
              flex: "0 1 240px",
              padding: "16px 18px",
              fontFamily: MONO,
              fontVariantNumeric: "tabular-nums",
              fontSize: 15,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#5F656E" }}>{b.salary.freight}</span>
              <span>{b.salary.freightValue}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#5F656E" }}>{b.salary.driver}</span>
              <span>× 18 %</span>
            </div>
            <div style={{ borderTop: "1px solid rgba(11,12,14,0.08)", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#5F656E" }}>{b.salary.expense}</span>
              <span style={{ color: "#0B0C0E" }}>
                {c.currency}{" "}
                <span data-count={b.salary.expenseValue}>{b.salary.expenseValue.toLocaleString("pt-BR")}</span>
              </span>
            </div>
          </div>
        </Tile>

        <TeamTile />
      </div>
    </section>
  )
}
