import type { Metadata, Viewport } from "next";
import AuthGuard from "@/components/auth-guard";

export const metadata: Metadata = {
  title: "Kilometria · Chofer",
};

// Pensada para el celular del chofer: sin zoom accidental al tocar los campos.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Sin la barra lateral de la gestión: el chofer solo ve su pantalla.
export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        {children}
      </main>
    </AuthGuard>
  );
}
