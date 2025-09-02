import {
  LayoutDashboard,
  BookOpen,
  Users,
  FolderArchive,
  FileText,
  BarChart3,
  MessageSquare,
  Mail,
  Receipt,
} from "lucide-react";
import { UserRole } from "@/lib/constants/enums";
import { MenuSection } from "@/lib/types/menu"; 

export const adminMenuItems: MenuSection[] = [
  {
    title: "MENU",
    items: [
      {
        title: "Dashboard",
        icon: null,
        iconPath:"/assets/icons/dashboard.svg",
        href: "/admin",
        submenu: [{ title: "Overview", href: "/dashboard" }],
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.TEACHER],
      },
      {
        title: "Colleges",
        icon: null,
        href: "/admin/college",
        roles: [UserRole.SUPER_ADMIN],
      },
      {
        title: "Add College",
        icon: null,
        href: "/admin/add-college",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN],
      },
      {
        title: "Add Subjects, Chapters & Topics",
        icon: null,
        href: "/admin/add-subjectandtopic",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN],
      },
      {
        title: "Question Bank",
        icon: null,
        href: "/admin/question-bank",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN],
      },
      {
        title: "Add Question",
        icon: null,
        href: "/admin/add-question",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN],
      },
      {
        title: "Analytics",
        icon: null,
        href: "/admin",
        badge: "NEW",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN],
      },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      {
        title: "Chat",
        iconPath:"/assets/icons/chat.svg",
        icon: null,
        href: "/dashboard/chat",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.TEACHER],
      },
      {
        title: "Email",
        iconPath:"/assets/icons/email.svg",
        icon: null,
        href: "/dashboard/email",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.TEACHER],
      },
      {
        title: "Invoice",
        iconPath:"/assets/icons/invoice.svg",
        icon: null,
        href: "/dashboard/invoice",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN],
      },
    ],
  },
];

export const teacherMenuItems: MenuSection[] = [
  {
    title: "MENU",
    items: [
      {
        title: "Generate Questions",
        iconPath: "/assets/icons/dashboard.svg",
        href: "/teacher",
        submenu: [{ title: "Overview", href: "/dashboard" }],
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.TEACHER],
      },
      {
        title: "Downloaded Papers",
        iconPath: "/assets/icons/download.svg",
        href: "/teacher/downloaded-papers",
        roles: [UserRole.TEACHER],
      },
      {
        title: "Settings",
        iconPath: "",
        href: "/teacher/settings",
        roles: [UserRole.SUPER_ADMIN],
      },
      {
        title: "Profile",
        iconPath: "",
        href: "/teacher/profile",
        roles: [UserRole.SUPER_ADMIN],
      }
    ],
  },
  {
    title: "SUPPORT",
    items: [
      {
        title: "Chat",
        iconPath:"/assets/icons/chat.svg",
        icon: null,
        href: "/dashboard/chat",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.TEACHER],
      },
      {
        title: "Email",
        iconPath:"/assets/icons/email.svg",
        icon: null,
        href: "/dashboard/email",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.TEACHER],
      },
      {
        title: "Invoice",
        iconPath:"/assets/icons/invoice.svg",
        icon: null,
        href: "/dashboard/invoice",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN],
      },
    ],
  },
];

export const collegeMenuItems: MenuSection[] = [
  {
    title: "MENU",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/college",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.TEACHER],
      },
      {
        title: "Teacher management",
        icon: null, 
        href: "/college/teachers-list",
        roles: [UserRole.SUPER_ADMIN],
      },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      {
        title: "Chat",
        iconPath:"/assets/icons/chat.svg",
        icon: null,
        href: "/dashboard/chat",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.TEACHER],
      },
      {
        title: "Email",
        iconPath:"/assets/icons/email.svg",
        icon: null,
        href: "/dashboard/email",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.TEACHER],
      },
      {
        title: "Invoice",
        iconPath:"/assets/icons/invoice.svg",
        icon: null,
        href: "/dashboard/invoice",
        roles: [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN],
      },
    ],
  },
];