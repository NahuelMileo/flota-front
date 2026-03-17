"use client";
import * as React from "react";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
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
} from "lucide-react";
import { useEffect, useState } from "react";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    tenantName: "",
  });
  useEffect(() => {
    setUserInfo({
      username: localStorage.getItem("username") || "",
      email: localStorage.getItem("email") || "",
      tenantName: localStorage.getItem("tenantName") || "",
    });
  }, []);
  const data = {
    user: {
      name: userInfo.username,
      email: userInfo.email,
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: <LayoutDashboardIcon />,
      },
      {
        title: "Camiones",
        url: "/camiones",
        icon: <TruckIcon />,
      },
      {
        title: "Ingresos",
        url: "/ingresos",
        icon: <DollarSign />,
      }
    ],
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">{userInfo.tenantName}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
