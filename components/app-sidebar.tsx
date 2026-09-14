"use client";
import * as React from "react";
import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  TruckIcon,
  CommandIcon,
  DollarSign,
  BanknoteArrowDown,
  HandCoins,
  MapPin,
  ReceiptIcon,
  Settings2Icon,
  Wrench,
  Users,
  CalendarClock,
} from "lucide-react";
import { useLayoutEffect, useState } from "react";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    tenantName: "",
  });

  useLayoutEffect(() => {
    const username = localStorage.getItem("username") || "";
    const email = localStorage.getItem("email") || "";
    const tenantName = localStorage.getItem("tenantName") || "";

    if (username || email || tenantName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserInfo({ username, email, tenantName });
    }
  }, []);
  const data = {
    user: {
      name: userInfo.username,
      email: userInfo.email,
    },
    // Diez ítems planos obligan a leer la lista entera para encontrar uno. Agrupados por
    // lo que hace el usuario —mover camiones, seguir la plata, mantener los datos— se
    // busca por sección y no por nombre.
    navGroups: [
      {
        label: "Operación",
        items: [
          { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon /> },
          { title: "Viajes", url: "/trips", icon: <MapPin /> },
          { title: "Camiones", url: "/camiones", icon: <TruckIcon /> },
          { title: "Mantenimientos", url: "/mantenimientos", icon: <Wrench /> },
          { title: "Vencimientos", url: "/vencimientos", icon: <CalendarClock /> },
        ],
      },
      {
        label: "Dinero",
        items: [
          { title: "Cuentas a Recibir", url: "/cuentas-a-recibir", icon: <HandCoins /> },
          { title: "Ingresos", url: "/ingresos", icon: <DollarSign /> },
          { title: "Egresos", url: "/egresos", icon: <BanknoteArrowDown /> },
          { title: "Costos fijos", url: "/costos", icon: <ReceiptIcon /> },
        ],
      },
      {
        label: "Administración",
        items: [
          { title: "Clientes", url: "/clientes", icon: <Users /> },
          { title: "Configuración", url: "/configuracion", icon: <Settings2Icon /> },
        ],
      },
    ],
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">{userInfo.tenantName}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={data.navGroups} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
