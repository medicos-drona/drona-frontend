"use client"

import { useAuth } from "./AuthContext"
import { UserRole } from "./constants/enums"

// Function to check if a user has a specific permission
export function hasPermission(userRole: UserRole | null, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

// Re-export the useAuth hook for backward compatibility
export function useUserRole() {
  const { userRole } = useAuth();
  return userRole;
}

// This function is kept for backward compatibility
// It now uses the setUserRole function from AuthContext
export function setUserRole(role: UserRole): void {
  const { setUserRole } = useAuth();
  setUserRole(role);
}
