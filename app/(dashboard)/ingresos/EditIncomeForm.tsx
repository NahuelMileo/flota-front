"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
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
import { useState } from "react";
import { toast } from "sonner";
import { Income } from "./columns";

type Truck = {
  id: string;
  licensePlate: string;
  model?: string;
};

const incomeTypeItems = [
  { label: "Flete", value: "1" },
  { label: "Otro", value: "2" },
];

export default function EditIncomeForm({
  income,
  trucks,
  onSuccess,
}: {
  income: Income;
  trucks: Truck[];
  onSuccess: (income: Income) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [truckId, setTruckId] = useState<string | null>(income.truckId ?? null);
  const [incomeType, setIncomeType] = useState(String(income.type ?? "1"));

  const truckItems = [
    { label: "Sin asignar", value: "none" },
    ...trucks.map((t) => ({
      label: `${t.licensePlate}${t.model ? ` - ${t.model}` : ""}`,
      value: t.id,
    })),
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData(e.currentTarget);

    const body = {
      description: formData.get("description"),
      value: parseFloat(formData.get("value") as string),
      dateUtc: formData.get("dateUtc"),
      truckId,
      type: parseInt(incomeType),
    };

    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/incomes/${income.id}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) throw new Error();

      const updated = await res.json();

      toast.success("Ingreso actualizado");
      onSuccess(updated);
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <Label>Descripción</Label>
          <Input
            name="description"
            defaultValue={income.description}
            required
          />
        </Field>

        <Field>
          <Label>Valor</Label>
          <Input
            name="value"
            type="number"
            step="0.01"
            defaultValue={income.value}
            required
          />
        </Field>

        <Field>
          <Label>Fecha</Label>
          <Input
            name="dateUtc"
            type="date"
            defaultValue={income.dateUtc.split("T")[0]}
            required
          />
        </Field>

        <Field>
          <Label>Camión</Label>
          <Select
            items={truckItems}
            value={truckId ?? "none"}
            onValueChange={(value) =>
              setTruckId(value === "none" ? null : value)
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
        </Field>

        <Field>
          <Label>Tipo</Label>
          <Select
            items={incomeTypeItems}
            value={incomeType}
            onValueChange={(value) => setIncomeType(value ?? "1")}
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
        </Field>
      </FieldGroup>

      <Button className="mt-4 w-full" disabled={isUpdating}>
        Guardar cambios
      </Button>
    </form>
  );
}
