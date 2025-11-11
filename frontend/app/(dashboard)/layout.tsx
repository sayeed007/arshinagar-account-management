'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/api';
import { ProtectedRoute, AdminOnly, HOFOrAdmin } from '@/components/common/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: null },
    { name: 'Clients', href: '/dashboard/clients', icon: '👥', roles: null },
    { name: 'Land Inventory', href: '/dashboard/land', icon: '🏞️', roles: null },
    { name: 'Sales', href: '/dashboard/sales', icon: '💼', roles: null },
    { name: 'Collections', href: '/dashboard/collections', icon: '💰', roles: null },
    { name: 'Expenses', href: '/dashboard/expenses', icon: '💳', roles: null },
    { name: 'Employees', href: '/dashboard/employees', icon: '👨‍💼', roles: null },
    { name: 'Payroll', href: '/dashboard/payroll', icon: '💵', roles: [UserRole.ACCOUNT_MANAGER, UserRole.HOF, UserRole.ADMIN] },
    { name: 'Cancellations', href: '/dashboard/cancellations', icon: '❌', roles: null },
    { name: 'Refunds', href: '/dashboard/refunds', icon: '↩️', roles: null },
    { name: 'Banking', href: '/dashboard/banking', icon: '🏦', roles: [UserRole.HOF, UserRole.ADMIN] },
    { name: 'Approvals', href: '/dashboard/approvals', icon: '✅', roles: [UserRole.HOF, UserRole.ADMIN] },
    { name: 'Reports', href: '/dashboard/reports', icon: '📈', roles: null },
    { name: 'SMS', href: '/dashboard/sms', icon: '📱', roles: [UserRole.ADMIN] },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️', roles: [UserRole.ADMIN] },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const canAccessRoute = (roles: UserRole[] | null) => {
    if (!roles) return true;
    if (!user) return false;
    return roles.includes(user.role);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
              <h1 className="text-xl font-bold text-white">Arshinagar</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {navigation.map((item) => {
                if (!canAccessRoute(item.roles)) return null;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User info */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between h-16 px-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-500 dark:text-gray-400"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome, {user?.username}
                </span>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
