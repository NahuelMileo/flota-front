"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/api";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Expense } from "./columns";

type Truck = {
  id: string;
  licensePlate: string;
  model?: string;
};

const expenseSchema = z.object({
  name: z.string().optional(),
  value: z
    .number({ invalid_type_error: "Ingresá un valor válido" })
    .positive("El valor debe ser mayor a 0"),
  date: z.string().min(1, "La fecha es requerida"),
  truckId: z.string().nullable(),
  type: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]),
  kilometers: z.number().positive("Debe ser mayor a 0").nullable().optional(),
  liters: z.number().positive("Debe ser mayor a 0").nullable().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const expenseTypeItems = [
  { label: "Gasoil", value: "1" },
  { label: "Arla 32", value: "2" },
  { label: "Mantenimiento", value: "3" },
  { label: "Gomería", value: "4" },
  { label: "Aceite", value: "5" },
  { label: "Estacionamiento", value: "6" },
  { label: "Peaje", value: "7" },
  { label: "Salario", value: "8" },
  { label: "Contador", value: "9" },
  { label: "Financiamiento", value: "10" },
  { label: "Otro", value: "11" },
];

const FUEL_TYPES = new Set(["1", "2", "5"]);

export default function EditExpenseForm({
  expense,
  trucks,
  onSuccess,
}: {
  expense: Expense;
  trucks: Truck[];
  onSuccess: (expense: Expense) => void;
}) {
  const truckItems = [
    { label: "Sin asignar", value: "none" },
    ...trucks.map((t) => ({
      label: `${t.licensePlate}`,
      value: t.id,
    })),
  ];

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: expense.name ?? "",
      value: expense.value,
      date: expense.date,
      truckId: expense.truckId ?? null,
      type: (String(expense.type) as ExpenseFormValues["type"]) ?? "1",
      kilometers: expense.kilometers ?? null,
      liters: expense.liters ?? null,
    },
  });

  const currentType = watch("type");
  const isFuelType = FUEL_TYPES.has(currentType);

  async function onSubmit(data: ExpenseFormValues) {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${expense.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: data.name || null,
            value: data.value,
            date: data.date,
            truckId: data.truckId === "none" ? null : data.truckId,
            type: parseInt(data.type),
            kilometers: data.kilometers ?? null,
            liters: data.liters ?? null,
          }),
        },
      );

      if (!res.ok) throw new Error();

      const updated = await res.json();
      toast.success("Egreso actualizado");
      onSuccess(updated);
    } catch {
      toast.error("Error al actualizar egreso");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Label>Nombre</Label>
          <Input
            {...register("name")}
            placeholder="Ej: Nafta viaje Montevideo"
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <Label>Valor</Label>
          <Input
            {...register("value", { valueAsNumber: true })}
            type="number"
            step="0.01"
          />
          <FieldError errors={[errors.value]} />
        </Field>

        <Field>
          <Label>Fecha</Label>
          <Input {...register("date")} type="date" />
          <FieldError errors={[errors.date]} />
        </Field>

        <Field>
          <Label>Camión</Label>
          <Controller
            name="truckId"
            control={control}
            render={({ field }) => (
              <Select
                items={truckItems}
                value={field.value ?? "none"}
                onValueChange={(value) =>
                  field.onChange(value === "none" ? null : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar camión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {truckItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field>
          <Label>Tipo</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                items={expenseTypeItems}
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? "1")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {expenseTypeItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {isFuelType && (
          <>
            <Field>
              <Label>Kilómetros</Label>
              <Input
                {...register("kilometers", {
                  setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                })}
                type="number"
                step="0.01"
                placeholder="Opcional"
              />
              <FieldError errors={[errors.kilometers]} />
            </Field>

            <Field>
              <Label>Litros</Label>
              <Input
                {...register("liters", {
                  setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                })}
                type="number"
                step="0.01"
                placeholder="Opcional"
              />
              <FieldError errors={[errors.liters]} />
            </Field>
          </>
        )}
      </FieldGroup>

      <Button className="mt-4 w-full" type="submit" disabled={isSubmitting}>
        Guardar cambios
      </Button>
    </form>
  );
}
