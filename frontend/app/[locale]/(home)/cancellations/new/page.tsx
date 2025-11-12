'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { salesApi, cancellationsApi, Sale, Client, Land, RSNumber } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';

export default function NewCancellationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saleId = searchParams.get('saleId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sale, setSale] = useState<Sale | null>(null);

  const [formData, setFormData] = useState({
    reason: '',
    officeChargePercent: 10,
    otherDeductions: 0,
    notes: '',
  });

  useEffect(() => {
    if (saleId) {
      loadSale();
    } else {
      setLoading(false);
    }
  }, [saleId]);

  const loadSale = async () => {
    try {
      setLoading(true);
      const response = await salesApi.getById(saleId!);
      setSale(response.data);
    } catch (error: any) {
      console.error('Failed to load sale:', error);
      alert(error.response?.data?.error?.message || 'Failed to load sale details');
    } finally {
      setLoading(false);
    }
  };

  const calculateRefundableAmount = () => {
    if (!sale) return 0;
    const officeCharge = (sale.paidAmount * formData.officeChargePercent) / 100;
    return sale.paidAmount - officeCharge - formData.otherDeductions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!saleId) {
      alert('Sale ID is required');
      return;
    }

    if (!formData.reason.trim()) {
      alert('Cancellation reason is required');
      return;
    }

    if (formData.officeChargePercent < 0 || formData.officeChargePercent > 100) {
      alert('Office charge percentage must be between 0 and 100');
      return;
    }

    if (formData.otherDeductions < 0) {
      alert('Other deductions cannot be negative');
      return;
    }

    try {
      setSubmitting(true);
      const response = await cancellationsApi.create({
        saleId,
        ...formData,
      });

      showSuccess('Cancellation created successfully');
      router.push(`/cancellations/${response.data._id}`);
    } catch (error: any) {
      console.error('Failed to create cancellation:', error);
      alert(error.response?.data?.error?.message || 'Failed to create cancellation');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sale details...</p>
        </div>
      </div>
    );
  }

  if (!saleId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No sale selected. Please select a sale to cancel.
        </p>
        <Link
          href="/sales"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
        >
          Go to Sales
        </Link>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Sale not found</p>
        <Link
          href="/sales"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
        >
          Go to Sales
        </Link>
      </div>
    );
  }

  const client = sale.clientId as Client;
  const plot = sale.plotId as Land;
  const rsNumber = sale.rsNumberId as RSNumber;
  const officeChargeAmount = (sale.paidAmount * formData.officeChargePercent) / 100;
  const refundableAmount = calculateRefundableAmount();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/sales/${sale._id}`}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mb-2 inline-block"
        >
          ← Back to Sale
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cancel Booking</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Create cancellation for {sale.saleNumber}
        </p>
      </div>

      {/* Sale Information Card */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sale Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sale Number</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{sale.saleNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {client.name}
              <span className="text-gray-500 dark:text-gray-400 ml-2">({client.phone})</span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Plot</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {plot.plotNumber} ({plot.area} sq ft)
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Project</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {rsNumber.projectName} - {rsNumber.rsNumber}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Price</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {formatCurrency(sale.totalPrice)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Paid</dt>
            <dd className="mt-1 text-sm font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(sale.paidAmount)}
            </dd>
          </div>
        </div>
      </div>

      {/* Cancellation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cancellation Details
          </h2>

          <div className="space-y-4">
            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter the reason for cancellation..."
                required
              />
            </div>

            {/* Office Charge Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Office Charge Percentage <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={formData.officeChargePercent}
                  onChange={(e) =>
                    setFormData({ ...formData, officeChargePercent: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <span className="ml-2 text-gray-600 dark:text-gray-400">%</span>
                <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                  = {formatCurrency(officeChargeAmount)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Percentage of paid amount to be deducted as office charge (default: 10%)
              </p>
            </div>

            {/* Other Deductions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Other Deductions
              </label>
              <input
                type="number"
                value={formData.otherDeductions}
                onChange={(e) =>
                  setFormData({ ...formData, otherDeductions: parseFloat(e.target.value) || 0 })
                }
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Any additional deductions (penalties, dues, etc.)
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Any additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Refund Calculation Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Refund Calculation Preview
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Paid Amount:
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(sale.paidAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Less: Office Charge ({formData.officeChargePercent}%):
              </span>
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                -{formatCurrency(officeChargeAmount)}
              </span>
            </div>
            {formData.otherDeductions > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Less: Other Deductions:
                </span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  -{formatCurrency(formData.otherDeductions)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/20 rounded-lg px-4 mt-2">
              <span className="text-base font-semibold text-green-800 dark:text-green-200">
                Refundable Amount:
              </span>
              <span className="text-xl font-bold text-green-800 dark:text-green-200">
                {formatCurrency(refundableAmount)}
              </span>
            </div>
          </div>
          {refundableAmount < 0 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">
                Warning: The refundable amount is negative. Please review the deductions.
              </p>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Link
            href={`/sales/${sale._id}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || refundableAmount < 0}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Cancellation...' : 'Create Cancellation'}
          </button>
        </div>
      </form>
    </div>
  );
}
