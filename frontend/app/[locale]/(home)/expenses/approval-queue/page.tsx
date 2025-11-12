'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { expensesApi, Expense, ExpenseCategory } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';

export default function ExpenseApprovalQueuePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await expensesApi.getApprovalQueue();
      setExpenses(data);
    } catch (error: any) {
      console.error('Failed to load approval queue:', error);
      showError(error.response?.data?.error?.message || 'Failed to load approval queue');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const remarks = prompt('Approval remarks (optional):');
    if (remarks === null) return; // User cancelled

    try {
      await expensesApi.approve(id, remarks || undefined);
      showSuccess('Expense approved successfully');
      loadQueue();
    } catch (error: any) {
      console.error('Failed to approve expense:', error);
      showError(error.response?.data?.error?.message || 'Failed to approve expense');
    }
  };

  const handleReject = async (id: string) => {
    const remarks = prompt('Rejection reason (required):');
    if (!remarks || remarks.trim() === '') {
      showError('Rejection reason is required');
      return;
    }

    try {
      await expensesApi.reject(id, remarks);
      showSuccess('Expense rejected');
      loadQueue();
    } catch (error: any) {
      console.error('Failed to reject expense:', error);
      showError(error.response?.data?.error?.message || 'Failed to reject expense');
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Expense Approval Queue
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Expenses pending your approval
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No expenses pending approval</p>
            <Link
              href="/expenses"
              className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
            >
              View all expenses
            </Link>
          </div>
        ) : (
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
                          {category?.name}
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
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleApprove(expense._id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 font-semibold"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(expense._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                        >
                          ✗ Reject
                        </button>
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
        )}
      </div>
    </div>
  );
}
