"use client";

import { UserRole } from '@/lib/constants/enums';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

export default function SuperAdminDashboard() {
  return (
    <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
        {/* Super Admin specific content */}
      </div>
    </RoleProtectedRoute>
  );
}