"use client"

import type { CSSProperties } from "react"
import { TONES } from "./demo-data"
import { ArrowIcon, BellIcon, WhatsAppIcon } from "./icons"
import { useLanding } from "./landing"
import { INSET_PANEL, MONO, PILL, SR_ONLY, TABLE_HEAD, WRAP } from "./styles"

const WINDOW_DOTS = (size: number) =>
  [0, 1, 2].map((i) => <span key={i} style={{ width: size, height: size, borderRadius: 99, background: "#DCDAD5" }} />)

const FIGURE: CSSProperties = {
  marginTop: 6,
  fontFamily: MONO,
  fontVariantNumeric: "tabular-nums",
  fontSize: "clamp(20px,2.2vw,26px)",
  letterSpacing: "-0.02em",
}

export function Hero() {
  const { c, m, money, openDemo, waHref } = useLanding()
  const h = c.hero
  const mHide = m ? "none" : undefined
  const tableCols = m ? "0.7fr 1.5fr 1.1fr" : "0.8fr 0.9fr 0.9fr 1.6fr 1fr"
  const maxGain = Math.max(...c.trucks.map((t) => t.g))
  const prefix = `${c.currency} `

  return (
    <section
      aria-labelledby="hero-title"
      style={{ position: "relative", overflow: "hidden", padding: "clamp(128px,16vw,176px) 0 clamp(88px,10vw,128px)" }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(11,12,14,0.10) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 30%, #000 10%, transparent 75%)",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 30%, #000 10%, transparent 75%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", ...WRAP }}>
        <div style={{ maxWidth: 920, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h1
            id="hero-title"
            data-lines=""
            style={{ margin: 0, fontSize: "clamp(44px,6.4vw,88px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.0, textWrap: "balance" }}
          >
            {h.lines.map((line) => (
              <span key={line} style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em" }}>
                <span data-line="" style={{ display: "block" }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p
            data-reveal=""
            data-delay="200"
            style={{ margin: "24px 0 0", maxWidth: 620, fontSize: "clamp(17px,1.4vw,19px)", lineHeight: 1.6, color: "#4A4F57", textWrap: "pretty" }}
          >
            {h.sub}
          </p>
          <div data-reveal="" data-delay="280" style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <button
              data-btn=""
              onClick={openDemo}
              className="kmbr-btn-dark"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                height: 52,
                padding: "0 22px",
                borderRadius: 10,
                border: 0,
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: "0 0 0 1px rgba(11,12,14,0.2), 0 8px 30px rgba(19,134,90,0.12)",
              }}
            >
              {c.nav.demo}
              <ArrowIcon />
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener"
              className="kmbr-btn-outline"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 52, padding: "0 22px", borderRadius: 10, fontSize: 16, fontWeight: 500 }}
            >
              <WhatsAppIcon />
              {h.whatsapp}
            </a>
          </div>
          <div
            data-reveal=""
            data-delay="340"
            style={{ marginTop: 22, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 20px", fontSize: 14, color: "#5F656E" }}
          >
            {h.bullets.map((b, i) => (
              <span key={b} style={{ display: "contents" }}>
                {i > 0 && (
                  <span aria-hidden="true" style={{ color: "#D4D2CC" }}>
                    ·
                  </span>
                )}
                <span>{b}</span>
              </span>
            ))}
          </div>
        </div>

        <p style={SR_ONLY}>{h.sr}</p>

        <div aria-hidden="true" data-reveal="" data-delay="380" style={{ margin: "clamp(56px,7vw,88px) auto 0", maxWidth: 1120, perspective: 1800 }}>
          <div data-tilt="" style={{ position: "relative", transform: "rotateX(8deg)", transformOrigin: "50% 0%", willChange: "transform" }}>
            <div
              style={{
                borderRadius: 16,
                background: "#FFFFFF",
                border: "1px solid rgba(11,12,14,0.10)",
                boxShadow: "0 1px 2px rgba(11,12,14,0.05), 0 32px 80px -32px rgba(11,12,14,0.22)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0 16px",
                  borderBottom: "1px solid rgba(11,12,14,0.07)",
                  background: "#F7F6F3",
                }}
              >
                {WINDOW_DOTS(10)}
                <span style={{ marginLeft: 14, fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em", color: "#4A4F57" }}>Kilometría</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "208px minmax(0,1fr)" }}>
                <aside style={{ display: mHide, borderRight: "1px solid rgba(11,12,14,0.07)", padding: "18px 12px", background: "#F7F6F3" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 14, color: "#4A4F57" }}>
                    {h.sidebar.map((item) => {
                      const active = item === h.activeItem
                      return (
                        <div
                          key={item}
                          style={{
                            padding: "9px 12px",
                            borderRadius: 8,
                            ...(active && {
                              background: "rgba(11,12,14,0.05)",
                              color: "#0B0C0E",
                              boxShadow: "inset 0 0 0 1px rgba(11,12,14,0.06)",
                            }),
                            ...(item === h.alertItem && { display: "flex", justifyContent: "space-between", alignItems: "center" }),
                          }}
                        >
                          {item}
                          {item === h.alertItem && <span style={{ width: 6, height: 6, borderRadius: 99, background: "#A86A12" }} />}
                        </div>
                      )
                    })}
                  </div>
                </aside>
                <div style={{ padding: "clamp(16px,2.4vw,28px)", minWidth: 0, textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}>{h.title}</div>
                    <div style={{ display: "flex", gap: 8, fontFamily: MONO, fontSize: 12, color: "#4A4F57" }}>
                      <span style={PILL}>{h.month}</span>
                      <span style={PILL}>{c.currency}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,150px),1fr))", gap: 12 }}>
                    <div style={{ padding: "16px 18px", ...INSET_PANEL }}>
                      <div style={{ fontSize: 13, color: "#5F656E" }}>{h.billed}</div>
                      <div style={FIGURE}>
                        <span data-count={c.summary.billed} data-prefix={prefix}>
                          {money(c.summary.billed)}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: "16px 18px", ...INSET_PANEL }}>
                      <div style={{ fontSize: 13, color: "#5F656E" }}>{h.costs}</div>
                      <div style={FIGURE}>
                        <span data-count={c.summary.costs} data-prefix={prefix}>
                          {money(c.summary.costs)}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(19,134,90,0.06)", border: "1px solid rgba(19,134,90,0.18)" }}>
                      <div style={{ fontSize: 13, color: "#5F656E" }}>{h.profit}</div>
                      <div style={{ ...FIGURE, color: "#13865A" }}>
                        <span data-count={c.summary.profit} data-prefix={prefix}>
                          {money(c.summary.profit)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 20, border: "1px solid rgba(11,12,14,0.07)", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ ...TABLE_HEAD, display: "grid", gridTemplateColumns: tableCols, gap: 12, padding: "12px 16px" }}>
                      <span>{h.cols[0]}</span>
                      <span style={{ display: mHide }}>{h.cols[1]}</span>
                      <span style={{ display: mHide }}>{h.cols[2]}</span>
                      <span>{h.cols[3]}</span>
                      <span>{h.cols[4]}</span>
                    </div>
                    <div>
                      {c.trucks.map((t, i) => {
                        const tone = TONES[t.tone]
                        return (
                          <div
                            key={t.plate}
                            data-reveal=""
                            data-delay="500"
                            style={{
                              display: "grid",
                              gridTemplateColumns: tableCols,
                              gap: 12,
                              alignItems: "center",
                              padding: "14px 16px",
                              borderBottom: "1px solid rgba(11,12,14,0.05)",
                              fontFamily: MONO,
                              fontVariantNumeric: "tabular-nums",
                              fontSize: 15,
                            }}
                          >
                            <span style={{ color: "#0B0C0E", fontWeight: 500 }}>{t.plate}</span>
                            <span style={{ display: mHide, color: "#4A4F57" }}>{t.inc}</span>
                            <span style={{ display: mHide, color: "#4A4F57" }}>{t.cost}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                              <span data-count={t.g} data-dec="2" style={{ color: tone.fg, minWidth: 38 }}>
                                {t.gain}
                              </span>
                              <span
                                style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(11,12,14,0.06)", overflow: "hidden", minWidth: 20 }}
                              >
                                <span
                                  data-grow="x"
                                  data-delay={700 + i * 90}
                                  style={{
                                    display: "block",
                                    height: "100%",
                                    borderRadius: 99,
                                    background: tone.bar,
                                    transformOrigin: "0 50%",
                                    transform: `scaleX(${(t.g / maxGain).toFixed(3)})`,
                                  }}
                                />
                              </span>
                            </span>
                            <span>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  height: 24,
                                  padding: "0 10px",
                                  borderRadius: 99,
                                  fontFamily: "inherit",
                                  fontSize: 12,
                                  fontWeight: 500,
                                  background: tone.chipBg,
                                  color: tone.chipFg,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {t.status}
                              </span>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              data-reveal=""
              data-delay="1100"
              style={{ position: "absolute", right: m ? 12 : -28, top: m ? "auto" : "44%", bottom: m ? -34 : "auto", zIndex: 3 }}
            >
              <div
                style={{
                  animation: "kmFloat 5s ease-in-out infinite",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(11,12,14,0.12)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 20px 50px -10px rgba(11,12,14,0.14)",
                  maxWidth: 300,
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    flex: "none",
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(168,106,18,0.12)",
                    color: "#A86A12",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BellIcon />
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.4, color: "#0B0C0E" }}>
                  {h.toast[0]}
                  <span style={{ fontFamily: MONO }}>{h.toast[1]}</span>
                  {h.toast[2]}
                </span>
              </div>
            </div>
          </div>
          <div className="kmbr-demotag" style={{ marginTop: m ? 56 : 20, textAlign: "center" }}>
            {h.demoTag}
          </div>
        </div>
      </div>
    </section>
  )
}

const FRAG_SHADOW = "0 1px 2px rgba(11,12,14,0.10), 0 28px 56px -18px rgba(11,12,14,0.30)"
const FRAG_BASE: CSSProperties = { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }
const CELL = (background: string): CSSProperties => ({ background, padding: 5 })
// Colores de las celdas de la planilla, por fila: [cliente, adelanto, saldo, nota].
const SHEET_COLORS = [
  ["#fff", "#C8EBD6", "#F8D7A8", "#fff"],
  ["#fff", "#C8EBD6", "#F6C4C0", "#FFF3A6"],
  ["#fff", "#F6C4C0", "#F6C4C0", "#fff"],
]
const BUBBLE_IN: CSSProperties = {
  alignSelf: "flex-start",
  maxWidth: "90%",
  background: "#F0F0EC",
  borderRadius: "10px 10px 10px 2px",
  padding: "7px 10px",
  fontSize: 12,
  lineHeight: 1.35,
}
const STEP: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  margin: 0,
  textAlign: "center",
  fontSize: "clamp(20px,2.2vw,28px)",
  letterSpacing: "-0.02em",
  color: "#0B0C0E",
  transition: "opacity .6s cubic-bezier(0.22,1,0.36,1), transform .6s cubic-bezier(0.22,1,0.36,1)",
}

// Escena fijada: los "seis lugares" donde vive hoy la empresa se juntan en
// la ventana de Kilometría a medida que se scrollea (ver useLandingMotion).
export function ProblemScene() {
  const { c, money, reduced } = useLanding()
  const p = c.problem
  return (
    <section
      data-scene=""
      aria-labelledby="problema-title"
      style={{ position: "relative", background: "#F1F0EC", height: reduced ? "100svh" : "320vh", borderTop: "1px solid rgba(11,12,14,0.05)" }}
    >
      <div style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ ...WRAP, width: "100%", paddingTop: "clamp(100px,12vh,128px)", textAlign: "center" }}>
          <h2
            id="problema-title"
            data-reveal=""
            style={{
              margin: "0 auto",
              maxWidth: 760,
              fontSize: "clamp(32px,4vw,52px)",
              fontWeight: 500,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              textWrap: "balance",
            }}
          >
            {p.title}
          </h2>
        </div>
        <div data-stage="" aria-hidden="true" style={{ position: "relative", flex: 1, minHeight: 0 }}>
          {/* planilla */}
          <div
            data-frag=""
            data-x="-30"
            data-y="-14"
            data-r="-6"
            data-z="1.2"
            style={{
              ...FRAG_BASE,
              width: "clamp(150px,20vw,250px)",
              borderRadius: 10,
              background: "#FFFFFF",
              outline: "1px solid rgba(11,12,14,0.08)",
              color: "#0B0C0E",
              boxShadow: FRAG_SHADOW,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "7px 10px",
                background: "#1E6B45",
                color: "#F6F5F2",
                fontFamily: MONO,
                fontSize: 10,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {p.sheetName}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "#D9D7D1", fontFamily: MONO, fontSize: 10 }}>
              {p.sheetHead.map((h) => (
                <span key={h} style={CELL("#ECEAE4")}>
                  {h}
                </span>
              ))}
              {p.sheetRows.map((row, r) =>
                row.map((cell, i) => (
                  <span key={`${r}-${i}`} style={CELL(SHEET_COLORS[r][i])}>
                    {cell}
                  </span>
                )),
              )}
            </div>
          </div>
          {/* chat */}
          <div
            data-frag=""
            data-x="29"
            data-y="-18"
            data-r="5"
            data-z="0.8"
            style={{
              ...FRAG_BASE,
              width: "clamp(150px,19vw,240px)",
              borderRadius: 14,
              background: "#FFFFFF",
              border: "1px solid rgba(11,12,14,0.10)",
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              boxShadow: FRAG_SHADOW,
            }}
          >
            <div style={{ fontSize: 11, color: "#5F656E", padding: "0 2px 4px", borderBottom: "1px solid rgba(11,12,14,0.06)" }}>{p.chatName}</div>
            <div style={BUBBLE_IN}>{p.chat[0]}</div>
            <div style={BUBBLE_IN}>{p.chat[1]}</div>
            <div style={{ ...BUBBLE_IN, alignSelf: "flex-end", background: "#D6F5E4", borderRadius: "10px 10px 2px 10px" }}>{p.chat[2]}</div>
          </div>
          {/* tablero */}
          <div
            data-frag=""
            data-x="3"
            data-y="-30"
            data-r="-3"
            data-z="1.5"
            style={{
              ...FRAG_BASE,
              width: "clamp(130px,15vw,190px)",
              borderRadius: 12,
              background: "#050607",
              border: "1px solid rgba(11,12,14,0.10)",
              padding: "14px 12px 10px",
              boxShadow: FRAG_SHADOW,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: "clamp(16px,1.6vw,22px)",
                color: "#F5B544",
                textAlign: "center",
                letterSpacing: ".06em",
                textShadow: "0 0 10px rgba(245,181,68,0.45)",
              }}
            >
              412.380
            </div>
            <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 10, color: "#5F656E", textAlign: "center" }}>{p.dashLabel}</div>
          </div>
          {/* tickets */}
          <div data-frag="" data-x="-33" data-y="22" data-r="9" data-z="0.9" style={{ ...FRAG_BASE, width: "clamp(120px,13vw,170px)" }}>
            <div style={{ position: "absolute", inset: 0, transform: "rotate(-8deg) translate(-10px,6px)", background: "#E4E1DA", borderRadius: 4 }} />
            <div
              style={{
                position: "relative",
                background: "#EFEDE7",
                color: "#2B2D31",
                borderRadius: 4,
                padding: 12,
                fontFamily: MONO,
                fontSize: 10,
                lineHeight: 1.6,
                boxShadow: FRAG_SHADOW,
                transform: "skewY(-2deg)",
              }}
            >
              <div style={{ textAlign: "center", fontWeight: 500 }}>{p.ticket.station}</div>
              <div style={{ borderTop: "1px dashed #9A9C9F", margin: "6px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{p.ticket.fuel}</span>
                <span>{p.ticket.liters}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>TOTAL</span>
                <span>{p.ticket.total}</span>
              </div>
              <div style={{ borderTop: "1px dashed #9A9C9F", margin: "6px 0" }} />
              <div style={{ textAlign: "center", color: "#7A7C80" }}>{p.ticket.thanks}</div>
            </div>
          </div>
          {/* cuaderno */}
          <div
            data-frag=""
            data-x="31"
            data-y="20"
            data-r="-7"
            data-z="1.1"
            style={{
              ...FRAG_BASE,
              width: "clamp(140px,17vw,220px)",
              borderRadius: 6,
              backgroundColor: "#EFE6CC",
              backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 21px, rgba(60,90,140,0.25) 21px 22px)",
              color: "#2A3550",
              padding: "12px 14px 12px 26px",
              fontSize: 13,
              lineHeight: "22px",
              fontStyle: "italic",
              boxShadow: FRAG_SHADOW,
            }}
          >
            <div style={{ position: "absolute", left: 16, top: 0, bottom: 0, width: 1, background: "rgba(200,70,70,0.4)" }} />
            {p.notebook.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
          {/* calculadora */}
          <div
            data-frag=""
            data-x="-6"
            data-y="30"
            data-r="4"
            data-z="1.3"
            style={{
              ...FRAG_BASE,
              width: "clamp(100px,11vw,140px)",
              borderRadius: 12,
              background: "#1C1F24",
              border: "1px solid rgba(11,12,14,0.08)",
              padding: 10,
              boxShadow: FRAG_SHADOW,
            }}
          >
            <div style={{ background: "#9DAA92", color: "#1C2018", borderRadius: 4, padding: "6px 8px", textAlign: "right", fontFamily: MONO, fontSize: 14 }}>
              {p.calc}
            </div>
            <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4 }}>
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} style={{ height: 14, borderRadius: 3, background: i % 4 === 3 ? "#4A3A2A" : "#2C3037" }} />
              ))}
            </div>
          </div>
          {/* ventana resultante */}
          <div
            data-scenewin=""
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "min(560px,88vw)",
              transform: "translate(-50%,-50%) scale(.88)",
              opacity: 0,
              borderRadius: 16,
              background: "#FFFFFF",
              border: "1px solid rgba(11,12,14,0.12)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 40px 100px -20px rgba(11,12,14,0.16), 0 0 80px rgba(19,134,90,0.10)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 38,
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "0 14px",
                borderBottom: "1px solid rgba(11,12,14,0.07)",
                background: "#F7F6F3",
              }}
            >
              {WINDOW_DOTS(8)}
              <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600, color: "#4A4F57" }}>Kilometría</span>
            </div>
            <div style={{ padding: 18, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 }}>
              {(
                [
                  [c.hero.billed, c.summary.billed, false],
                  [c.hero.costs, c.summary.costs, false],
                  [c.hero.profit, c.summary.profit, true],
                ] as const
              ).map(([label, value, profit]) => (
                <div
                  key={label}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: profit ? "rgba(19,134,90,0.06)" : "#F3F2EE",
                    border: `1px solid ${profit ? "rgba(19,134,90,0.18)" : "rgba(11,12,14,0.07)"}`,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#5F656E" }}>{label}</div>
                  <div style={{ marginTop: 4, fontFamily: MONO, fontSize: "clamp(13px,1.6vw,17px)", color: profit ? "#13865A" : undefined }}>
                    {money(value)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 8, fontFamily: MONO, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "#F3F2EE" }}>
                <span>{p.winSaldo[0]}</span>
                <span style={{ color: "#A86A12" }}>{p.winSaldo[1]}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "#F3F2EE" }}>
                <span>{p.winFuel[0]}</span>
                <span style={{ color: "#4A4F57" }}>{p.winFuel[1]}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ ...WRAP, position: "relative", height: "clamp(96px,14vh,128px)", width: "100%" }}>
          {p.steps.map((step, i) => {
            const last = i === p.steps.length - 1
            return (
              <p
                key={step}
                data-step=""
                style={{
                  ...STEP,
                  ...(i > 0 && { opacity: 0 }),
                  ...(last && { fontSize: "clamp(24px,2.8vw,36px)", fontWeight: 500, letterSpacing: "-0.03em", color: "#13865A" }),
                }}
              >
                {step}
              </p>
            )
          })}
        </div>
      </div>
    </section>
  )
}
