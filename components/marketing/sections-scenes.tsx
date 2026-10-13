"use client"

import { fmt } from "./demo-data"
import { CheckIcon } from "./icons"
import { useLanding } from "./landing"
import { EYEBROW, H2, LEAD, SR_ONLY } from "./styles"

// Escenas fijadas: la sección queda quieta mientras se scrollea y el mockup
// avanza con el progreso (ver data-pin en useLandingMotion). El markup se
// renderiza en su estado final, así sin JS o con movimiento reducido se ve completo.

// Colores de matrícula de la demo, como el color del camión en el panel.
const PLATE_COLORS = ["#2563EB", "#D97706", "#059669", "#475569"]

export function JourneyScene() {
  const { c, m, money, reduced } = useLanding()
  const j = c.journey
  const income = j.rows.filter(([, , kind]) => kind === "in").reduce((s, [, amt]) => s + amt, 0)
  const outcome = j.rows.filter(([, , kind]) => kind === "out").reduce((s, [, amt]) => s + amt, 0)
  const profit = income - outcome
  const perKm = Math.round((profit / j.km) * 100) / 100
  const prefix = `${c.currency} `

  return (
    <section
      id="como-funciona"
      data-pin="journey"
      data-odo-from={j.odoFrom}
      data-km={j.km}
      data-profit={profit}
      data-perkm={perKm}
      data-prefix={prefix}
      aria-labelledby="journey-title"
      className="kmbr-pin"
      data-static={reduced || m ? "" : undefined}
      style={{ height: reduced || m ? "auto" : "300vh" }}
    >
      <div className="kmbr-pin-sticky">
        <div className="kmbr-pin-grid">
          <div className="kmbr-pin-copy">
            <div style={EYEBROW}>{j.eyebrow}</div>
            <h2 id="journey-title" style={{ ...H2, marginTop: 14, textWrap: "balance" }}>
              {j.title}
            </h2>
            <p className="kmbr-hide-m" style={LEAD}>
              {j.lead}
            </p>
            <ol className="kmbr-jsteps kmbr-hide-m">
              {j.steps.map(([title, text], i) => (
                <li key={title} data-jstep={i} data-active={i === 3 ? "1" : "0"}>
                  <span className="kmbr-jsteps-n">{i + 1}</span>
                  <span>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="kmbr-win" aria-hidden="true">
            <div className="kmbr-win-bar">
              <span />
              <span />
              <span />
              <b>{j.window}</b>
            </div>
            <div className="kmbr-win-body">
              <div className="kmbr-jtrip">
                <span>{j.route}</span>
                <span className="kmbr-pill" data-jkm="">
                  + {fmt(j.km)} {j.tripKm}
                </span>
              </div>
              <div className="kmbr-jodo">
                <span>{j.odoLabel}</span>
                <b data-jodo="">{fmt(j.odoFrom + j.km)} km</b>
              </div>

              <ul className="kmbr-jrows">
                {j.rows.map(([label, amount, kind, step, auto]) => (
                  <li key={label} data-jrow={step} data-on="1">
                    <span>
                      {label}
                      {auto && <em className="kmbr-auto">{j.autoTag}</em>}
                    </span>
                    <b data-kind={kind}>
                      {kind === "in" ? "+ " : "− "}
                      {money(amount)}
                    </b>
                  </li>
                ))}
              </ul>

              <div className="kmbr-jresult" data-jresult="" data-on="1">
                <span>{j.result}</span>
                <b data-jprofit="">{money(profit)}</b>
                <span className="kmbr-jperkm">
                  <b data-jperkm="">{prefix + fmt(perKm, 2)}</b> {j.perKm}
                </span>
              </div>

              <div className="kmbr-jcaptions kmbr-only-m">
                {j.steps.map(([title, text], i) => (
                  <p key={title} data-jcaption={i} data-active={i === 3 ? "1" : "0"}>
                    <strong>
                      {i + 1}. {title}
                    </strong>{" "}
                    {text}
                  </p>
                ))}
              </div>
            </div>
            <div className="kmbr-demotag kmbr-win-tag">{c.hero.demoTag}</div>
          </div>
        </div>
      </div>
      <p style={SR_ONLY}>{j.sr}</p>
    </section>
  )
}

type Cell = { amount: number; paid: boolean; order: number | null }

export function CobroScene() {
  const { c, m, money, reduced } = useLanding()
  const t = c.cuentas

  // Las celdas pendientes se cobran en orden al scrollear; la última queda
  // pendiente para que la demo termine en un caso real, no en "todo cobrado".
  let order = 0
  const pendingTotal = c.fletes.reduce((s, f) => s + [f.a, f.s, f.p].reduce((x, [amt, paid]) => x + (paid ? 0 : amt), 0), 0)
  const flippable = c.fletes.flatMap((f) => [f.a, f.s, f.p]).filter(([, paid]) => !paid).length - 1
  const rows = c.fletes.map((f) => ({
    ...f,
    cells: [f.a, f.s, f.p].map(([amount, paid]): Cell => {
      if (paid) return { amount, paid: true, order: null }
      const o = order < flippable ? order++ : null
      return { amount, paid: o !== null, order: o }
    }),
  }))
  const grand = c.fletes.reduce((s, f) => s + f.a[0] + f.s[0] + f.p[0], 0)
  const leftAtEnd = rows.flatMap((r) => r.cells).filter((cell) => !cell.paid).reduce((s, cell) => s + cell.amount, 0)

  return (
    <section
      id="cobranza"
      data-pin="cobro"
      data-grand={grand}
      data-pending={pendingTotal}
      data-prefix={`${c.currency} `}
      aria-labelledby="cobro-title"
      className="kmbr-pin kmbr-pin-tint"
      data-static={reduced || m ? "" : undefined}
      style={{ height: reduced || m ? "auto" : "260vh" }}
    >
      <div className="kmbr-pin-sticky">
        <div className="kmbr-pin-grid">
          <div className="kmbr-pin-copy">
            <div style={EYEBROW}>{t.eyebrow}</div>
            <h2 id="cobro-title" style={{ ...H2, marginTop: 14, textWrap: "balance" }}>
              {t.title}
            </h2>
            <p style={LEAD}>{t.lead}</p>
          </div>

          <div className="kmbr-win" aria-hidden="true">
            <div className="kmbr-win-bar">
              <span />
              <span />
              <span />
              <b>{t.eyebrow}</b>
            </div>
            <div className="kmbr-win-body">
              <div className="kmbr-owed-label">{t.owedLabel}</div>
              <div className="kmbr-owed" data-owed="">
                {money(leftAtEnd)}
              </div>
              <div className="kmbr-owed-ctx">
                <span className="kmbr-paid-dot" />
                <span data-collected="">{money(grand - leftAtEnd)}</span> {t.paid.toLowerCase()} {t.of} {money(grand)} · {t.period}
              </div>
              <div className="kmbr-bar">
                <span data-paidbar="" style={{ transform: `scaleX(${((grand - leftAtEnd) / grand).toFixed(3)})` }} />
              </div>

              <div className="kmbr-cgrid" role="presentation">
                <span className="kmbr-cgrid-h">{t.cols[0]}</span>
                <span className="kmbr-cgrid-h">{t.cols[2]}</span>
                <span className="kmbr-cgrid-h">{t.cols[3]}</span>
                <span className="kmbr-cgrid-h">{t.cols[4]}</span>
                {rows.map((r, i) => (
                  <div key={r.client} className="kmbr-cgrid-row">
                    <span className="kmbr-cgrid-client">
                      <i style={{ background: PLATE_COLORS[i % PLATE_COLORS.length] }}>{r.truck}</i>
                      <span>{m ? r.client.split(" ")[0] : r.client}</span>
                    </span>
                    {r.cells.map((cell, k) => (
                      <span
                        key={k}
                        className="kmbr-cell"
                        data-cell=""
                        data-amount={cell.amount}
                        data-paid={cell.paid ? "1" : "0"}
                        data-order={cell.order ?? undefined}
                      >
                        <span className="kmbr-cell-check">
                          <CheckIcon />
                        </span>
                        {money(cell.amount)}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              <div className="kmbr-legend">
                <span>
                  <i data-tone="pending" /> {t.pending}
                </span>
                <span>
                  <i data-tone="paid" /> {t.paid}
                </span>
                <span className="kmbr-demotag">{c.hero.demoTag}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p style={SR_ONLY}>{t.sr}</p>
    </section>
  )
}
