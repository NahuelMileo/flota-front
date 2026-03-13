"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("Error al iniciar sesión", {
          description:
            data.message ||
            "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
          position: "bottom-right",
          richColors: true,
        });
        setIsLoading(false);
        return;
      }

      toast.success("Inicio de sesión exitoso", {
        description: "Redirigiendote al dashboard...",
        position: "bottom-right",
        richColors: true,
      });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      // antes
      localStorage.setItem("tenantId", data.tenantId);
      localStorage.setItem("userId", data.userId);

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

      setTimeout(() => {
        data.tenantId
          ? (window.location.href = "/dashboard")
          : (window.location.href = "/onboarding");
      }, 1500);
    } catch (error) {
      toast.error("Error al iniciar sesión", {
        description:
          "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        position: "bottom-right",
        richColors: true,
      });
    } finally {
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Inicia sesión"}
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
