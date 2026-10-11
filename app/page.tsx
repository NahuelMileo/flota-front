import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Kilometría",
  description: "Gestión para empresas de transporte de carga en Uruguay y Brasil.",
}

// Banderas en SVG: los emojis de bandera no se ven en Windows (muestran "UY"/"BR").
function UruguayFlag() {
  const rays = Array.from({ length: 16 }, (_, i) => i * 22.5)
  return (
    <svg viewBox="0 0 27 18" width="96" height="64" aria-hidden="true" style={{ display: "block" }}>
      <rect width="27" height="18" fill="#FFFFFF" />
      {[1, 3, 5, 7].map((i) => (
        <rect key={i} y={i * 2} width="27" height="2" fill="#0038A8" />
      ))}
      <rect width="13" height="10" fill="#FFFFFF" />
      <g transform="translate(6.5 5)">
        {rays.map((deg) => (
          <path key={deg} d="M-0.6 -2.4 L0 -4.4 L0.6 -2.4 Z" fill="#FCD116" stroke="#7B3F00" strokeWidth="0.15" transform={`rotate(${deg})`} />
        ))}
        <circle r="2.4" fill="#FCD116" stroke="#7B3F00" strokeWidth="0.2" />
      </g>
    </svg>
  )
}

function BrazilFlag() {
  return (
    <svg viewBox="0 0 30 21" width="96" height="64" aria-hidden="true" style={{ display: "block" }}>
      <rect width="30" height="21" fill="#009C3B" />
      <path d="M15 2.2 L27.6 10.5 L15 18.8 L2.4 10.5 Z" fill="#FFDF00" />
      <circle cx="15" cy="10.5" r="5" fill="#002776" />
      <path d="M10.1 9.6 Q15 8.2 19.9 11.4" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
    </svg>
  )
}

const COUNTRIES = [
  { href: "/uy", label: "Uruguay", hint: "En español", Flag: UruguayFlag },
  { href: "/br", label: "Brasil", hint: "Em português", Flag: BrazilFlag },
]

export default function CountryPicker() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-10 bg-[#FAFAF8] px-4 py-16 text-[#0B0C0E]">
      <div className="text-center">
        <p className="text-xl font-semibold tracking-tight">Kilometría</p>
        <h1 className="mt-6 text-3xl font-medium tracking-tight sm:text-4xl">¿Desde dónde trabajás?</h1>
        <p className="mt-2 text-lg text-[#5F656E]">De onde você trabalha?</p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {COUNTRIES.map(({ href, label, hint, Flag }) => (
          <Link
            key={href}
            href={href}
            className="group flex w-56 flex-col items-center gap-4 rounded-2xl border border-black/10 bg-white px-6 py-8 transition-colors hover:border-[#13865A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#13865A]"
          >
            <span className="overflow-hidden rounded-md shadow-sm ring-1 ring-black/10 transition-transform group-hover:scale-105">
              <Flag />
            </span>
            <span className="text-xl font-medium">{label}</span>
            <span className="text-sm text-[#5F656E]">{hint}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
