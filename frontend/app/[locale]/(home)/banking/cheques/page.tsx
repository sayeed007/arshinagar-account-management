'use client';

import { useState, useEffect } from 'react';
import { chequesApi, Cheque, ChequeStatus, ChequeType } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CheckCircle, XCircle, AlertCircle, Clock, DollarSign } from 'lucide-react';

type FilterStatus = 'all' | ChequeStatus;

export default function ChequesPage() {
  const [loading, setLoading] = useState(true);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Confirm dialog states
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showBounceConfirm, setShowBounceConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedChequeId, setSelectedChequeId] = useState<string | null>(null);
  const [bounceReason, setBounceReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalCheques: 0,
    totalAmount: 0,
    pendingCheques: 0,
    dueTodayCheques: 0,
    overdueCheques: 0,
    clearedCheques: 0,
    bouncedCheques: 0,
    clearedAmount: 0,
    pendingAmount: 0,
  });

  useEffect(() => {
    loadCheques();
    loadStats();
  }, [filterStatus]);

  const loadCheques = async () => {
    try {
      setLoading(true);
      const params: {
        limit?: number;
        status?: ChequeStatus;
      } = { limit: 100 };

      if (filterStatus !== 'all') {
        params.status = filterStatus as ChequeStatus;
      }

      const response = await chequesApi.getAll(params);
      setCheques(response.data);
    } catch (error: unknown) {
      console.error('Failed to load cheques:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await chequesApi.getStats();
      setStats(data);
    } catch (error: unknown) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleMarkAsClearedClick = (id: string) => {
    setSelectedChequeId(id);
    setShowClearConfirm(true);
  };

  const handleMarkAsClearedConfirm = async () => {
    if (!selectedChequeId) return;

    setIsProcessing(true);
    try {
      await chequesApi.markAsCleared(selectedChequeId);
      showSuccess('Cheque marked as cleared');
      setShowClearConfirm(false);
      setSelectedChequeId(null);
      loadCheques();
      loadStats();
    } catch (error: unknown) {
      console.error('Failed to mark cheque as cleared:', error);
      showError(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsBouncedClick = (id: string) => {
    setSelectedChequeId(id);
    setBounceReason('');
    setShowBounceConfirm(true);
  };

  const handleMarkAsBouncedConfirm = async () => {
    if (!selectedChequeId || !bounceReason.trim()) {
      showError('Please enter a bounce reason');
      return;
    }

    setIsProcessing(true);
    try {
      await chequesApi.markAsBounced(selectedChequeId, bounceReason);
      showSuccess('Cheque marked as bounced');
      setShowBounceConfirm(false);
      setSelectedChequeId(null);
      setBounceReason('');
      loadCheques();
      loadStats();
    } catch (error: unknown) {
      console.error('Failed to mark cheque as bounced:', error);
      showError(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelClick = (id: string) => {
    setSelectedChequeId(id);
    setCancelReason('');
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedChequeId || !cancelReason.trim()) {
      showError('Please enter a cancellation reason');
      return;
    }

    setIsProcessing(true);
    try {
      await chequesApi.cancel(selectedChequeId, cancelReason);
      showSuccess('Cheque cancelled');
      setShowCancelConfirm(false);
      setSelectedChequeId(null);
      setCancelReason('');
      loadCheques();
      loadStats();
    } catch (error: unknown) {
      console.error('Failed to cancel cheque:', error);
      showError(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
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

  const getStatusBadge = (status: ChequeStatus) => {
    const styles: Record<ChequeStatus, string> = {
      [ChequeStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      [ChequeStatus.DUE_TODAY]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      [ChequeStatus.CLEARED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [ChequeStatus.OVERDUE]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      [ChequeStatus.BOUNCED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      [ChequeStatus.CANCELLED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: ChequeType) => {
    const styles: Record<ChequeType, string> = {
      [ChequeType.PDC]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [ChequeType.CURRENT]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[type]}`}>
        {type}
      </span>
    );
  };

  const getClientName = (cheque: Cheque): string => {
    if (typeof cheque.clientId === 'string') {
      return cheque.clientId;
    }
    return cheque.clientId?.name || '-';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cheques Management</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Track and manage all cheques
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cheques</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalCheques}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Total Amount: {formatCurrency(stats.totalAmount)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {stats.pendingCheques}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Amount: {formatCurrency(stats.pendingAmount)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cleared</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {stats.clearedCheques}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Amount: {formatCurrency(stats.clearedAmount)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {stats.overdueCheques}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Due Today: {stats.dueTodayCheques} | Bounced: {stats.bouncedCheques}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-indigo-600 text-white dark:bg-indigo-500'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All
        </button>
        {Object.values(ChequeStatus).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filterStatus === status
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Cheques Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      ) : cheques.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No cheques found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Cheque Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Bank / Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {cheques.map((cheque) => (
                  <tr key={cheque._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {cheque.chequeNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {cheque.bankName}
                      </div>
                      {cheque.branchName && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {cheque.branchName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getClientName(cheque)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(cheque.chequeType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(cheque.issueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(cheque.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(cheque.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(cheque.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      {cheque.status === ChequeStatus.PENDING && (
                        <>
                          <button
                            onClick={() => handleMarkAsClearedClick(cheque._id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 font-medium"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => handleMarkAsBouncedClick(cheque._id)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-medium"
                          >
                            Bounce
                          </button>
                          <button
                            onClick={() => handleCancelClick(cheque._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {cheque.status === ChequeStatus.CLEARED && (
                        <span className="text-gray-400 dark:text-gray-600 text-xs">
                          Cleared on {cheque.clearedDate && formatDate(cheque.clearedDate)}
                        </span>
                      )}
                      {cheque.status === ChequeStatus.BOUNCED && (
                        <span className="text-gray-400 dark:text-gray-600 text-xs">
                          {cheque.bounceReason}
                        </span>
                      )}
                      {cheque.status === ChequeStatus.CANCELLED && (
                        <span className="text-gray-400 dark:text-gray-600 text-xs">
                          {cheque.cancelledReason}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleMarkAsClearedConfirm}
        title="Mark Cheque as Cleared"
        message="Are you sure you want to mark this cheque as cleared?"
        confirmText="Mark as Cleared"
        variant="success"
        isLoading={isProcessing}
      />

      <ConfirmDialog
        isOpen={showBounceConfirm}
        onClose={() => {
          setShowBounceConfirm(false);
          setBounceReason('');
        }}
        onConfirm={handleMarkAsBouncedConfirm}
        title="Mark Cheque as Bounced"
        message="Please enter the reason for bouncing this cheque:"
        confirmText="Mark as Bounced"
        variant="warning"
        isLoading={isProcessing}
      >
        <textarea
          value={bounceReason}
          onChange={(e) => setBounceReason(e.target.value)}
          placeholder="Enter bounce reason..."
          className="w-full border dark:border-gray-700 rounded-md px-3 py-2 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          rows={3}
        />
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => {
          setShowCancelConfirm(false);
          setCancelReason('');
        }}
        onConfirm={handleCancelConfirm}
        title="Cancel Cheque"
        message="Please enter the reason for cancelling this cheque:"
        confirmText="Cancel Cheque"
        variant="danger"
        isLoading={isProcessing}
      >
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Enter cancellation reason..."
          className="w-full border dark:border-gray-700 rounded-md px-3 py-2 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          rows={3}
        />
      </ConfirmDialog>
    </div>
  );
}
