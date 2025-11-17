'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { cancellationsApi, refundsApi, Cancellation, CancellationStatus, Refund, Sale, Client, Plot, RSNumber } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { CancellationApproveModal } from '@/components/cancellations/cancellation-approve-modal';
import { CancellationRejectModal } from '@/components/cancellations/cancellation-reject-modal';

interface CancellationWithRefunds extends Cancellation {
  refunds: Refund[];
}

export default function CancellationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [cancellation, setCancellation] = useState<CancellationWithRefunds | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCancellation();
  }, [id]);

  const loadCancellation = async () => {
    try {
      setLoading(true);
      const data = await cancellationsApi.getById(id);
      setCancellation(data);
    } catch (error: unknown) {
      console.error('Failed to load cancellation:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (notes?: string) => {
    try {
      setActionLoading(true);
      await cancellationsApi.approve(id, notes);
      showSuccess('Cancellation approved successfully');
      setShowApproveModal(false);
      loadCancellation();
    } catch (error: unknown) {
      console.error('Failed to approve cancellation:', error);
      showError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      setActionLoading(true);
      await cancellationsApi.reject(id, reason);
      showSuccess('Cancellation rejected successfully');
      setShowRejectModal(false);
      loadCancellation();
    } catch (error: unknown) {
      console.error('Failed to reject cancellation:', error);
      showError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeClass = (status: CancellationStatus) => {
    switch (status) {
      case CancellationStatus.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case CancellationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case CancellationStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case CancellationStatus.REFUNDED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case CancellationStatus.PARTIAL_REFUND:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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

  if (!cancellation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Cancellation not found</p>
        <Link
          href="/cancellations"
          className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
        >
          Back to Cancellations
        </Link>
      </div>
    );
  }

  const sale = cancellation.saleId as Sale;
  const client = sale.clientId as Client;
  const plot = sale.plotId as Plot;
  const rsNumber = sale.rsNumberId as RSNumber;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/cancellations"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mb-2 inline-block"
            >
              ← Back to Cancellations
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cancellation Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {sale.saleNumber} - {client.name}
            </p>
          </div>
          <div>
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                cancellation.status
              )}`}
            >
              {cancellation.status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {cancellation.status === CancellationStatus.PENDING && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowApproveModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Approve Cancellation
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Reject Cancellation
            </button>
          </div>
        )}

        {cancellation.status === CancellationStatus.APPROVED && (!cancellation.refunds || cancellation.refunds.length === 0) && (
          <div className="mt-4">
            <Link
              href={`/refunds/schedule?cancellationId=${cancellation._id}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 inline-block"
            >
              Create Refund Schedule
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sale Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sale Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sale Number</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                <Link
                  href={`/sales/${sale._id}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                >
                  {sale.saleNumber}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                <Link
                  href={`/clients/${client._id}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                >
                  {client.name}
                </Link>
              </dd>
              <dd className="text-sm text-gray-500 dark:text-gray-400">{client.phone}</dd>
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
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sale Price</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatCurrency(sale.totalPrice)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Cancellation Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cancellation Details
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cancellation Date</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(cancellation.cancellationDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Reason</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{cancellation.reason}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {cancellation.createdBy && typeof cancellation.createdBy === 'object'
                  ? cancellation.createdBy.username
                  : 'N/A'}
              </dd>
            </div>
            {cancellation.approvedBy && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {cancellation.status === CancellationStatus.REJECTED ? 'Rejected By' : 'Approved By'}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {typeof cancellation.approvedBy === 'object'
                      ? cancellation.approvedBy.username
                      : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {cancellation.status === CancellationStatus.REJECTED ? 'Rejected At' : 'Approved At'}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {cancellation.approvedAt
                      ? new Date(cancellation.approvedAt).toLocaleDateString()
                      : 'N/A'}
                  </dd>
                </div>
              </>
            )}
            {cancellation.rejectionReason && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejection Reason</dt>
                <dd className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {cancellation.rejectionReason}
                </dd>
              </div>
            )}
            {cancellation.notes && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{cancellation.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Refund Calculation Breakdown */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Refund Calculation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <dt className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Paid</dt>
            <dd className="mt-1 text-xl font-semibold text-blue-900 dark:text-blue-200">
              {formatCurrency(cancellation.totalPaid)}
            </dd>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <dt className="text-sm font-medium text-red-600 dark:text-red-400">
              Office Charge ({cancellation.officeChargePercent}%)
            </dt>
            <dd className="mt-1 text-xl font-semibold text-red-900 dark:text-red-200">
              -{formatCurrency(cancellation.officeChargeAmount)}
            </dd>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <dt className="text-sm font-medium text-red-600 dark:text-red-400">Other Deductions</dt>
            <dd className="mt-1 text-xl font-semibold text-red-900 dark:text-red-200">
              -{formatCurrency(cancellation.otherDeductions)}
            </dd>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <dt className="text-sm font-medium text-green-600 dark:text-green-400">Refundable</dt>
            <dd className="mt-1 text-xl font-semibold text-green-900 dark:text-green-200">
              {formatCurrency(cancellation.refundableAmount)}
            </dd>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <dt className="text-sm font-medium text-purple-600 dark:text-purple-400">Refunded</dt>
            <dd className="mt-1 text-xl font-semibold text-purple-900 dark:text-purple-200">
              {formatCurrency(cancellation.refundedAmount)}
            </dd>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining Refund:</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(cancellation.remainingRefund)}
            </span>
          </div>
        </div>
      </div>

      {/* Refund Installments */}
      {cancellation.refunds && cancellation.refunds.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Refund Installments ({cancellation.refunds.length})
            </h2>
            <Link
              href={`/refunds?cancellationId=${cancellation._id}`}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
            >
              View All Refunds →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Refund #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Installment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {cancellation.refunds.map((refund) => (
                  <tr key={refund._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {refund.refundNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      Installment {refund.installmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(refund.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(refund.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/refunds/${refund._id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      <CancellationApproveModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onApprove={handleApprove}
        loading={actionLoading}
      />

      {/* Reject Modal */}
      <CancellationRejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onReject={handleReject}
        loading={actionLoading}
      />
    </div>
  );
}
