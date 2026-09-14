"use client"

import { useState } from "react"
import { BellIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useMaintenanceAlerts } from "@/hooks/use-maintenance-alerts"
import { useDueDateReminders } from "@/context/due-date-reminders-context"
import { MaintenanceAlertList } from "@/components/notifications/maintenance-alert-list"
import { DueDateReminderList } from "@/components/notifications/due-date-reminder-list"

type Section = "due-dates" | "maintenance"

// Una sola campanita para todo lo que avisa: mantenimientos y vencimientos. El contador
// suma los dos; al abrir, arranca en la sección que tiene algo sin leer.
export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [section, setSection] = useState<Section>("due-dates")
  const isMobile = useIsMobile()
  const maintenance = useMaintenanceAlerts()
  const dueDates = useDueDateReminders()

  const unreadCount = maintenance.unreadCount + dueDates.unreadCount

  const handleOpenChange = (next: boolean) => {
    if (next) {
      if (dueDates.unreadCount === 0 && maintenance.unreadCount > 0) setSection("maintenance")
      else if (dueDates.unreadCount > 0) setSection("due-dates")
    }
    setOpen(next)
  }

  const trigger = (
    <Button variant="ghost" size="icon" aria-label="Notificaciones" className="relative">
      <BellIcon className="size-4" />
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-medium leading-none text-background"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  )

  const description = unreadCount > 0 ? `${unreadCount} sin leer` : "Vencimientos y mantenimientos"

  const tabs = (
    <div role="group" aria-label="Tipo de notificación" className="grid grid-cols-2 gap-0.5 rounded-lg bg-muted p-0.5">
      {(
        [
          { value: "due-dates", label: "Vencimientos", count: dueDates.unreadCount },
          { value: "maintenance", label: "Mantenimientos", count: maintenance.unreadCount },
        ] as const
      ).map((tab) => (
        <button
          key={tab.value}
          type="button"
          aria-pressed={section === tab.value}
          onClick={() => setSection(tab.value)}
          className={cn(
            "flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors duration-(--dur-fast)",
            section === tab.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {tab.count > 0 && (
            <span className="rounded-full bg-danger px-1.5 text-[10px] leading-4 text-background tabular-nums">
              {tab.count > 9 ? "9+" : tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )

  const list =
    section === "due-dates" ? (
      <DueDateReminderList
        reminders={dueDates.reminders}
        isLoading={dueDates.isLoading}
        hasError={dueDates.hasError}
        onRetry={dueDates.refetch}
        onMarkAsRead={(r) => dueDates.markAsRead(r.id)}
        onNavigate={() => setOpen(false)}
      />
    ) : (
      <MaintenanceAlertList
        alerts={maintenance.alerts}
        isLoading={maintenance.isLoading}
        hasError={maintenance.hasError}
        onRetry={maintenance.refetch}
        onMarkAsRead={(a) => maintenance.markAsRead(a.id)}
      />
    )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger render={trigger} />
        <SheetContent side="bottom" className="max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>Notificaciones</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="space-y-2 px-4 pb-4">
            {tabs}
            {list}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger render={trigger} />
      <PopoverContent align="end" className="w-95 sm:w-105">
        <div className="space-y-0.5 px-1 pt-1">
          <p className="text-sm font-medium">Notificaciones</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {tabs}
        {list}
      </PopoverContent>
    </Popover>
  )
}
