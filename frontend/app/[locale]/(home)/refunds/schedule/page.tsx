'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { cancellationsApi, refundsApi, Cancellation, Sale, Client } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function RefundSchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cancellationId = searchParams.get('cancellationId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellation, setCancellation] = useState<Cancellation | null>(null);

  const [formData, setFormData] = useState({
    numberOfInstallments: 1,
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (cancellationId) {
      loadCancellation();
    } else {
      setLoading(false);
    }
  }, [cancellationId]);

  const loadCancellation = async () => {
    try {
      setLoading(true);
      const response = await cancellationsApi.getById(cancellationId!);
      setCancellation(response);
    } catch (error: unknown) {
      console.error('Failed to load cancellation:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cancellationId) {
      showError('Cancellation ID is required');
      return;
    }

    if (formData.numberOfInstallments < 1 || formData.numberOfInstallments > 36) {
      showError('Number of installments must be between 1 and 36');
      return;
    }

    if (!formData.startDate) {
      showError('Start date is required');
      return;
    }

    try {
      setSubmitting(true);
      await refundsApi.createSchedule({
        cancellationId,
        numberOfInstallments: formData.numberOfInstallments,
        startDate: formData.startDate,
      });

      showSuccess('Refund schedule created successfully');
      router.push(`/cancellations/${cancellationId}`);
    } catch (error: unknown) {
      console.error('Failed to create refund schedule:', error);
      showError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateInstallmentSchedule = () => {
    if (!cancellation || formData.numberOfInstallments < 1) return [];

    const installmentAmount = Math.round(
      cancellation.refundableAmount / formData.numberOfInstallments
    );
    const remainder =
      cancellation.refundableAmount - installmentAmount * formData.numberOfInstallments;

    const schedule = [];
    const startDate = new Date(formData.startDate);

    for (let i = 0; i < formData.numberOfInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const amount =
        i === formData.numberOfInstallments - 1 ? installmentAmount + remainder : installmentAmount;

      schedule.push({
        installmentNumber: i + 1,
        dueDate: dueDate.toISOString().split('T')[0],
        amount,
      });
    }

    return schedule;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading cancellation details...</p>
        </div>
      </div>
    );
  }

  if (!cancellationId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No cancellation selected. Please select a cancellation to create refund schedule.
        </p>
        <Link
          href="/cancellations"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
        >
          Go to Cancellations
        </Link>
      </div>
    );
  }

  if (!cancellation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Cancellation not found</p>
        <Link
          href="/cancellations"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
        >
          Go to Cancellations
        </Link>
      </div>
    );
  }

  const sale = cancellation.saleId as Sale;
  const client = sale.clientId as Client;
  const schedule = calculateInstallmentSchedule();

  return (
    <div>
      {/* Header */}
      <Breadcrumb
        items={[
          { label: 'Cancellations', href: '/cancellations' },
          { label: 'Details', href: `/cancellations/${cancellation._id}` },
          { label: 'Create Refund Schedule' },
        ]}
        title="Create Refund Schedule"
        subtitle={`${sale.saleNumber} - ${client.name}`}
      />

      {/* Cancellation Summary */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cancellation Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <dt className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Paid</dt>
            <dd className="mt-1 text-xl font-semibold text-blue-900 dark:text-blue-200">
              {formatCurrency(cancellation.totalPaid)}
            </dd>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <dt className="text-sm font-medium text-red-600 dark:text-red-400">Total Deductions</dt>
            <dd className="mt-1 text-xl font-semibold text-red-900 dark:text-red-200">
              {formatCurrency(cancellation.officeChargeAmount + cancellation.otherDeductions)}
            </dd>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <dt className="text-sm font-medium text-green-600 dark:text-green-400">
              Refundable Amount
            </dt>
            <dd className="mt-1 text-xl font-semibold text-green-900 dark:text-green-200">
              {formatCurrency(cancellation.refundableAmount)}
            </dd>
          </div>
        </div>
      </div>

      {/* Schedule Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Refund Schedule Details
          </h2>

          <div className="space-y-4">
            {/* Number of Installments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Installments <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.numberOfInstallments}
                onChange={(e) =>
                  setFormData({ ...formData, numberOfInstallments: parseInt(e.target.value) || 1 })
                }
                min="1"
                max="36"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Split the refundable amount into equal monthly installments (1-36)
              </p>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Installment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Subsequent installments will be due monthly from this date
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Preview */}
        {schedule.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Schedule Preview
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Installment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {schedule.map((item) => (
                    <tr key={item.installmentNumber}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Installment {item.installmentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Total
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(schedule.reduce((sum, item) => sum + item.amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {schedule.length > 1 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> If the refundable amount doesn't divide evenly, any
                  remaining amount will be added to the last installment.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Link
            href={`/cancellations/${cancellation._id}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || schedule.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Schedule...' : 'Create Refund Schedule'}
          </button>
        </div>
      </form>

      {/* Help Information */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          How Refund Schedule Works
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
          <li>The refundable amount will be divided into equal monthly installments</li>
          <li>Each installment requires two-step approval: Accounts Manager → HOF</li>
          <li>Only approved installments can be marked as paid</li>
          <li>Payments can be made via Cash, Bank Transfer, Cheque, or Mobile Banking</li>
          <li>The cancellation status updates automatically as refunds are processed</li>
        </ul>
      </div>
    </div>
  );
}
