"use client"

import Link from "next/link"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  FileText,
  FolderArchive,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Receipt,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { UserRole } from "@/lib/constants/enums"
import {
  adminMenuItems,
  collegeMenuItems,
  teacherMenuItems,
} from "@/lib/constants/menuItems"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  role: UserRole
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname()

  let menuItems = adminMenuItems
  const [notSupportedOpen, setNotSupportedOpen] = useState(false)
  const [pendingFeature, setPendingFeature] = useState<string | null>(null)


  switch (role) {
    case UserRole.COLLEGE_ADMIN:
      menuItems = collegeMenuItems
      break
    case UserRole.TEACHER:
      menuItems = teacherMenuItems
      break
    case UserRole.SUPER_ADMIN:
      menuItems = adminMenuItems
      break
    default:
      menuItems = adminMenuItems
      break
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex items-center justify-center">
          <img
            src="/assets/logo/medicos-logo.svg"
            alt="Logo"
            className="h-[70px] w-auto"
          />
        </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((section) => (
          <SidebarGroup key={section.title}>
<SidebarGroupLabel className="font-outfit font-normal text-[12px] leading-[20px] uppercase mb-3 text-[#98A2B3]">
  {section.title}
</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu  className="space-y-2">
                {section.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.submenu &&
                    item.submenu.some((subItem) => pathname === subItem.href));
                  const isSupportFeature = section.title === 'SUPPORT' && (item.title === 'Chat' || item.title === 'Invoice')

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        // Try stronger approach with !important
                        className={cn(
                          isActive && "!bg-[#E8F5E8] hover:!bg-[#E8F5E8]"
                        )}
                        style={isActive ? { background: "#E8F5E8" } : {}}
                      >
                        <Link
                          href={isSupportFeature ? '#' : item.href}
                          onClick={isSupportFeature ? (e) => { e.preventDefault(); setPendingFeature(item.title); setNotSupportedOpen(true); } : undefined}
                          className={cn(
                            "flex items-center",
                            isActive && "bg-[#E8F5E8]"
                          )}
                        >
                            {item.iconPath ? (
                              <img
                                src={item.iconPath}
                                alt={`${item.title} icon`}
                                className="mr-2 h-5 w-5 object-contain"
                              />
                            ) : item.icon ? (
                              <item.icon className={`mr-2 h-5 w-5 ${isActive ? "text-[#05603A]" : "text-white"}`} />
                            ) : (
                              <div className="mr-2 h-5 w-5"></div>
                            )}

                          <span className={cn(
                            "text-sm font-medium",
                            isActive ? "text-[#05603A]" : "text-white"
                          )}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <Badge
                            variant="secondary"
                            className="ml-auto text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          >
                            {item.badge}
                          </Badge>

                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      {/* Not Supported Modal */}
      <AlertDialog open={notSupportedOpen} onOpenChange={setNotSupportedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Feature not supported yet</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingFeature ? `${pendingFeature} is not supported yet. ` : ''}
              {/* Please use existing UI styles. */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setNotSupportedOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}