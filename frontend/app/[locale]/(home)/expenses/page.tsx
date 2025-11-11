'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { expensesApi, Expense, ExpenseStatus, ExpenseCategory } from '@/lib/api';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | ''>('');
  const limit = 10;

  useEffect(() => {
    loadExpenses();
  }, [page, statusFilter]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit, isActive: true };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await expensesApi.getAll(params);
      setExpenses(response.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 0);
    } catch (error: any) {
      console.error('Failed to load expenses:', error);
      alert(error.response?.data?.error?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case ExpenseStatus.PENDING_ACCOUNTS:
      case ExpenseStatus.PENDING_HOF:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case ExpenseStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case ExpenseStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses Management</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage company expenses and approvals
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ExpenseStatus | '');
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All</option>
              <option value={ExpenseStatus.DRAFT}>Draft</option>
              <option value={ExpenseStatus.PENDING_ACCOUNTS}>Pending Accounts</option>
              <option value={ExpenseStatus.PENDING_HOF}>Pending HOF</option>
              <option value={ExpenseStatus.APPROVED}>Approved</option>
              <option value={ExpenseStatus.REJECTED}>Rejected</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Link
              href="/expenses/approval-queue"
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm whitespace-nowrap"
            >
              📋 Approval Queue
            </Link>
            <Link
              href="/expenses/new"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm whitespace-nowrap"
            >
              + New Expense
            </Link>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No expenses found</p>
            <Link
              href="/expenses/new"
              className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
            >
              Create your first expense
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Expense #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Vendor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {expenses.map((expense) => {
                    const category = expense.categoryId as ExpenseCategory;
                    return (
                      <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {expense.expenseNumber}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {category?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(expense.amount)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {expense.vendor || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {expense.paymentMethod}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                              expense.status
                            )}`}
                          >
                            {expense.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(expense.expenseDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Link
                            href={`/expenses/${expense._id}`}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page {page} of {totalPages} ({total} total expenses)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
