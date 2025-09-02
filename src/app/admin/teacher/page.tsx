"use client";

import { UserRole } from '@/lib/constants/enums';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

export default function TeacherDashboard() {
  return (
    <RoleProtectedRoute allowedRoles={[UserRole.TEACHER]}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
        {/* Teacher specific content */}
      </div>
    </RoleProtectedRoute>
  );
}