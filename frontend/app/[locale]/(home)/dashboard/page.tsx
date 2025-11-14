'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { clientApi, landApi, salesApi, receiptsApi, expensesApi, employeesApi, employeeCostsApi, UnitType } from '@/lib/api';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { ClientFormModal } from '@/components/clients/client-form-modal';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showRSNumberModal, setShowRSNumberModal] = useState(false);
  const [creatingRSNumber, setCreatingRSNumber] = useState(false);
  const [rsFormData, setRSFormData] = useState({
    rsNumber: '',
    projectName: '',
    location: '',
    totalArea: '',
    unitType: 'Katha' as UnitType,
    description: '',
  });
  const [stats, setStats] = useState({
    totalClients: 0,
    clientsThisMonth: 0,
    totalRSNumbers: 0,
    totalPlots: 0,
    totalLandArea: 0,
    soldArea: 0,
    allocatedArea: 0,
    remainingArea: 0,
    totalSales: 0,
    activeSales: 0,
    totalSalesAmount: 0,
    totalPaidAmount: 0,
    totalDueAmount: 0,
    pendingReceipts: 0,
    totalExpenses: 0,
    pendingExpenses: 0,
    totalEmployees: 0,
    currentMonthPayroll: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Load all stats in parallel
      const [
        clientStats,
        rsNumbersResponse,
        plotsResponse,
        salesStats,
        receiptsResponse,
        expenseStats,
        pendingExpensesResponse,
        employeeStats,
        currentMonthCostsResponse,
      ] = await Promise.all([
        clientApi.getStats().catch((err) => {
          console.error('Failed to load client stats:', err);
          return { totalClients: 0, clientsThisMonth: 0 };
        }),
        landApi.rsNumbers.getAll({ page: 1, limit: 1000 }).catch((err) => {
          console.error('Failed to load RS numbers:', err);
          return { data: [] };
        }),
        landApi.getAllPlots({ page: 1, limit: 1000 }).catch((err) => {
          console.error('Failed to load plots:', err);
          return { data: [] };
        }),
        salesApi.getStats().catch((err) => {
          console.error('Failed to load sales stats:', err);
          return { totalSales: 0, activeSales: 0, totalAmount: 0, totalPaid: 0, totalDue: 0 };
        }),
        receiptsApi.getAll({ page: 1, limit: 1, approvalStatus: 'Pending Accounts' as any }).catch((err) => {
          console.error('Failed to load receipts:', err);
          return { pagination: { total: 0 } };
        }),
        expensesApi.getStats().catch((err) => {
          console.error('Failed to load expense stats:', err);
          return { totalExpenses: 0, totalAmount: 0 };
        }),
        expensesApi.getApprovalQueue().catch((err) => {
          console.error('Failed to load pending expenses:', err);
          return [];
        }),
        employeesApi.getStats().catch((err) => {
          console.error('Failed to load employee stats:', err);
          return { totalEmployees: 0 };
        }),
        employeeCostsApi.getAll({ page: 1, limit: 1000, month: currentMonth, year: currentYear }).catch((err) => {
          console.error('Failed to load employee costs:', err);
          return { data: [] };
        }),
      ]);

      const rsNumbers = rsNumbersResponse.data || [];
      const plots = plotsResponse.data || [];
      const currentMonthCosts = currentMonthCostsResponse.data || [];

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

      // Calculate current month payroll total
      const currentMonthPayroll = currentMonthCosts.reduce((acc, cost) => acc + cost.netPay, 0);

      setStats({
        totalClients: clientStats.totalClients || 0,
        clientsThisMonth: clientStats.clientsThisMonth || 0,
        totalRSNumbers: rsNumbers.length,
        totalPlots: plots.length,
        totalLandArea: landStats.totalArea,
        soldArea: landStats.soldArea,
        allocatedArea: landStats.allocatedArea,
        remainingArea: landStats.remainingArea,
        totalSales: salesStats.totalSales || 0,
        activeSales: salesStats.activeSales || 0,
        totalSalesAmount: salesStats.totalAmount || 0,
        totalPaidAmount: salesStats.totalPaid || 0,
        totalDueAmount: salesStats.totalDue || 0,
        pendingReceipts: receiptsResponse.pagination?.total || 0,
        totalExpenses: expenseStats.totalExpenses || 0,
        pendingExpenses: pendingExpensesResponse.length || 0,
        totalEmployees: employeeStats.totalEmployees || 0,
        currentMonthPayroll,
      });
    } catch (error: unknown) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${(amount / 1000000).toFixed(2)}M`;
  };

  const handleClientSuccess = () => {
    loadStats();
  };

  const handleOpenRSNumberModal = () => {
    setShowRSNumberModal(true);
    setRSFormData({
      rsNumber: '',
      projectName: '',
      location: '',
      totalArea: '',
      unitType: 'Katha',
      description: '',
    });
  };

  const handleCloseRSNumberModal = () => {
    setShowRSNumberModal(false);
    setRSFormData({
      rsNumber: '',
      projectName: '',
      location: '',
      totalArea: '',
      unitType: 'Katha',
      description: '',
    });
  };

  const handleRSNumberChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Auto-uppercase RS Number
    if (name === 'rsNumber') {
      setRSFormData({
        ...rsFormData,
        [name]: value.toUpperCase(),
      });
    } else {
      setRSFormData({
        ...rsFormData,
        [name]: value,
      });
    }
  };

  const handleRSNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingRSNumber(true);

    try {
      const data: any = {
        rsNumber: rsFormData.rsNumber.trim(),
        projectName: rsFormData.projectName.trim(),
        location: rsFormData.location.trim(),
        totalArea: parseFloat(rsFormData.totalArea),
        unitType: rsFormData.unitType,
      };

      // Add optional description
      if (rsFormData.description.trim()) {
        data.description = rsFormData.description.trim();
      }

      await landApi.rsNumbers.create(data);
      showSuccess('RS Number created successfully!');
      handleCloseRSNumberModal();
      loadStats(); // Refresh dashboard stats
    } catch (error) {
      console.error('Failed to create RS Number:', error);
      showError(getErrorMessage(error));
    } finally {
      setCreatingRSNumber(false);
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
      name: 'Active Sales',
      value: loading ? '...' : stats.activeSales.toString(),
      icon: '💼',
      subtext: loading ? '' : `${stats.totalSales} total sales`,
      color: 'bg-green-500',
    },
    {
      name: 'Total Sales Value',
      value: loading ? '...' : formatCurrency(stats.totalSalesAmount),
      icon: '💰',
      subtext: loading ? '' : 'Total revenue',
      color: 'bg-purple-500',
    },
    {
      name: 'Amount Due',
      value: loading ? '...' : formatCurrency(stats.totalDueAmount),
      icon: '📊',
      subtext: loading ? '' : `Paid: ${formatCurrency(stats.totalPaidAmount)}`,
      color: 'bg-orange-500',
    },
    {
      name: 'Plot Inventory',
      value: loading ? '...' : stats.totalRSNumbers.toString(),
      icon: '🏞️',
      subtext: loading ? '' : `${stats.totalPlots} plots`,
      color: 'bg-indigo-500',
    },
    {
      name: 'Total Employees',
      value: loading ? '...' : stats.totalEmployees.toString(),
      icon: '👨‍💼',
      subtext: loading ? '' : 'Active employees',
      color: 'bg-teal-500',
    },
    {
      name: 'Total Expenses',
      value: loading ? '...' : stats.totalExpenses.toString(),
      icon: '💳',
      subtext: loading ? '' : 'Recorded expenses',
      color: 'bg-red-500',
    },
    {
      name: 'Pending Approvals',
      value: loading ? '...' : (stats.pendingReceipts + stats.pendingExpenses).toString(),
      icon: '⏳',
      subtext: loading ? '' : `${stats.pendingReceipts} receipts, ${stats.pendingExpenses} expenses`,
      color: 'bg-yellow-500',
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
          <button
            onClick={() => setShowClientModal(true)}
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">👤</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add Client</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create new client</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleOpenRSNumberModal}
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">🏞️</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add Plot</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Register RS number</p>
              </div>
            </div>
          </button>

          <Link
            href="/sales/new"
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">💼</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">New Sale</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create sale booking</p>
              </div>
            </div>
          </Link>

          <Link
            href="/receipts/new"
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">💰</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Record Payment</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add new receipt</p>
              </div>
            </div>
          </Link>

          <Link
            href="/employees/new"
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">👨‍💼</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add Employee</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Register new employee</p>
              </div>
            </div>
          </Link>

          <Link
            href="/expenses/new"
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">💳</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add Expense</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Record new expense</p>
              </div>
            </div>
          </Link>

          <Link
            href="/payroll"
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">📊</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">View Payroll</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Monthly summary</p>
              </div>
            </div>
          </Link>

          <Link
            href="/expenses/approval-queue"
            className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">⏳</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Approvals</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending expenses</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Add Client Modal */}
      <ClientFormModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSuccess={handleClientSuccess}
      />

      {/* Create RS Number Modal */}
      <Modal isOpen={showRSNumberModal} onClose={handleCloseRSNumberModal} title="Create RS Number" size="lg">
        <form onSubmit={handleRSNumberSubmit}>
          <ModalContent>
            <div className="space-y-4">
              {/* RS Number */}
              <div>
                <label htmlFor="rsNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  RS Number *
                </label>
                <input
                  type="text"
                  id="rsNumber"
                  name="rsNumber"
                  value={rsFormData.rsNumber}
                  onChange={handleRSNumberChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="e.g., RS-1234"
                />
              </div>

              {/* Project Name */}
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  value={rsFormData.projectName}
                  onChange={handleRSNumberChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Enter project name"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={rsFormData.location}
                  onChange={handleRSNumberChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Enter location"
                />
              </div>

              {/* Total Area and Unit Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="totalArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Area *
                  </label>
                  <input
                    type="number"
                    id="totalArea"
                    name="totalArea"
                    value={rsFormData.totalArea}
                    onChange={handleRSNumberChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="unitType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit Type *
                  </label>
                  <select
                    id="unitType"
                    name="unitType"
                    value={rsFormData.unitType}
                    onChange={handleRSNumberChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="Katha">Katha</option>
                    <option value="Decimal">Decimal</option>
                    <option value="Acre">Acre</option>
                    <option value="Bigha">Bigha</option>
                    <option value="Square Feet">Square Feet</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={rsFormData.description}
                  onChange={handleRSNumberChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Enter description (optional)"
                />
              </div>
            </div>
          </ModalContent>

          <ModalFooter>
            <button
              type="button"
              onClick={handleCloseRSNumberModal}
              disabled={creatingRSNumber}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingRSNumber}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {creatingRSNumber ? 'Creating...' : 'Create RS Number'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
