'use client';

import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Total Clients',
      value: '0',
      icon: '👥',
      change: '+0%',
      changeType: 'increase',
    },
    {
      name: 'Active Sales',
      value: '0',
      icon: '💼',
      change: '+0%',
      changeType: 'increase',
    },
    {
      name: 'Total Collections',
      value: '৳0',
      icon: '💰',
      change: '+0%',
      changeType: 'increase',
    },
    {
      name: 'Outstanding',
      value: '৳0',
      icon: '📊',
      change: '+0%',
      changeType: 'increase',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Welcome back, {user?.username}! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white dark:bg-gray-800 pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'increase'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No recent activity to display. Start by adding clients and creating sales.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <span className="text-3xl mr-4">👤</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add Client</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create new client</p>
              </div>
            </div>
          </button>

          <button className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <span className="text-3xl mr-4">🏞️</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add Land</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Register RS number</p>
              </div>
            </div>
          </button>

          <button className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <span className="text-3xl mr-4">💼</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">New Sale</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create sale booking</p>
              </div>
            </div>
          </button>

          <button className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <span className="text-3xl mr-4">💰</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Record Payment</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add new receipt</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
              Phase 1: Authentication & User Management
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Phase 1 implementation is complete. You can now:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Login with role-based access (Admin, Account Manager, HOF)</li>
                <li>Secure authentication with JWT tokens</li>
                <li>Access protected routes based on user roles</li>
                <li>Full audit logging for all actions</li>
              </ul>
              <p className="mt-2">
                Next phases will add clients, land inventory, sales, and more features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
