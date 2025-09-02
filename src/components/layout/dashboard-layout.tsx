"use client"

import { type ReactNode, useState } from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardNavbar } from "./dashboard-navbar"
import { useIsMobile } from "@/hooks/use-mobile"
import { SidebarProvider } from "@/components/ui/sidebar"
import { UserRole } from "@/lib/constants/enums"

interface DashboardLayoutProps {
  children: ReactNode
  role: UserRole
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  return (
<SidebarProvider defaultOpen={!isMobile}>
  <div className="flex min-h-screen w-full bg-background">
    <DashboardSidebar role={role}/>
    <div className="flex flex-1 flex-col w-full">
      <DashboardNavbar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  </div>
</SidebarProvider>
  )
}

