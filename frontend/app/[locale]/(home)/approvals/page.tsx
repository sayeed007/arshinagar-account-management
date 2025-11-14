'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { receiptsApi, expensesApi, Receipt, Expense, Client, Sale } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';

type ApprovalItem = {
  id: string;
  type: 'receipt' | 'expense';
  number: string;
  amount: number;
  date: string;
  status: string;
  details: string;
  original: Receipt | Expense;
};

export default function ApprovalsPage() {
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'receipts' | 'expenses'>('all');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);

      // Load receipts and expenses in parallel
      const [receipts, expenses] = await Promise.all([
        receiptsApi.getApprovalQueue().catch(() => [] as Receipt[]),
        expensesApi.getApprovalQueue().catch(() => [] as Expense[]),
      ]);

      // Transform to unified format
      const receiptItems: ApprovalItem[] = receipts.map((r) => {
        const client = r.clientId as Client;
        const sale = r.saleId as Sale;
        return {
          id: r._id,
          type: 'receipt' as const,
          number: r.receiptNumber,
          amount: r.amount,
          date: r.date,
          status: r.approvalStatus,
          details: `${client?.name || 'N/A'} - ${sale?.saleNumber || 'N/A'}`,
          original: r,
        };
      });

      const expenseItems: ApprovalItem[] = expenses.map((e) => ({
        id: e._id,
        type: 'expense' as const,
        number: e.expenseNumber,
        amount: e.amount,
        date: e.date,
        status: e.approvalStatus,
        details: `${e.vendor} - ${e.description}`,
        original: e,
      }));

      // Combine and sort by date (newest first)
      const allItems = [...receiptItems, ...expenseItems].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setApprovalItems(allItems);
    } catch (error: unknown) {
      console.error('Failed to load approvals:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: ApprovalItem) => {
    const remarks = prompt('Approval remarks (optional):');
    if (remarks === null) return; // User cancelled

    try {
      if (item.type === 'receipt') {
        await receiptsApi.approve(item.id, remarks || undefined);
        showSuccess('Receipt approved successfully');
      } else {
        await expensesApi.approve(item.id, remarks || undefined);
        showSuccess('Expense approved successfully');
      }
      loadApprovals();
    } catch (error: unknown) {
      console.error(`Failed to approve ${item.type}:`, error);
      showError(getErrorMessage(error));
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    const remarks = prompt('Rejection reason (required):');
    if (!remarks || remarks.trim() === '') {
      showError('Rejection reason is required');
      return;
    }

    try {
      if (item.type === 'receipt') {
        await receiptsApi.reject(item.id, remarks);
        showSuccess('Receipt rejected');
      } else {
        await expensesApi.reject(item.id, remarks);
        showSuccess('Expense rejected');
      }
      loadApprovals();
    } catch (error: unknown) {
      console.error(`Failed to reject ${item.type}:`, error);
      showError(getErrorMessage(error));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredItems = approvalItems.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'receipts') return item.type === 'receipt';
    if (activeTab === 'expenses') return item.type === 'expense';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      PendingAccountsApproval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      PendingHOFApproval: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    const color = statusColors[status] || statusColors.Draft;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
        {status.replace(/([A-Z])/g, ' $1').trim()}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approval Queue</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          All items pending your approval
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            All ({approvalItems.length})
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'receipts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Receipts ({approvalItems.filter((i) => i.type === 'receipt').length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'expenses'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Expenses ({approvalItems.filter((i) => i.type === 'expense').length})
          </button>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No items pending approval</p>
            <div className="mt-4 space-x-4">
              <Link
                href="/receipts"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                View all receipts
              </Link>
              <Link
                href="/expenses"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                View all expenses
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Amount
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
                {filteredItems.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                          item.type === 'receipt'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}
                      >
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.number}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {item.details}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(item.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleApprove(item)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 font-semibold"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReject(item)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                      >
                        ✗ Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Pending</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {approvalItems.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Receipts</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {approvalItems.filter((i) => i.type === 'receipt').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Expenses</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {approvalItems.filter((i) => i.type === 'expense').length}
          </div>
        </div>
      </div>
    </div>
  );
}
