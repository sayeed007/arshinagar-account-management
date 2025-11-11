'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { receiptsApi, Receipt, Client, Sale } from '@/lib/api';

export default function ApprovalQueuePage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await receiptsApi.getApprovalQueue();
      setReceipts(data);
    } catch (error: any) {
      console.error('Failed to load approval queue:', error);
      alert(error.response?.data?.error?.message || 'Failed to load approval queue');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const remarks = prompt('Approval remarks (optional):');
    if (remarks === null) return; // User cancelled

    try {
      await receiptsApi.approve(id, remarks || undefined);
      alert('Receipt approved successfully');
      loadQueue();
    } catch (error: any) {
      console.error('Failed to approve receipt:', error);
      alert(error.response?.data?.error?.message || 'Failed to approve receipt');
    }
  };

  const handleReject = async (id: string) => {
    const remarks = prompt('Rejection reason (required):');
    if (!remarks || remarks.trim() === '') {
      alert('Rejection reason is required');
      return;
    }

    try {
      await receiptsApi.reject(id, remarks);
      alert('Receipt rejected');
      loadQueue();
    } catch (error: any) {
      console.error('Failed to reject receipt:', error);
      alert(error.response?.data?.error?.message || 'Failed to reject receipt');
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approval Queue</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Receipts pending your approval
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No receipts pending approval</p>
            <Link
              href="/receipts"
              className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
            >
              View all receipts
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Receipt #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Sale
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Amount
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
                {receipts.map((receipt) => {
                  const client = receipt.clientId as Client;
                  const sale = receipt.saleId as Sale;
                  return (
                    <tr key={receipt._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {receipt.receiptNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{client?.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/sales/${sale._id}`}
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          {sale?.saleNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(receipt.amount)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {receipt.method}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {receipt.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleApprove(receipt._id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 font-semibold"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(receipt._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                        >
                          ✗ Reject
                        </button>
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
