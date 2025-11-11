'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, User, LoginRequest, UserRole } from './api';

/**
 * Auth Context Types
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

/**
 * Create Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Helper to get locale from pathname
 */
function getLocaleFromPathname(pathname: string): string {
  const localeMatch = pathname.match(/^\/(bn|en)/);
  return localeMatch ? localeMatch[1] : '';
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Check if user has required role(s)
   */
  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;

      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user]
  );

  /**
   * Load user from token on mount
   */
  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Fetch user profile
      const userData = await authApi.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login function
   */
  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Set user
      setUser(response.user);

      // Get current locale and redirect to dashboard with locale
      const locale = getLocaleFromPathname(pathname);
      const dashboardPath = locale ? `/${locale}/dashboard` : '/dashboard';
      router.push(dashboardPath);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      // Call logout endpoint
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear tokens and user regardless of API call result
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);

      // Get current locale and redirect to login with locale
      const locale = getLocaleFromPathname(pathname);
      const loginPath = locale ? `/${locale}/login` : '/login';
      router.push(loginPath);
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    try {
      const userData = await authApi.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  /**
   * Load user on mount
   */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Hook for role-based access
 */
export function useRequireAuth(requiredRoles?: UserRole | UserRole[]) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      const locale = getLocaleFromPathname(pathname);

      if (!isAuthenticated) {
        // Not authenticated, redirect to login with locale
        const loginPath = locale ? `/${locale}/login` : '/login';
        router.push(loginPath);
      } else if (requiredRoles && !hasRole(requiredRoles)) {
        // Authenticated but doesn't have required role, redirect to dashboard
        const dashboardPath = locale ? `/${locale}/dashboard` : '/dashboard';
        router.push(dashboardPath);
      }
    }
  }, [isLoading, isAuthenticated, requiredRoles, hasRole, router, pathname]);

  return { user, isLoading, isAuthenticated };
}
