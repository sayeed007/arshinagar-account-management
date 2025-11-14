'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { receiptsApi, Receipt, ReceiptApprovalStatus, ReceiptType, PaymentMethod, Client } from '@/lib/api';
import { ListQueryParams, getErrorMessage } from '@/lib/types';
import { showSuccess, showError } from '@/lib/toast';

export default function CollectionsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ReceiptApprovalStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<ReceiptType | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  useEffect(() => {
    loadReceipts();
  }, [page, statusFilter, typeFilter]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit, isActive: true };

      if (statusFilter) {
        params.approvalStatus = statusFilter;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await receiptsApi.getAll(params);
      setReceipts(response.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 0);
    } catch (error) {
      console.error('Failed to load receipts:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadReceipts();
  };

  const getStatusBadgeClass = (status: ReceiptApprovalStatus) => {
    switch (status) {
      case ReceiptApprovalStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case ReceiptApprovalStatus.PENDING_ACCOUNTS:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case ReceiptApprovalStatus.PENDING_HOF:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case ReceiptApprovalStatus.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case ReceiptApprovalStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getReceiptTypeBadgeClass = (type: ReceiptType) => {
    switch (type) {
      case ReceiptType.BOOKING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case ReceiptType.INSTALLMENT:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case ReceiptType.REGISTRATION:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case ReceiptType.HANDOVER:
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collections (Money In)</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage all payment receipts and collections
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by receipt number..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ReceiptApprovalStatus | '');
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Status</option>
            <option value={ReceiptApprovalStatus.DRAFT}>Draft</option>
            <option value={ReceiptApprovalStatus.PENDING_ACCOUNTS}>Pending Accounts</option>
            <option value={ReceiptApprovalStatus.PENDING_HOF}>Pending HOF</option>
            <option value={ReceiptApprovalStatus.APPROVED}>Approved</option>
            <option value={ReceiptApprovalStatus.REJECTED}>Rejected</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as ReceiptType | '');
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Types</option>
            <option value={ReceiptType.BOOKING}>Booking</option>
            <option value={ReceiptType.INSTALLMENT}>Installment</option>
            <option value={ReceiptType.REGISTRATION}>Registration</option>
            <option value={ReceiptType.HANDOVER}>Handover</option>
            <option value={ReceiptType.OTHER}>Other</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Receipts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4">
          <p className="text-sm text-green-700 dark:text-green-300">Approved</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {receipts.filter(r => r.approvalStatus === ReceiptApprovalStatus.APPROVED).length}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {receipts.filter(r =>
              r.approvalStatus === ReceiptApprovalStatus.PENDING_ACCOUNTS ||
              r.approvalStatus === ReceiptApprovalStatus.PENDING_HOF
            ).length}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">Total Amount</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(receipts.reduce((sum, r) => sum + Number(r.amount), 0))}
          </p>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Receipt #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">Loading receipts...</span>
                    </div>
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No receipts found
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => (
                  <tr
                    key={receipt._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {receipt.receiptNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {typeof receipt.clientId === 'object' ? receipt.clientId.name : receipt.clientId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReceiptTypeBadgeClass(receipt.receiptType)}`}>
                        {receipt.receiptType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {receipt.method}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(Number(receipt.amount))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(receipt.receiptDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(receipt.approvalStatus)}`}>
                        {receipt.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/collections/${receipt._id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing page {page} of {totalPages} ({total} total receipts)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
