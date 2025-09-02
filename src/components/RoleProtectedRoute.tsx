"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { UserRole } from '@/lib/constants/enums';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function RoleProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: RoleProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait until auth state is determined
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push(redirectTo);
      } else if (userRole && allowedRoles.includes(userRole as UserRole)) {
        // User has allowed role
        setIsAuthorized(true);
      } else {
        // User doesn't have allowed role, redirect to default dashboard
        router.push('/admin');
      }
    }
  }, [user, userRole, loading, router, redirectTo, allowedRoles]);

  // Show nothing while loading or checking authorization
  if (loading || !isAuthorized) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  // Render children only if authorized
  return <>{children}</>;
}