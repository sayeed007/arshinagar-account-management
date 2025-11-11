'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { TopNav } from '@/components/layout/top-nav';
import { SideNav } from '@/components/layout/side-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SideNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="lg:pl-72">
          <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          {/* Page content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
