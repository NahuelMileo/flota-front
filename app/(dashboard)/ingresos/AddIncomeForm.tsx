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

export default function AddIncomeForm({
  trucks,
  onSuccess,
}: {
  trucks: Truck[];
  onSuccess: (income: Income) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [truckId, setTruckId] = useState<string | null>(null);
  const [incomeType, setIncomeType] = useState("1");

  const todayIso = new Date().toISOString().split("T")[0];

  const truckItems = [
    { label: "Sin asignar", value: "none" },
    ...trucks.map((t) => ({
      label: `${t.licensePlate}${t.model ? ` - ${t.model}` : ""}`,
      value: t.id,
    })),
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/incomes`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      toast.success("Ingreso agregado");
      onSuccess(data);
    } catch {
      toast.error("Error al agregar ingreso");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <Label>Descripción</Label>
          <Input name="description" required placeholder="Rodut" />
        </Field>

        <Field>
          <Label>Valor</Label>
          <Input name="value" type="number" step="0.01" required  placeholder="12000"/>
        </Field>

        <Field>
          <Label>Fecha</Label>
          <Input name="dateUtc" type="date" defaultValue={todayIso} required />
        </Field>
        <Select
  items={truckItems}
  value={truckId ?? "none"}
  onValueChange={(value) => setTruckId(value === "none" ? null : value)}
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
      </FieldGroup>

      <Button className="mt-4 w-full" type="submit" disabled={isSubmitting}>
        Agregar ingreso
      </Button>
    </form>
  );
}
