"use client"

import Link from "next/link"
import { motion } from "motion/react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export type NavItem = {
  title: string
  url: string
  icon?: React.ReactNode
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

/**
 * Un ítem sigue activo dentro de sus rutas hijas: estando en el detalle de un camión o
 * en sus costos, "Camiones" tiene que seguir marcado. Con comparación exacta, apenas se
 * entraba a un detalle el sidebar quedaba sin nada seleccionado y se perdía el norte.
 */
function isItemActive(pathname: string, url: string) {
  if (pathname === url) return true
  return pathname.startsWith(`${url}/`)
}

export function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => {
                const isActive = isItemActive(pathname, item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      render={<Link href={item.url} onClick={() => setOpenMobile(false)} />}
                      isActive={isActive}
                      className="relative"
                    >
                      {/*
                        El riel viaja hasta el ítem nuevo en lugar de reaparecer en otro
                        lado: es lo que hace que la navegación se sienta como un lugar y
                        no como una lista de botones. El `layoutId` es por grupo, así el
                        indicador se mueve dentro de su sección.
                      */}
                      {isActive && (
                        <motion.span
                          layoutId={`nav-rail-${group.label}`}
                          aria-hidden
                          className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                        />
                      )}
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
