"use client"

import { useEffect, useState } from "react"
import { Bell, ChevronDown, Search, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandMenu } from "./command-menu"
import { useAuth } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"
import { getCurrentUserInfo } from "@/lib/api/api"
import { CurrentUser } from "@/lib/types/interface"


export function DashboardNavbar() {
  const [showCommandMenu, setShowCommandMenu] = useState<boolean>(false)
  const [notificationCount, setNotificationCount] = useState<number>(3)
  const [userInfo, setUserInfo] = useState<CurrentUser | null>(null)
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      try {
        const user = await getCurrentUserInfo();
        console.log("User info:", user);
        setUserInfo(user);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };
    fetchUser();
  }, []);

  // Helper function to get user initials
  const getUserInitials = (displayName: string): string => {
    if (!displayName) return "U"
    return displayName
      .split(" ")
      .map(name => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="mr-2" />
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search or type command..."
            className="w-[300px] pl-8 md:w-[300px] lg:w-[400px]"
            onClick={() => setShowCommandMenu(true)}
            style={{
              fontFamily: 'Typeface/family/family',
              fontWeight: 400,
              fontSize: 'Typeface/size/Text sm',
              lineHeight: 'Typeface/line height/Text sm',
              letterSpacing: '0%',
            }}
          />
          <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* <ThemeToggle /> */}

        {/* <Button variant="ghost" size="icon" className="relative">
          <img src="/assets/icons/bell-icon.svg" alt="Notifications" className="h-5 w-5" />

          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              style={{ background: 'var(--Colors-Orange-400, #FD853A)' }}
            >
              {notificationCount}
            </Badge>
          )}
        </Button> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>
                  {userInfo?.displayName ? getUserInitials(userInfo.displayName) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left" style={{
                fontFamily: 'Typeface/family/family',
                fontWeight: 500,
                fontSize: 'Typeface/size/Text sm',
                lineHeight: 'Typeface/line height/Text sm',
                letterSpacing: '0%',
              }}>
                <p className="text-sm font-medium">
                  {userInfo?.displayName || "Loading..."}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            {userInfo?.role === 'teacher' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/teacher/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/teacher/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem onClick={async () => {
              await logout();
              router.push('/login');
            }}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showCommandMenu && <CommandMenu open={showCommandMenu} onOpenChange={setShowCommandMenu} role ={userInfo?.role || ''}/>}
    </header>
  )
}