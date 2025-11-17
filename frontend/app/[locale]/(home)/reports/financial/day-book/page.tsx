'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { reportsApi, DayBookReport } from '@/lib/api';
import { showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function DayBookReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [report, setReport] = useState<DayBookReport | null>(null);
  const [loading, setLoading] = useState(true);

  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  useEffect(() => {
    if (startDate && endDate) {
      loadReport();
    } else {
      showError('Start date and end date are required');
      router.push('/reports');
    }
  }, [startDate, endDate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getDayBook({ startDate, endDate });
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
      showError(getErrorMessage(error));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const downloadCSV = () => {
    if (!report) return;

    const rows = [
      ['Date', 'Particulars', 'Receipt', 'Payment', 'Balance'],
      ...report.transactions.map((t) => [
        formatDate(t.date),
        t.particulars,
        t.type === 'Receipt' ? t.amount.toString() : '',
        t.type === 'Payment' ? t.amount.toString() : '',
        t.balance.toString(),
      ]),
      [],
      ['', 'Total Receipts:', report.summary.totalReceipts.toString(), '', ''],
      ['', 'Total Payments:', '', report.summary.totalPayments.toString(), ''],
      ['', 'Balance:', '', '', report.summary.balance.toString()],
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `day-book-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="no-print">
        <Breadcrumb
          items={[
            { label: 'Reports', href: '/reports' },
            { label: 'Day Book' },
          ]}
          title="Day Book Report"
          subtitle={`${formatDate(report.period.startDate)} to ${formatDate(report.period.endDate)}`}
        />

        {/* Actions */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            📥 Download CSV
          </button>
          <button
            onClick={printReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 no-print">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Receipts</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
            {formatCurrency(report.summary.totalReceipts)}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Payments</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
            {formatCurrency(report.summary.totalPayments)}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Net Balance</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {formatCurrency(report.summary.balance)}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Particulars
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Voucher #
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Receipt
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Payment
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {report.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No transactions found for this period
                  </td>
                </tr>
              ) : (
                report.transactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      <div>{transaction.particulars}</div>
                      {transaction.category && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.category}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {transaction.receiptNumber || transaction.paymentNumber || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {transaction.type === 'Receipt' && (
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(transaction.amount)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {transaction.type === 'Payment' && (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(transaction.amount)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-gray-900 dark:text-white">
                      {formatCurrency(transaction.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700 font-semibold">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  Total
                </td>
                <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                  {formatCurrency(report.summary.totalReceipts)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                  {formatCurrency(report.summary.totalPayments)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                  {formatCurrency(report.summary.balance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
