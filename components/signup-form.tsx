import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Llená el formulario para crear tu cuenta
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
          <Input id="name" type="text" placeholder="Juan Pérez" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="juanperez@ejemplo.com" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input id="password" type="password" required />
          <FieldDescription>
            Debe tener 8 caracteres como mínimo
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirmar contraseña</FieldLabel>
          <Input id="confirm-password" type="password" required />
          <FieldDescription>Por favor confirme su contraseña.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit">Registrarse</Button>
        </Field>
        <Field>
          <FieldDescription className="px-6 text-center">
            ¿Ya tenés una cuenta? <a href="#">Iniciá sesión</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
