import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, userRole } = useAuthStore();

  if (isAuthenticated && userRole) {
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return <>{children}</>;
}

export default PublicOnlyRoute;
