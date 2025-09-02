"use client";

import type React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import ReactQueryProvider from "@/lib/ReactQueryProvider"
import { UserRole } from "@/lib/constants/enums"
import ProtectedRoute from "@/components/auth/protected-route"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
      <ReactQueryProvider>
        <DashboardLayout role={UserRole.TEACHER}>
          {children}
        </DashboardLayout>
      </ReactQueryProvider>
    </ProtectedRoute>
  )
}

