'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { expensesApi, Expense, ExpenseCategory, User, ExpenseStatus } from '@/lib/api';

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadExpense();
    }
  }, [params.id]);

  const loadExpense = async () => {
    try {
      setLoading(true);
      const data = await expensesApi.getById(params.id as string);
      setExpense(data);
    } catch (error: any) {
      console.error('Failed to load expense:', error);
      alert(error.response?.data?.error?.message || 'Failed to load expense');
      router.push('/expenses');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading expense...</p>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Expense not found</p>
        <Link
          href="/expenses"
          className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
        >
          Back to Expenses
        </Link>
      </div>
    );
  }

  const category = expense.categoryId as ExpenseCategory;
  const createdBy = expense.createdBy as User;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/expenses" className="hover:text-indigo-600">
            Expenses
          </Link>
          <span>/</span>
          <span>{expense.expenseNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {expense.expenseNumber}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Expense Date: {new Date(expense.expenseDate).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(
              expense.status
            )}`}
          >
            {expense.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expense Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Expense Details
            </h2>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{category.name}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</dt>
                <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(expense.amount)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Payment Method
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {expense.paymentMethod}
                </dd>
              </div>

              {expense.vendor && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendor</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{expense.vendor}</dd>
                </div>
              )}

              {expense.instrumentDetails && (
                <>
                  {expense.instrumentDetails.bankName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Bank Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {expense.instrumentDetails.bankName}
                      </dd>
                    </div>
                  )}
                  {expense.instrumentDetails.chequeNumber && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Cheque Number
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {expense.instrumentDetails.chequeNumber}
                      </dd>
                    </div>
                  )}
                </>
              )}

              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {expense.description}
                </dd>
              </div>

              {expense.notes && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {expense.notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Approval History */}
          {expense.approvalHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Approval History
              </h2>
              <div className="space-y-4">
                {expense.approvalHistory.map((entry, index) => {
                  const approver = entry.approvedBy as User;
                  return (
                    <div key={index} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {approver.name || approver.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {approver.role}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            entry.action === 'Approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {entry.action}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(entry.approvedAt).toLocaleString()}
                      </p>
                      {entry.remarks && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {entry.remarks}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Information
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Created By:</span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {createdBy.name || createdBy.email}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(expense.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(expense.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/expenses"
                className="block w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Back to Expenses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
