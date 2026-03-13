"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const MINIMUM_PASSWORD_LENGTH = 8;
  const PLACEHOLDER = "\u00A0"
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = formData.get("username");
    const email = formData.get("email")
    const password = formData.get("password")
    const confirmPassword = formData.get("confirm-password");

    if (password != confirmPassword) {
      setError("Las contraseñas deben coincidir");
      toast.error("Error al registrarse",{
        description:" Las contraseñas no coinciden.",
        position:"bottom-right", 
        // richColors:true,
      })
      return;
    }

    if (password!.toString().length < MINIMUM_PASSWORD_LENGTH) {
      setError("La contraseña debe tener como mínimo 8 caracteres")
      toast.error("Error al registrarse",{
        description:" La contraseña debe tener al menos 8 caracteres.",
        position:"bottom-right", 
        // richColors:true,
      })
      return;
    }
    setError(PLACEHOLDER)
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username, email, password
        })
      })

      const data = await response.json();

      if (!response.ok) {
        console.log(data);
        setError(data.message || "Ocurrió un error al crear la cuenta");
        toast.error("Error al registrarse",{
          description: data.error || "Ocurrió un error al crear la cuenta.",
          position: "bottom-right",
          // richColors: true,
        })
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log(error)
      setError("Ocurrió un error al crear la cuenta");
      setIsLoading(false);
      return;
    }

    toast.success("Cuenta creada exitosamente", {
      description: "Te redirigiremos al inicio de sesión",
      position: "bottom-right",
      // richColors: true,
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
        <Input id="password" name="password" type="password" required />
        <FieldDescription className="text-sm">
          La contraseña debe tener al menos {MINIMUM_PASSWORD_LENGTH} caracteres.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="confirm-password">Confirmar contraseña</FieldLabel>
        <Input id="confirm-password" name="confirm-password" type="password" required />
      </Field>
      <Field>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
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
