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
import type { Truck } from "@/types/truck";
import type { ExpenseCategory } from "@/types/expense-category";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Income } from "./columns";
import { Expense } from "@/app/(dashboard)/egresos/columns";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type ActiveTrip = { id: string; origin: string; destination: string };


const incomeSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  value: z.number().positive("El valor debe ser mayor a 0"),
  dateUtc: z.string().min(1, "La fecha es requerida"),
  truckId: z.string().nullable(),
  type: z.enum(["1", "2"]),
  currency: z.enum(["USD", "BRL", "UYU"]),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

const incomeTypeItems = [
  { label: "Flete", value: "1" },
  { label: "Otro", value: "2" },
];

const currencyItems = [
  { label: "BRL — Real brasileño", value: "BRL" },
  { label: "USD — Dólar", value: "USD" },
  { label: "UYU — Peso uruguayo", value: "UYU" },
];

export default function AddIncomeForm({
  trucks,
  categories,
  tripId,
  defaultTruckId,
  onSuccess,
}: {
  trucks: Truck[];
  categories?: ExpenseCategory[];
  tripId?: string;
  defaultTruckId?: string;
  onSuccess: (income: Income, driverExpense?: Expense) => void;
}) {
  const todayIso = new Date().toISOString().split("T")[0];
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);

  async function fetchActiveTrip(truckId: string | null) {
    if (!truckId || truckId === "none" || tripId) { setActiveTrip(null); return; }
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/active?truckId=${truckId}`);
      if (res.ok) setActiveTrip(await res.json());
      else setActiveTrip(null);
    } catch { setActiveTrip(null); }
  }

  useEffect(() => {
    if (defaultTruckId && !tripId) fetchActiveTrip(defaultTruckId);
  }, [defaultTruckId]);

  const truckItems = [
    { label: "Sin asignar", value: "none" },
    ...trucks.map((t) => ({
      label: `${t.licensePlate}${t.model ? ` - ${t.model}` : ""}`,
      value: t.id,
    })),
  ];

  const [createDriverExpense, setCreateDriverExpense] = useState(false);
  const [driverPercentage, setDriverPercentage] = useState(15);
  const [driverPercentageError, setDriverPercentageError] = useState<string | null>(null);
  const defaultSalaryCategory = categories?.find(c => c.name.toLowerCase().includes("salari")) ?? null;
  const [salaryCategoryId, setSalaryCategoryId] = useState<string | null>(defaultSalaryCategory?.id ?? null);

  useEffect(() => {
    if (defaultSalaryCategory && !salaryCategoryId) {
      setSalaryCategoryId(defaultSalaryCategory.id);
    }
  }, [categories]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      dateUtc: todayIso,
      truckId: defaultTruckId ?? null,
      type: "1",
      currency: "BRL",
    },
  });

  const currentType = watch("type");
  const isFlete = currentType === "1";

  async function onSubmit(data: IncomeFormValues) {
    if (createDriverExpense && isFlete) {
      if (driverPercentage < 0 || driverPercentage > 100) {
        setDriverPercentageError("Debe estar entre 0 y 100");
        return;
      }
      setDriverPercentageError(null);
    }
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/incomes`,
        {
          method: "POST",
          body: JSON.stringify({
            description: data.description,
            value: data.value,
            dateUtc: data.dateUtc,
            truckId: data.truckId === "none" ? null : data.truckId,
            type: parseInt(data.type),
            currency: data.currency,
            ...(tripId || activeTrip?.id ? { tripId: tripId ?? activeTrip?.id } : {}),
          }),
        },
      );

      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al agregar ingreso"); }

      const result = await res.json();

      let driverExpense: Expense | undefined;
      if (createDriverExpense && isFlete) {
        const driverValue = result.value * (driverPercentage / 100);
        const salaryCategory = categories?.find(c => c.id === salaryCategoryId) ?? null;
        try {
          const expRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses`, {
            method: "POST",
            body: JSON.stringify({
              name: "Salario chofer",
              value: driverValue,
              date: data.dateUtc,
              truckId: data.truckId === "none" ? null : data.truckId,
              currency: data.currency,
              expenseCategoryId: salaryCategoryId,
              kilometers: null,
              liters: null,
              ...(tripId || activeTrip?.id ? { tripId: tripId ?? activeTrip?.id } : {}),
            }),
          });
          if (expRes.ok) {
            const expResult = await expRes.json();
            driverExpense = {
              ...expResult,
              categoryName: expResult.categoryName ?? salaryCategory?.name ?? null,
            };
          } else {
            const e = await expRes.json().catch(() => ({}));
            toast.error(e.message || e.title || "Ingreso creado, pero no se pudo crear el egreso de salario");
          }
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Ingreso creado, pero no se pudo crear el egreso de salario");
        }
      }

      toast.success("Ingreso agregado");
      onSuccess(result, driverExpense);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al agregar ingreso");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Label>Descripción</Label>
          <Input {...register("description")} placeholder="Rodut" />
          <FieldError errors={[errors.description]} />
        </Field>

        <Field>
          <Label>Valor</Label>
          <Input
            {...register("value", {
              setValueAs: (v) =>
                v === "" || v === null || v === undefined
                  ? undefined
                  : parseFloat(String(v).replace(",", ".")),
            })}
            type="number"
            step="0.01"
            placeholder="12000"
          />
          <FieldError errors={[errors.value]} />
        </Field>

        <Field>
          <Label>Fecha</Label>
          <Input {...register("dateUtc")} type="date" />
          <FieldError errors={[errors.dateUtc]} />
        </Field>

        {defaultTruckId ? (
          <Field>
            <Label>Camión</Label>
            <Input
              disabled
              value={trucks.find((t) => t.id === defaultTruckId)?.licensePlate || ""}
              className="bg-muted cursor-not-allowed"
            />
          </Field>
        ) : (
          <Controller
            name="truckId"
            control={control}
            render={({ field }) => (
              <Select
                items={truckItems}
                value={field.value ?? "none"}
                onValueChange={(value) => {
                  field.onChange(value === "none" ? null : value);
                  fetchActiveTrip(value === "none" ? null : value);
                }}
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
        )}

        {!tripId && activeTrip && (
          <Field>
            <Label>Viaje</Label>
            <Input
              disabled
              value={`${activeTrip.origin} → ${activeTrip.destination}`}
              className="bg-muted cursor-not-allowed"
            />
          </Field>
        )}

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              items={incomeTypeItems}
              value={field.value}
              onValueChange={(value) => field.onChange(value ?? "1")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {incomeTypeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />

        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <Select
              items={currencyItems}
              value={field.value}
              onValueChange={(value) => field.onChange(value ?? "BRL")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {currencyItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {isFlete && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="driver-expense"
                checked={createDriverExpense}
                onCheckedChange={(checked) => setCreateDriverExpense(!!checked)}
              />
              <Label htmlFor="driver-expense" className="text-sm cursor-pointer">
                Crear egreso de salario para chofer
              </Label>
            </div>

            {createDriverExpense && (
              <>
                <Field>
                  <Label>Porcentaje del chofer (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={driverPercentage}
                    onChange={(e) => {
                      setDriverPercentage(parseFloat(e.target.value) || 0);
                      setDriverPercentageError(null);
                    }}
                  />
                  {driverPercentageError && (
                    <p className="text-sm text-destructive">{driverPercentageError}</p>
                  )}
                </Field>
                {categories && categories.length > 0 && (
                  <Field>
                    <Label>Categoría del egreso</Label>
                    <Select
                      items={[
                        { label: "Sin categoría", value: "none" },
                        ...categories.map(c => ({ label: c.name, value: c.id })),
                      ]}
                      value={salaryCategoryId ?? "none"}
                      onValueChange={(v) => setSalaryCategoryId(v === "none" ? null : v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="none">Sin categoría</SelectItem>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </>
            )}
          </div>
        )}
      </FieldGroup>

      <Button className="mt-4 w-full" type="submit" disabled={isSubmitting}>
        Agregar ingreso
      </Button>
    </form>
  );
}
