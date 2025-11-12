'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { refundsApi, Refund, RefundStatus, RefundApprovalStatus, Cancellation, Sale, Client, Land, RSNumber } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';

export default function RefundDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refund, setRefund] = useState<Refund | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [actionRemarks, setActionRemarks] = useState('');
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionRef: '',
    remarks: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRefund();
  }, [params.id]);

  const loadRefund = async () => {
    try {
      setLoading(true);
      const response = await refundsApi.getById(params.id);
      setRefund(response.data);
    } catch (error: any) {
      console.error('Failed to load refund:', error);
      showError(error.response?.data?.error?.message || 'Failed to load refund');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setActionLoading(true);
      await refundsApi.submit(params.id);
      showSuccess('Refund submitted for approval successfully');
      setShowSubmitModal(false);
      loadRefund();
    } catch (error: any) {
      console.error('Failed to submit refund:', error);
      showError(error.response?.data?.error?.message || 'Failed to submit refund');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await refundsApi.approve(params.id, actionRemarks || undefined);
      showSuccess('Refund approved successfully');
      setShowApproveModal(false);
      setActionRemarks('');
      loadRefund();
    } catch (error: any) {
      console.error('Failed to approve refund:', error);
      showError(error.response?.data?.error?.message || 'Failed to approve refund');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!actionRemarks.trim()) {
      showError('Rejection remarks are required');
      return;
    }

    try {
      setActionLoading(true);
      await refundsApi.reject(params.id, actionRemarks);
      showSuccess('Refund rejected successfully');
      setShowRejectModal(false);
      setActionRemarks('');
      loadRefund();
    } catch (error: any) {
      console.error('Failed to reject refund:', error);
      showError(error.response?.data?.error?.message || 'Failed to reject refund');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!paymentData.paymentDate) {
      showError('Payment date is required');
      return;
    }

    try {
      setActionLoading(true);
      await refundsApi.markAsPaid(params.id, paymentData);
      showSuccess('Refund marked as paid successfully');
      setShowPaymentModal(false);
      setPaymentData({
        paymentMethod: 'Cash',
        paymentDate: new Date().toISOString().split('T')[0],
        transactionRef: '',
        remarks: '',
      });
      loadRefund();
    } catch (error: any) {
      console.error('Failed to mark refund as paid:', error);
      showError(error.response?.data?.error?.message || 'Failed to mark refund as paid');
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

  const getStatusBadgeClass = (status: RefundStatus) => {
    switch (status) {
      case RefundStatus.PAID:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case RefundStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case RefundStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getApprovalBadgeClass = (status: RefundApprovalStatus) => {
    switch (status) {
      case RefundApprovalStatus.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case RefundApprovalStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case RefundApprovalStatus.PENDING_ACCOUNTS:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case RefundApprovalStatus.PENDING_HOF:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case RefundApprovalStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading refund details...</p>
        </div>
      </div>
    );
  }

  if (!refund) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Refund not found</p>
        <Link
          href="/refunds"
          className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
        >
          Back to Refunds
        </Link>
      </div>
    );
  }

  const cancellation = refund.cancellationId as Cancellation;
  const sale = cancellation.saleId as Sale;
  const client = sale.clientId as Client;
  const plot = sale.plotId as Land;
  const rsNumber = sale.rsNumberId as RSNumber;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/refunds"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mb-2 inline-block"
            >
              ← Back to Refunds
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Refund Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {refund.refundNumber} - Installment {refund.installmentNumber}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                refund.status
              )}`}
            >
              {refund.status}
            </span>
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getApprovalBadgeClass(
                refund.approvalStatus
              )}`}
            >
              {refund.approvalStatus}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          {refund.approvalStatus === RefundApprovalStatus.DRAFT && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit for Approval
            </button>
          )}

          {(refund.approvalStatus === RefundApprovalStatus.PENDING_ACCOUNTS ||
            refund.approvalStatus === RefundApprovalStatus.PENDING_HOF) && (
            <>
              <button
                onClick={() => setShowApproveModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reject
              </button>
            </>
          )}

          {refund.approvalStatus === RefundApprovalStatus.APPROVED &&
            refund.status === RefundStatus.PENDING && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Mark as Paid
              </button>
            )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Refund Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Refund Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Refund Number</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{refund.refundNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Installment Number</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                Installment {refund.installmentNumber}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(refund.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(refund.dueDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(refund.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Sale & Client Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sale & Client Information
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
              <dd className="text-sm text-gray-500 dark:text-gray-400">
                {client.phone} • {client.email}
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
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cancellation</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                <Link
                  href={`/cancellations/${cancellation._id}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                >
                  View Cancellation Details
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Approval History */}
      {(refund.accountsApprovedBy || refund.hofApprovedBy) && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Approval History
          </h2>
          <div className="space-y-4">
            {refund.accountsApprovedBy && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Accounts Manager Approval
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Approved by{' '}
                    {typeof refund.accountsApprovedBy === 'object'
                      ? refund.accountsApprovedBy.username
                      : 'N/A'}
                  </p>
                  {refund.accountsApprovedAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(refund.accountsApprovedAt).toLocaleString()}
                    </p>
                  )}
                  {refund.accountsRemarks && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Remarks: {refund.accountsRemarks}
                    </p>
                  )}
                </div>
              </div>
            )}

            {refund.hofApprovedBy && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    HOF (Head of Finance) Approval
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Approved by{' '}
                    {typeof refund.hofApprovedBy === 'object'
                      ? refund.hofApprovedBy.username
                      : 'N/A'}
                  </p>
                  {refund.hofApprovedAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(refund.hofApprovedAt).toLocaleString()}
                    </p>
                  )}
                  {refund.hofRemarks && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Remarks: {refund.hofRemarks}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Information */}
      {refund.status === RefundStatus.PAID && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment Information
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {refund.paymentMethod || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Date</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {refund.paymentDate
                  ? new Date(refund.paymentDate).toLocaleDateString()
                  : 'N/A'}
              </dd>
            </div>
            {refund.transactionRef && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Transaction Reference
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {refund.transactionRef}
                </dd>
              </div>
            )}
            {refund.paymentRemarks && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Remarks</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {refund.paymentRemarks}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid By</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {refund.paidBy && typeof refund.paidBy === 'object'
                  ? refund.paidBy.username
                  : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid At</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {refund.paidAt ? new Date(refund.paidAt).toLocaleString() : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Submit for Approval
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to submit this refund for approval? It will be sent to the
                Accounts Manager for review.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Approve Refund
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to approve this refund?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Add any remarks..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setActionRemarks('');
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Reject Refund
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for rejecting this refund.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rejection Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Enter rejection reason..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setActionRemarks('');
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Mark Refund as Paid
              </h3>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, paymentMethod: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, paymentDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transaction Reference
                  </label>
                  <input
                    type="text"
                    value={paymentData.transactionRef}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, transactionRef: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Transaction/Cheque number..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Remarks
                  </label>
                  <textarea
                    value={paymentData.remarks}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, remarks: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentData({
                      paymentMethod: 'Cash',
                      paymentDate: new Date().toISOString().split('T')[0],
                      transactionRef: '',
                      remarks: '',
                    });
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAsPaid}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Mark as Paid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
