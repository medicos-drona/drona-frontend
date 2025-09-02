"use client";

import type React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import ReactQueryProvider from "@/lib/ReactQueryProvider"
import { UserRole } from "@/lib/constants/enums"
import ProtectedRoute from "@/components/auth/protected-route"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.COLLEGE_ADMIN]}>
      <ReactQueryProvider>
        <DashboardLayout role={UserRole.COLLEGE_ADMIN}>
          {children}
        </DashboardLayout>
      </ReactQueryProvider>
    </ProtectedRoute>
  )
}

