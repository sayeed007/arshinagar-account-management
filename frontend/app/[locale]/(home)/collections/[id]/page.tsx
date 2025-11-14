'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { receiptsApi, Receipt, ReceiptApprovalStatus, ReceiptType, Client, Sale } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/api';

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (params.id) {
      loadReceipt();
    }
  }, [params.id]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const data = await receiptsApi.getById(params.id as string);
      setReceipt(data);
    } catch (error: unknown) {
      console.error('Failed to load receipt:', error);
      showError(getErrorMessage(error));
      router.push('/collections');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await receiptsApi.approve(params.id as string, remarks);
      showSuccess('Receipt approved successfully');
      setShowApproveConfirm(false);
      setRemarks('');
      loadReceipt();
    } catch (error: unknown) {
      console.error('Failed to approve receipt:', error);
      showError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await receiptsApi.reject(params.id as string, remarks);
      showSuccess('Receipt rejected');
      setShowRejectConfirm(false);
      setRemarks('');
      loadReceipt();
    } catch (error: unknown) {
      console.error('Failed to reject receipt:', error);
      showError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await receiptsApi.submit(params.id as string);
      showSuccess('Receipt submitted for approval');
      loadReceipt();
    } catch (error: unknown) {
      console.error('Failed to submit receipt:', error);
      showError(getErrorMessage(error));
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const canApprove = () => {
    if (!user || !receipt) return false;

    // Account Manager can approve if status is PENDING_ACCOUNTS
    if (user.role === UserRole.ACCOUNT_MANAGER && receipt.approvalStatus === ReceiptApprovalStatus.PENDING_ACCOUNTS) {
      return true;
    }

    // HOF or Admin can approve if status is PENDING_HOF
    if ((user.role === UserRole.HOF || user.role === UserRole.ADMIN) && receipt.approvalStatus === ReceiptApprovalStatus.PENDING_HOF) {
      return true;
    }

    return false;
  };

  const canSubmit = () => {
    return receipt?.approvalStatus === ReceiptApprovalStatus.DRAFT;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Receipt not found</p>
        <Link
          href="/collections"
          className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
        >
          Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Collections', href: '/collections' },
          { label: receipt.receiptNumber },
        ]}
        title={`Receipt ${receipt.receiptNumber}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Receipt Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Receipt Information
              </h2>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(receipt.approvalStatus)}`}>
                {receipt.approvalStatus}
              </span>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Receipt Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                  {receipt.receiptNumber}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Receipt Type
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {receipt.receiptType}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Amount
                </dt>
                <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(Number(receipt.amount))}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Payment Method
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {receipt.method}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Receipt Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(receipt.receiptDate).toLocaleDateString()}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Posted to Ledger
                </dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    receipt.postedToLedger
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {receipt.postedToLedger ? 'Yes' : 'No'}
                  </span>
                </dd>
              </div>

              {receipt.notes && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Notes
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {receipt.notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Payment Instrument Details */}
          {receipt.instrumentDetails && (receipt.method === 'Cheque' || receipt.method === 'Bank Transfer') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Payment Instrument Details
              </h2>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                {receipt.instrumentDetails.bankName && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Bank Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {receipt.instrumentDetails.bankName}
                    </dd>
                  </div>
                )}

                {receipt.instrumentDetails.branchName && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Branch Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {receipt.instrumentDetails.branchName}
                    </dd>
                  </div>
                )}

                {receipt.instrumentDetails.chequeNumber && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cheque Number
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {receipt.instrumentDetails.chequeNumber}
                    </dd>
                  </div>
                )}

                {receipt.instrumentDetails.chequeDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cheque Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(receipt.instrumentDetails.chequeDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}

                {receipt.instrumentDetails.accountNumber && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Account Number
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {receipt.instrumentDetails.accountNumber}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Client Information */}
          {typeof receipt.clientId === 'object' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Client Information
              </h2>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Client Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                    {receipt.clientId.name}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {receipt.clientId.phone}
                  </dd>
                </div>

                {receipt.clientId.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {receipt.clientId.email}
                    </dd>
                  </div>
                )}

                <div className="md:col-span-2">
                  <Link
                    href={`/clients/${receipt.clientId._id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    View Client Details →
                  </Link>
                </div>
              </dl>
            </div>
          )}

          {/* Approval History */}
          {receipt.approvalHistory && receipt.approvalHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Approval History
              </h2>

              <div className="space-y-4">
                {receipt.approvalHistory.map((approval) => (
                  <div key={approval._id} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {approval.action} by{' '}
                          {typeof approval.approvedBy === 'object' ? approval.approvedBy.username : approval.approvedBy}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {approval.approvalLevel} • {new Date(approval.approvedAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        approval.action === 'Approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {approval.action}
                      </span>
                    </div>
                    {approval.remarks && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {approval.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions
            </h2>
            <div className="space-y-3">
              {canSubmit() && (
                <button
                  onClick={handleSubmit}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit for Approval
                </button>
              )}

              {canApprove() && (
                <>
                  <button
                    onClick={() => setShowApproveConfirm(true)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve Receipt
                  </button>
                  <button
                    onClick={() => setShowRejectConfirm(true)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject Receipt
                  </button>
                </>
              )}

              {receipt.approvalStatus === ReceiptApprovalStatus.APPROVED && (
                <button
                  onClick={() => window.print()}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Print Receipt
                </button>
              )}

              <Link
                href="/collections"
                className="block w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Back to Collections
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApprove}
        title="Approve Receipt"
        message={`Are you sure you want to approve this receipt for ${formatCurrency(Number(receipt.amount))}?`}
        confirmText="Approve"
        cancelText="Cancel"
        variant="success"
        isLoading={actionLoading}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Remarks (Optional)
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="Add any remarks..."
          />
        </div>
      </ConfirmDialog>

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleReject}
        title="Reject Receipt"
        message={`Are you sure you want to reject this receipt for ${formatCurrency(Number(receipt.amount))}?`}
        confirmText="Reject"
        cancelText="Cancel"
        variant="danger"
        isLoading={actionLoading}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Remarks (Required)
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="Please provide a reason for rejection..."
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
