"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Los tokens `.dark` ya estaban escritos en globals.css, pero sin este proveedor nunca
 * se aplicaban: el tema oscuro era código muerto.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
