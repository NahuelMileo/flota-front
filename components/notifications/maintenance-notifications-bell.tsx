"use client"

import { useState } from "react"
import { BellIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { useMaintenanceAlerts } from "@/hooks/use-maintenance-alerts"
import { MaintenanceAlertList } from "@/components/notifications/maintenance-alert-list"
import type { MaintenanceAlert } from "@/types/maintenance-alert"

export function MaintenanceNotificationsBell() {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const { alerts, isLoading, hasError, unreadCount, refetch, markAsRead } =
    useMaintenanceAlerts()

  const handleMarkAsRead = (alert: MaintenanceAlert) => {
    markAsRead(alert.id)
  }

  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Notificaciones de mantenimiento"
      className="relative"
    >
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

  const header = (
    <>
      <p className="text-sm font-medium">Notificaciones</p>
      <p className="text-xs text-muted-foreground">
        Mantenimientos próximos, vencidos y resueltos
        {unreadCount > 0 && ` · ${unreadCount} sin leer`}
      </p>
    </>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={trigger} />
        <SheetContent side="bottom" className="max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>Notificaciones</SheetTitle>
            <SheetDescription>
              Mantenimientos próximos, vencidos y resueltos
              {unreadCount > 0 && ` · ${unreadCount} sin leer`}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <MaintenanceAlertList
              alerts={alerts}
              isLoading={isLoading}
              hasError={hasError}
              onRetry={refetch}
              onMarkAsRead={handleMarkAsRead}
            />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent align="end" className="w-95 sm:w-105">
        <div className="space-y-0.5 px-1 pt-1">{header}</div>
        <MaintenanceAlertList
          alerts={alerts}
          isLoading={isLoading}
          hasError={hasError}
          onRetry={refetch}
          onMarkAsRead={handleMarkAsRead}
        />
      </PopoverContent>
    </Popover>
  )
}
