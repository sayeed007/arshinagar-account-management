'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { clientApi, landApi } from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    clientsThisMonth: 0,
    totalRSNumbers: 0,
    totalPlots: 0,
    totalLandArea: 0,
    soldArea: 0,
    allocatedArea: 0,
    remainingArea: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load client stats
      const clientStats = await clientApi.getStats();

      // Load RS Numbers
      const rsNumbersResponse = await landApi.rsNumbers.getAll({ page: 1, limit: 1000 });
      const rsNumbers = rsNumbersResponse.data || [];

      // Load plots
      const plotsResponse = await landApi.plots.getAll({ page: 1, limit: 1000 });
      const plots = plotsResponse.data || [];

      // Calculate land area stats
      const landStats = rsNumbers.reduce(
        (acc, rs) => ({
          totalArea: acc.totalArea + rs.totalArea,
          soldArea: acc.soldArea + rs.soldArea,
          allocatedArea: acc.allocatedArea + rs.allocatedArea,
          remainingArea: acc.remainingArea + rs.remainingArea,
        }),
        { totalArea: 0, soldArea: 0, allocatedArea: 0, remainingArea: 0 }
      );

      setStats({
        totalClients: clientStats.totalClients || 0,
        clientsThisMonth: clientStats.clientsThisMonth || 0,
        totalRSNumbers: rsNumbers.length,
        totalPlots: plots.length,
        totalLandArea: landStats.totalArea,
        soldArea: landStats.soldArea,
        allocatedArea: landStats.allocatedArea,
        remainingArea: landStats.remainingArea,
      });
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Clients',
      value: loading ? '...' : stats.totalClients.toString(),
      icon: '👥',
      subtext: loading ? '' : `+${stats.clientsThisMonth} this month`,
      color: 'bg-blue-500',
    },
    {
      name: 'RS Numbers',
      value: loading ? '...' : stats.totalRSNumbers.toString(),
      icon: '🏞️',
      subtext: loading ? '' : `${stats.totalPlots} plots`,
      color: 'bg-green-500',
    },
    {
      name: 'Total Land',
      value: loading ? '...' : `${stats.totalLandArea.toFixed(1)}`,
      icon: '📐',
      subtext: loading ? '' : 'Total area (all units)',
      color: 'bg-purple-500',
    },
    {
      name: 'Remaining Area',
      value: loading ? '...' : `${stats.remainingArea.toFixed(1)}`,
      icon: '✅',
      subtext: loading ? '' : 'Available for sale',
      color: 'bg-indigo-500',
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
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white dark:bg-gray-800 pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className={`absolute ${stat.color} rounded-md p-3`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex flex-col sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              {stat.subtext && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.subtext}
                </p>
              )}
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
          <Link
            href="/dashboard/clients/new"
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">👤</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add Client</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create new client</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/land/rs-numbers/new"
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">🏞️</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add Land</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Register RS number</p>
              </div>
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg opacity-50 cursor-not-allowed">
            <div className="flex items-center">
              <span className="text-3xl mr-4">💼</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">New Sale</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Coming in Phase 3</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg opacity-50 cursor-not-allowed">
            <div className="flex items-center">
              <span className="text-3xl mr-4">💰</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Record Payment</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Coming in Phase 3</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
              Phase 2: Master Data Management Complete
            </h3>
            <div className="mt-2 text-sm text-green-700 dark:text-green-300">
              <p>
                Phase 1 & Phase 2 implementation complete. Active features:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Role-based authentication & user management</li>
                <li>Client management with search and pagination</li>
                <li>RS Number (land parcel) management</li>
                <li>Plot management with automatic area calculation</li>
                <li>Intelligent land inventory tracking</li>
                <li>Comprehensive audit logging</li>
              </ul>
              <p className="mt-2">
                Phase 3 will add sales management, payment tracking, and financial reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
