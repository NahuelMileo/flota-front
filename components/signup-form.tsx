"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useEffect } from "react";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";
import { validatePassword } from "@/utils/passwordValidator";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | null>(null);
  const passwordValidation = validatePassword(password);

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
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = formData.get("username");
    const email = formData.get("email")
    const pwd = formData.get("password") as string
    const confirmPwd = formData.get("confirm-password") as string;

    if (pwd !== confirmPwd) {
      toast.error("Error al registrarse",{
        description:"Las contraseñas no coinciden.",
      })
      return;
    }

    const validation = validatePassword(pwd);
    if (!validation.isValid) {
      toast.error("Error al registrarse",{
        description: validation.errors[0],
      })
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username, email, password: pwd
        })
      })

      // Handle rate limiting BEFORE parsing JSON (429 might not be valid JSON)
      if (response.status === 429) {
        const retryAfterHeader =
          response.headers.get('retry-after') ||
          response.headers.get('Retry-After') ||
          response.headers.get('X-RateLimit-Reset-After') ||
          '180';

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
        const msg: string = data.message || ""
        let description = msg || "Ocurrió un error al crear la cuenta."
        if (response.status === 409) {
          description = "Ya existe una cuenta con ese email o nombre de usuario."
        } else if (msg.toLowerCase().includes("weak patterns")) {
          description = "La contraseña contiene patrones comunes débiles. Elegí una más única."
        } else if (msg.toLowerCase().includes("too weak")) {
          description = "La contraseña es muy débil. Combiná mayúsculas, minúsculas, números y símbolos."
        }
        toast.error("Error al registrarse",{
          description,
        })
        setIsLoading(false);
        return;
      }
    } catch {
      setIsLoading(false);
      return;
    }

    toast.success("Cuenta creada exitosamente", {
      description: "Te redirigiremos al inicio de sesión",
    })

    setIsLoading(false);

    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  }

return (
  <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
    <FieldGroup>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Llená el formulario para crear tu cuenta
        </p>
      </div>
      <Field>
        <FieldLabel htmlFor="username">Nombre de usuario</FieldLabel>
        <Input id="username" name="username" type="text" placeholder="juanperez" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" name="email" type="email" placeholder="juanperez@ejemplo.com" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="password">Contraseña</FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {password && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Seguridad:
                <span className={cn("ml-1", {
                  "text-red-500": passwordValidation.strength === 'weak',
                  "text-yellow-500": passwordValidation.strength === 'medium',
                  "text-green-500": passwordValidation.strength === 'strong',
                })}>
                  {passwordValidation.strength === 'weak' && 'Débil'}
                  {passwordValidation.strength === 'medium' && 'Media'}
                  {passwordValidation.strength === 'strong' && 'Fuerte'}
                </span>
              </div>
            </div>
            {passwordValidation.errors.length > 0 && (
              <ul className="text-sm text-red-500 space-y-1">
                {passwordValidation.errors.map((err) => (
                  <li key={err}>• {err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor="confirm-password">Confirmar contraseña</FieldLabel>
        <Input
          id="confirm-password"
          name="confirm-password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {password && confirmPassword && password !== confirmPassword && (
          <FieldDescription className="text-red-500">
            Las contraseñas no coinciden
          </FieldDescription>
        )}
      </Field>
      <Field>
        <Button
          type="submit"
          disabled={isLoading || isRateLimited || !passwordValidation.isValid || password !== confirmPassword || !password}
        >
          {isLoading ? "Creando cuenta..." : isRateLimited ? `Intenta en ${rateLimitRetryAfter}s` : "Crear Cuenta"}
        </Button>
      </Field>
      <Field>
        <FieldDescription className="px-6 text-center">
          ¿Ya tenés una cuenta? <a href="/login">Iniciá sesión</a>
        </FieldDescription>
      </Field>
    </FieldGroup>
  </form>
)
}
