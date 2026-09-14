"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SheetFormActions } from "@/components/sheet-form-actions"
import { cn } from "@/lib/utils"
import { DEFAULT_REMINDER_DAYS, DUE_DATE_TYPE_OPTIONS, formatReminders } from "@/lib/due-date-format"
import type { DueDate, DueDateType, SaveDueDateDto } from "@/types/due-date"
import type { Truck } from "@/types/truck"

const COMPANY = "company"
const MAX_REMINDERS = 5
const REMINDER_PRESETS = [30, 15, 7, 3, 1]

// Mismas reglas que CreateDueDateDto + DueDateService en flota-back.
const dueDateSchema = z
  .object({
    type: z.enum(["Insurance", "Sucta", "PropertyTitle", "MtopPermit", "Other"]),
    title: z.string().max(100, "El título no puede superar los 100 caracteres"),
    dueOn: z.string().min(1, "La fecha es requerida"),
    truckId: z.string(),
    notes: z.string().max(1000, "Las notas no pueden superar los 1000 caracteres"),
    reminderDaysBefore: z
      .array(z.number().int().min(0).max(365))
      .max(MAX_REMINDERS, `Hasta ${MAX_REMINDERS} avisos`),
  })
  .refine((v) => v.type !== "Other" || v.title.trim().length > 0, {
    path: ["title"],
    message: "Poné un título para identificar el vencimiento",
  })

type DueDateFormValues = z.infer<typeof dueDateSchema>

export function DueDateForm({
  dueDate,
  defaultDueOn,
  defaultTruckId,
  trucks,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  dueDate?: DueDate
  defaultDueOn?: string
  /** Camión precargado en el alta (desde el detalle del camión). */
  defaultTruckId?: string
  trucks: Truck[]
  onSubmit: (dto: SaveDueDateDto) => Promise<void>
  isSubmitting: boolean
  submitLabel: string
}) {
  const [customDays, setCustomDays] = useState("")

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DueDateFormValues>({
    resolver: zodResolver(dueDateSchema),
    defaultValues: {
      type: dueDate?.type ?? "Insurance",
      title: dueDate?.title ?? "",
      dueOn: dueDate?.dueOn ?? defaultDueOn ?? "",
      truckId: dueDate?.truckId ?? defaultTruckId ?? COMPANY,
      notes: dueDate?.notes ?? "",
      reminderDaysBefore: dueDate?.reminderDaysBefore ?? DEFAULT_REMINDER_DAYS,
    },
  })

  const type = watch("type")
  const reminders = watch("reminderDaysBefore")

  const setReminders = (next: number[]) => {
    const unique = Array.from(new Set(next)).sort((a, b) => b - a)
    setValue("reminderDaysBefore", unique, { shouldValidate: true })
  }

  const toggleReminder = (days: number) => {
    if (reminders.includes(days)) setReminders(reminders.filter((d) => d !== days))
    else if (reminders.length < MAX_REMINDERS) setReminders([...reminders, days])
  }

  const addCustomReminder = () => {
    const days = Number(customDays)
    if (!Number.isInteger(days) || days < 1 || days > 365 || reminders.length >= MAX_REMINDERS) return
    setReminders([...reminders, days])
    setCustomDays("")
  }

  const submit = (values: DueDateFormValues) =>
    onSubmit({
      type: values.type,
      title: values.title.trim() || null,
      dueOn: values.dueOn,
      truckId: values.truckId === COMPANY ? null : values.truckId,
      notes: values.notes.trim() || null,
      reminderDaysBefore: values.reminderDaysBefore,
    })

  const truckItems = [
    { value: COMPANY, label: "Empresa (sin camión)" },
    ...trucks.map((t) => ({ value: t.id, label: t.model ? `${t.licensePlate} - ${t.model}` : t.licensePlate })),
  ]
  // Un camión dado de baja no viene en useTrucks(), pero el vencimiento lo sigue teniendo.
  if (dueDate?.truckId && !trucks.some((t) => t.id === dueDate.truckId)) {
    truckItems.push({ value: dueDate.truckId, label: dueDate.truckLicensePlate ?? "Camión dado de baja" })
  }
  const customReminders = reminders.filter((d) => !REMINDER_PRESETS.includes(d))

  return (
    <form onSubmit={handleSubmit(submit)}>
      <FieldGroup className="py-3">
        <Field>
          <Label>Tipo *</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select items={DUE_DATE_TYPE_OPTIONS} value={field.value} onValueChange={(v) => field.onChange(v as DueDateType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {DUE_DATE_TYPE_OPTIONS.map((item) => (
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
          <Label>{type === "Other" ? "Título *" : "Detalle (opcional)"}</Label>
          <Input
            {...register("title")}
            placeholder={type === "Other" ? "Ej. Permiso de circulación Brasil" : "Ej. BSE, póliza 12345"}
          />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field>
          <Label>Camión</Label>
          <Controller
            name="truckId"
            control={control}
            render={({ field }) => (
              <Select items={truckItems} value={field.value} onValueChange={(v) => field.onChange(v ?? COMPANY)}>
                <SelectTrigger>
                  <SelectValue />
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
          <Label>Vence el *</Label>
          <Input type="date" {...register("dueOn")} />
          <FieldError errors={[errors.dueOn]} />
        </Field>

        <Field>
          <Label>Avisos</Label>
          <div className="flex flex-wrap gap-1.5">
            {REMINDER_PRESETS.map((days) => {
              const active = reminders.includes(days)
              return (
                <button
                  key={days}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleReminder(days)}
                  disabled={!active && reminders.length >= MAX_REMINDERS}
                  className={cn(
                    "h-7 cursor-pointer rounded-full border px-2.5 text-xs tabular-nums transition-colors duration-(--dur-fast) disabled:cursor-not-allowed disabled:opacity-50",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {days === 1 ? "1 día" : `${days} días`}
                </button>
              )
            })}
            {customReminders.map((days) => (
              <span
                key={days}
                className="flex h-7 items-center gap-1 rounded-full border border-primary bg-primary pl-2.5 pr-1 text-xs text-primary-foreground tabular-nums"
              >
                {days} días
                <button
                  type="button"
                  aria-label={`Quitar aviso de ${days} días`}
                  onClick={() => toggleReminder(days)}
                  className="cursor-pointer rounded-full p-0.5 hover:bg-primary-foreground/20"
                >
                  <XIcon className="size-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={365}
              inputMode="numeric"
              placeholder="Otro (días)"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomReminder()
                }
              }}
              className="w-32"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomReminder}
              disabled={!customDays || reminders.length >= MAX_REMINDERS}
            >
              <PlusIcon className="size-3.5" />
              Agregar
            </Button>
          </div>
          <FieldDescription>
            {formatReminders(reminders)}. El día del vencimiento y si queda vencido también avisa.
          </FieldDescription>
          <FieldError errors={[errors.reminderDaysBefore]} />
        </Field>

        <Field>
          <Label>Notas</Label>
          <Textarea {...register("notes")} placeholder="Número de póliza, contacto, lo que haga falta para renovarlo" />
          <FieldError errors={[errors.notes]} />
        </Field>
      </FieldGroup>
      <SheetFormActions submitLabel={submitLabel} isSubmitting={isSubmitting} />
    </form>
  )
}
