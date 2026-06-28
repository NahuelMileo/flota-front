"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | null>(null);

  // Countdown for rate limit (visual only - resets on page reload, backend enforces actual limit)
  useEffect(() => {
    if (!isRateLimited || !rateLimitRetryAfter) return;

    const interval = setInterval(() => {
      setRateLimitRetryAfter((prev) => {
        if (prev === null || prev <= 1) {
          setIsRateLimited(false);
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, rateLimitRetryAfter]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    setIsLoading(true);
    try {
      const response = await fetch(
        apiUrl("/api/auth/login"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      // Handle rate limiting BEFORE parsing JSON (429 might not be valid JSON)
      if (response.status === 429) {
        const retryAfterHeader =
          response.headers.get('retry-after') ||
          response.headers.get('Retry-After') ||
          response.headers.get('X-RateLimit-Reset-After') ||
          '60';

        const retryAfter = Math.max(1, parseInt(retryAfterHeader));
        setIsRateLimited(true);
        setRateLimitRetryAfter(retryAfter);

        console.log('Rate limited. Retry after:', retryAfter, 'seconds. Backend enforces actual limit.');

        toast.error("Demasiados intentos", {
          description: `Por favor, intenta de nuevo en ${retryAfter} segundos.`,
        });

        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        // Generic error for invalid credentials (don't distinguish between user not found and wrong password)
        toast.error("Error al iniciar sesión", {
          description: "Email o contraseña inválidos.",
        });
        setIsLoading(false);
        return;
      }
      toast.success("Inicio de sesión exitoso", {
        description: "Redirigiendote al dashboard...",
      });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("username", data.username)
      localStorage.setItem("email", data.email)

      if (data.tenantId) {
        localStorage.setItem("tenantId", data.tenantId);
      } else {
        localStorage.removeItem("tenantId");
      }

      if (data.userId) {
        localStorage.setItem("userId", data.userId);
      } else {
        localStorage.removeItem("userId");
      }

      if (data.tenantName) {
        localStorage.setItem("tenantName", data.tenantName);
      } else {
        localStorage.removeItem("tenantName");
      }

      if (data.displayCurrency) {
        localStorage.setItem("displayCurrency", data.displayCurrency);
      }

      setTimeout(() => {
        if (data.tenantId) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/onboarding";
        }
      }, 1500);
    } catch {
      toast.error("Error al iniciar sesión", {
        description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
      });
      setIsLoading(false);
    }
  }
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Inicia sesión</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Inicia sesión con tu correo electrónico y contraseña para acceder a
            tu cuenta.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="juanperez@ejemplo.com"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          </div>
          <Input id="password" name="password" type="password" required />
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading || isRateLimited}>
            {isLoading ? "Iniciando sesión..." : isRateLimited ? `Intenta en ${rateLimitRetryAfter}s` : "Inicia sesión"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            ¿No tienes una cuenta?{" "}
            <a href="/signup" className="underline underline-offset-4">
              Regístrate aquí
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
