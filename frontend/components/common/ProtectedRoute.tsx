'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/api';

/**
 * Protected Route Props
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole | UserRole[];
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Wrapper component that checks authentication and authorization
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check if user has required roles
      if (requiredRoles && !hasRole(requiredRoles)) {
        // User doesn't have required role, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, requiredRoles, hasRole, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Check authorization
  if (requiredRoles && !hasRole(requiredRoles)) {
    return null; // Will redirect via useEffect
  }

  // User is authenticated and authorized
  return <>{children}</>;
}

/**
 * Higher Order Component for protecting pages
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: UserRole | UserRole[]
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredRoles={requiredRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Role Gate Component
 * Shows content only if user has required role
 */
interface RoleGateProps {
  children: React.ReactNode;
  requiredRoles: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, requiredRoles, fallback }: RoleGateProps) {
  const { hasRole } = useAuth();

  if (!hasRole(requiredRoles)) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}

/**
 * Admin Only Component
 */
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGate requiredRoles={UserRole.ADMIN} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * HOF or Admin Component
 */
export function HOFOrAdmin({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGate requiredRoles={[UserRole.HOF, UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
