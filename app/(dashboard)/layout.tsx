import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import AuthGuard from "@/components/auth-guard"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { DateFilterProvider } from "@/context/date-filter-context"
import { CurrencyProvider } from "@/context/currency-context"
import { MaintenanceAlertsProvider } from "@/context/maintenance-alerts-context"

export default function DashboardLayout({children} : {children:React.ReactNode}) {
  return (
    <AuthGuard>
      <CurrencyProvider>
      <DateFilterProvider>
      <MaintenanceAlertsProvider>
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="@container/main flex-1 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
      </MaintenanceAlertsProvider>
      </DateFilterProvider>
      </CurrencyProvider>
    </AuthGuard>
      )
}