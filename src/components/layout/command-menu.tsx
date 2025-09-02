"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  FileText,
  FolderArchive,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Receipt,
  Settings,
  User,
  Users,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { UserRole } from "@/lib/constants/enums"

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: string
}

export function CommandMenu({ open, onOpenChange, role }: CommandMenuProps) {
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const runCommand = (command: () => void) => {
    onOpenChange(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {role === UserRole.TEACHER && (
            <>
              <CommandItem onSelect={() => runCommand(() => router.push("/teacher"))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Generate Questions</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/teacher/downloaded-papers"))}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Downloaded Papers</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/teacher/settings"))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/teacher/profile"))}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </CommandItem>
            </>
          )}

          {role === UserRole.SUPER_ADMIN && (
            <>
              <CommandItem onSelect={() => runCommand(() => router.push("/admin"))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/admin/college"))}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Colleges</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/admin/question-bank"))}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Question Bank</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/admin/add-question"))}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Add Question</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/admin/add-college"))}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Add College</span>
              </CommandItem>
            </>
          )}
          {role === UserRole.COLLEGE_ADMIN && (
            <>
              <CommandItem onSelect={() => runCommand(() => router.push("/college"))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/college/teachers-list"))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Teachers</span>
              </CommandItem>
            </>
          )}
          </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

