"use client";

import type React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UserRole } from "@/lib/constants/enums"
import ProtectedRoute from "@/components/auth/protected-route"
import ReactQueryProvider from "@/lib/ReactQueryProvider"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
      <ReactQueryProvider>
        <DashboardLayout role={UserRole.SUPER_ADMIN}>
          {children}
        </DashboardLayout>
      </ReactQueryProvider>
    </ProtectedRoute>
  )
}
