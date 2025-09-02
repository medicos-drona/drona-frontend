import { LucideIcon } from "lucide-react";
import { UserRole } from "@/lib/constants/enums";

// Interface for submenu items
interface SubMenuItem {
  title: string;
  href: string;
}

// Interface for main menu items
interface MenuItem {
  title: string;
  icon?: LucideIcon | null;
  iconPath?: string;
  href: string;
  submenu?: SubMenuItem[];
  roles: UserRole[];
  badge?: string;
}

// Interface for menu sections
interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Export the types to use them in other files
export type { MenuItem, MenuSection, SubMenuItem };