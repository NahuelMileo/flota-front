"use client"

import { useState, type CSSProperties } from "react"
import { FLEET_SIZES } from "./demo-data"
import { ArrowIcon, CheckIcon, CloseIcon, DownloadIcon, LockIcon, PlusIcon, ShieldIcon, WhatsAppIcon } from "./icons"
import { useLanding } from "./landing"
import { H2, MONO, SECTION_GAP, WRAP } from "./styles"

const SECTION: CSSProperties = { maxWidth: 1264, margin: "0 auto", padding: `${SECTION_GAP} clamp(20px,4vw,32px) 0` }
const DOT: CSSProperties = { flex: "none", marginTop: 9, width: 6, height: 6, borderRadius: 99, background: "#13865A" }

function Compare() {
  const { c } = useLanding()
  const t = c.compare
  const row: CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0,1fr) 72px 104px", gap: 12 }
  return (
    <section aria-labelledby="cmp-title" style={SECTION}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,64px)", alignItems: "flex-start" }}>
        <div style={{ flex: "2 1 520px", minWidth: 0 }}>
          <h2 id="cmp-title" data-reveal="" style={H2}>
            {t.title}
          </h2>
          <div
            role="table"
            aria-label={t.aria}
            style={{ marginTop: 40 }}
          >
            <div
              role="row"
              style={{
                ...row,
                padding: "0 0 12px",
                borderBottom: "1px solid rgba(11,12,14,0.12)",
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "#5F656E",
              }}
            >
              <span role="columnheader" />
              <span role="columnheader" style={{ textAlign: "center" }}>
                Excel
              </span>
              <span role="columnheader" style={{ textAlign: "center", color: "#0B0C0E" }}>
                Kilometría
              </span>
            </div>
            {t.rows.map((r) => (
              <div key={r} role="row" data-reveal="" style={{ ...row, alignItems: "center", padding: "18px 0", borderBottom: "1px solid rgba(11,12,14,0.07)" }}>
                <span role="cell" style={{ fontSize: 17, lineHeight: 1.4, color: "#0B0C0E" }}>
                  {r}
                </span>
                <span role="cell" aria-label={t.no} style={{ display: "flex", justifyContent: "center", color: "#B4B8BF" }}>
                  <CloseIcon size={18} />
                </span>
                <span role="cell" aria-label={t.yes} style={{ display: "flex", justifyContent: "center" }}>
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 99,
                      background: "rgba(19,134,90,0.12)",
                      color: "#13865A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckIcon size={16} width={2} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <aside data-reveal="" aria-labelledby="aca-title" className="kmbr-open" style={{ flex: "1 1 300px", minWidth: 0, marginTop: "clamp(0px,6vw,96px)" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "#13865A" }}>{t.asideEyebrow}</div>
          <h3 id="aca-title" style={{ margin: "12px 0 0", fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em" }}>
            {t.asideTitle}
          </h3>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16, fontSize: 16, lineHeight: 1.5, color: "#4A4F57" }}>
            {t.aside.map(([before, strong, after]) => (
              <div key={strong} style={{ display: "flex", gap: 12 }}>
                <span style={DOT} />
                <span>
                  {before}
                  <span style={{ color: "#0B0C0E" }}>{strong}</span>
                  {after}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

function Steps() {
  const { c, m } = useLanding()
  return (
    <section data-steps="" aria-labelledby="steps-title" style={SECTION}>
      <h2 id="steps-title" data-reveal="" style={H2}>
        {c.steps.title}
      </h2>
      <div style={{ position: "relative", marginTop: 56 }}>
        <svg
          aria-hidden="true"
          viewBox="0 0 100 2"
          preserveAspectRatio="none"
          style={{ display: m ? "none" : undefined, position: "absolute", left: 24, right: 24, top: 23, width: "calc(100% - 48px)", height: 2, overflow: "visible" }}
        >
          <line x1="0" y1="1" x2="100" y2="1" stroke="rgba(11,12,14,0.08)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line
            data-stepline=""
            x1="0"
            y1="1"
            x2="100"
            y2="1"
            stroke="#13865A"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
        </svg>
        <ol
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))",
            gap: "40px 32px",
            position: "relative",
          }}
        >
          {c.steps.items.map(([title, text], i) => (
            <li key={title} data-reveal="" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 99,
                  background: "#FAFAF8",
                  border: "1px solid rgba(19,134,90,0.4)",
                  color: "#13865A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: MONO,
                  fontSize: 14,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>{title}</h3>
                <p style={{ margin: "8px 0 0", fontSize: 17, lineHeight: 1.55, color: "#4A4F57" }}>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const SECURITY_ICONS = [ShieldIcon, LockIcon, DownloadIcon]

function Security() {
  const { c } = useLanding()
  return (
    <section aria-labelledby="sec-title" style={{ ...SECTION, paddingBottom: SECTION_GAP }}>
      <h2 id="sec-title" data-reveal="" style={H2}>
        {c.security.title}
      </h2>
      <div
        style={{
          marginTop: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))",
          borderTop: "1px solid rgba(11,12,14,0.07)",
        }}
      >
        {c.security.items.map(([title, text], i) => {
          const Icon = SECURITY_ICONS[i]
          return (
            <div key={title} data-reveal="" style={{ padding: "32px 32px 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
              <span style={{ color: "#13865A", display: "flex" }}>
                <Icon />
              </span>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>{title}</h3>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: "#4A4F57" }}>{text}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Pricing() {
  const { c, fleet, setFleet, openDemo } = useLanding()
  const t = c.pricing
  return (
    <section id="precio" aria-labelledby="precio-title" style={WRAP}>
      <div
        style={{
          borderRadius: 24,
          background: "#0F1114",
          color: "#F3F4F6",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          padding: "clamp(32px,6vw,72px) clamp(20px,5vw,64px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(40px,6vw,88px)",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <h2 id="precio-title" data-reveal="" style={{ ...H2, textWrap: "balance" }}>
            {t.title}
          </h2>
          <p data-reveal="" style={{ margin: "20px 0 0", maxWidth: 520, fontSize: 18, lineHeight: 1.6, color: "#A3A9B4" }}>
            {t.text}
          </p>
          <div data-reveal="" style={{ marginTop: 36 }}>
            <div id="fleet-label" style={{ fontSize: 15, fontWeight: 500 }}>
              {t.question}
            </div>
            <div role="radiogroup" aria-labelledby="fleet-label" style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FLEET_SIZES.map((k) => {
                const on = fleet === k
                return (
                  <button
                    key={k}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setFleet(k)}
                    style={{
                      height: 48,
                      minWidth: 80,
                      padding: "0 20px",
                      borderRadius: 99,
                      border: `1px solid ${on ? "#F3F4F6" : "rgba(255,255,255,0.18)"}`,
                      background: on ? "#F3F4F6" : "transparent",
                      color: on ? "#0B0C0E" : "#F3F4F6",
                      fontFamily: MONO,
                      fontSize: 15,
                      cursor: "pointer",
                      transition: "background-color .2s, color .2s, border-color .2s",
                    }}
                  >
                    {k}
                  </button>
                )
              })}
            </div>
            <button
              data-btn=""
              onClick={openDemo}
              className="kmbr-btn-light"
              style={{
                marginTop: 24,
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
              }}
            >
              {t.cta(fleet)}
              <ArrowIcon />
            </button>
          </div>
        </div>
        <div
          data-reveal=""
          style={{
            flex: "1 1 360px",
            minWidth: 0,
            borderRadius: 16,
            background: "#15181C",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            padding: "clamp(24px,3vw,36px)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>{t.includedTitle}</h3>
          <ul style={{ listStyle: "none", margin: "20px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {t.included.map((it) => (
              <li key={it} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 16, lineHeight: 1.5, color: "#F3F4F6" }}>
                <span
                  style={{
                    flex: "none",
                    marginTop: 2,
                    width: 22,
                    height: 22,
                    borderRadius: 99,
                    background: "rgba(61,220,151,0.12)",
                    color: "#3DDC97",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckIcon size={13} />
                </span>
                {it}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const { c, waHref } = useLanding()
  const t = c.faq
  const [open, setOpen] = useState(0)
  return (
    <section id="preguntas" aria-labelledby="faq-title" style={{ ...SECTION, display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,64px)" }}>
      <div style={{ flex: "1 1 300px", minWidth: 0 }}>
        <h2 id="faq-title" data-reveal="" style={H2}>
          {t.title}
        </h2>
        <p data-reveal="" style={{ margin: "18px 0 0", fontSize: 18, lineHeight: 1.6, color: "#4A4F57" }}>
          {t.lead[0]}
          <a
            href={waHref}
            target="_blank"
            rel="noopener"
            style={{ color: "#0B0C0E", textDecoration: "underline", textUnderlineOffset: 4, textDecorationColor: "rgba(11,12,14,0.3)" }}
          >
            {t.lead[1]}
          </a>
          .
        </p>
      </div>
      <div style={{ flex: "2 1 520px", minWidth: 0, borderTop: "1px solid rgba(11,12,14,0.07)" }}>
        {t.items.map(([q, a], i) => {
          const isOpen = open === i
          return (
            <div key={q} style={{ borderBottom: "1px solid rgba(11,12,14,0.07)" }}>
              <h3 style={{ margin: 0 }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%",
                    minHeight: 72,
                    padding: "20px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 24,
                    background: "transparent",
                    border: 0,
                    color: "#0B0C0E",
                    textAlign: "left",
                    fontSize: 19,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    cursor: "pointer",
                  }}
                >
                  <span>{q}</span>
                  <span
                    style={{
                      flex: "none",
                      width: 32,
                      height: 32,
                      borderRadius: 99,
                      border: "1px solid rgba(11,12,14,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: `rotate(${isOpen ? 45 : 0}deg)`,
                      transition: "transform .3s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  >
                    <PlusIcon />
                  </span>
                </button>
              </h3>
              <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows .4s cubic-bezier(0.22,1,0.36,1)" }}>
                <div style={{ overflow: "hidden" }}>
                  <p style={{ margin: 0, padding: "0 56px 24px 0", fontSize: 17, lineHeight: 1.6, color: "#4A4F57", opacity: isOpen ? 1 : 0, transition: "opacity .4s" }}>
                    {a}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function FinalCta() {
  const { c, openDemo, waHref } = useLanding()
  return (
    <section aria-labelledby="cta-title" style={{ ...SECTION, paddingBottom: SECTION_GAP }}>
      <div
        data-reveal=""
        style={{
          borderTop: "1px solid #0B0C0E",
          paddingTop: "clamp(32px,4vw,48px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "40px 64px",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <h2
          id="cta-title"
          data-lines=""
          style={{ margin: 0, flex: "1 1 520px", minWidth: 0, fontSize: "clamp(40px,6vw,84px)", fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 0.98 }}
        >
          {c.cta.lines.map((line, i) => (
            <span key={line} style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em" }}>
              <span data-line="" style={{ display: "block", color: i === 1 ? "#5F656E" : undefined }}>
                {line}
              </span>
            </span>
          ))}
        </h2>
        <div style={{ flex: "0 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: "#4A4F57", textWrap: "pretty" }}>{c.cta.text}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
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
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
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
              style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 52, padding: "0 20px", borderRadius: 10, fontSize: 16, fontWeight: 500 }}
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Closing() {
  return (
    <>
      <Compare />
      <Steps />
      <Security />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  )
}
