import { JetBrains_Mono } from "next/font/google"

// Metadata, labels and every metric on the home page use JetBrains Mono —
// Geist (display + body) is already loaded globally in app/layout.tsx.
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
})
