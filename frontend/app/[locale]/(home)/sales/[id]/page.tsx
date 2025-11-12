'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { salesApi, Sale, Client, Plot, RSNumber, SaleStageStatus, SaleStatus } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadSale();
    }
  }, [params.id]);

  const loadSale = async () => {
    try {
      setLoading(true);
      const data = await salesApi.getById(params.id as string);
      setSale(data);
    } catch (error: any) {
      console.error('Failed to load sale:', error);
      showError(error.response?.data?.error?.message || 'Failed to load sale');
      router.push('/sales');
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

  const getStageStatusBadge = (status: SaleStageStatus) => {
    switch (status) {
      case SaleStageStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case SaleStageStatus.PARTIAL:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case SaleStageStatus.OVERDUE:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getProgressPercentage = (received: number, planned: number) => {
    if (planned === 0) return 0;
    return Math.min((received / planned) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sale...</p>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Sale not found</p>
        <Link href="/sales" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
          Back to Sales
        </Link>
      </div>
    );
  }

  const client = sale.clientId as Client;
  const plot = sale.plotId as Plot;
  const rsNumber = sale.rsNumberId as RSNumber;
  const paymentProgress = getProgressPercentage(sale.paidAmount, sale.totalPrice);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/sales" className="hover:text-indigo-600">
            Sales
          </Link>
          <span>/</span>
          <span>{sale.saleNumber}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sale.saleNumber}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Sale Date: {new Date(sale.saleDate).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sale Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sale Summary</h2>

            {/* Payment Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Payment Progress</span>
                <span className="font-semibold text-gray-900 dark:text-white">{paymentProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{ width: `${paymentProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Paid: {formatCurrency(sale.paidAmount)}</span>
                <span>Total: {formatCurrency(sale.totalPrice)}</span>
              </div>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Total Price</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(sale.totalPrice)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-xs text-green-700 dark:text-green-300 mb-1">Paid Amount</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(sale.paidAmount)}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-xs text-red-700 dark:text-red-300 mb-1">Due Amount</p>
                <p className="text-lg font-bold text-red-900 dark:text-red-100">
                  {formatCurrency(sale.dueAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Sale Stages */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Stages</h2>

            {sale.stages && sale.stages.length > 0 ? (
              <div className="space-y-4">
                {sale.stages.map((stage, index) => {
                  const stageProgress = getProgressPercentage(stage.receivedAmount, stage.plannedAmount);
                  return (
                    <div key={stage._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {index + 1}. {stage.stageName}
                          </h3>
                          {stage.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stage.notes}</p>
                          )}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageStatusBadge(stage.status)}`}>
                          {stage.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Planned:</span>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(stage.plannedAmount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Received:</span>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(stage.receivedAmount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Due:</span>
                          <p className="font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(stage.dueAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Stage Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            stage.status === SaleStageStatus.COMPLETED
                              ? 'bg-green-500'
                              : stage.status === SaleStageStatus.PARTIAL
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                          }`}
                          style={{ width: `${stageProgress}%` }}
                        />
                      </div>

                      {stage.completedDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Completed: {new Date(stage.completedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No payment stages defined</p>
            )}
          </div>

          {/* Client & Plot Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Details</h2>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Client Name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  <Link href={`/clients/${client._id}`} className="text-indigo-600 hover:underline">
                    {client.name}
                  </Link>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Client Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{client.phone}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Plot Number</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  <Link href={`/land/plots/${plot._id}`} className="text-indigo-600 hover:underline">
                    {plot.plotNumber}
                  </Link>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Plot Area</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {plot.area} {rsNumber.unitType}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">RS Number</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  <Link href={`/land/rs-numbers/${rsNumber._id}`} className="text-indigo-600 hover:underline">
                    {rsNumber.rsNumber}
                  </Link>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Project</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{rsNumber.projectName}</dd>
              </div>

              {sale.notes && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{sale.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/receipts/new?saleId=${sale._id}`}
                className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700"
              >
                + Record Payment
              </Link>
              <Link
                href={`/receipts?saleId=${sale._id}`}
                className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700"
              >
                View Receipts
              </Link>
              <Link
                href={`/installments?saleId=${sale._id}`}
                className="block w-full px-4 py-2 bg-purple-600 text-white text-center rounded-md hover:bg-purple-700"
              >
                View Installments
              </Link>
              {sale.status === SaleStatus.ACTIVE && (
                <Link
                  href={`/cancellations/new?saleId=${sale._id}`}
                  className="block w-full px-4 py-2 bg-red-600 text-white text-center rounded-md hover:bg-red-700"
                >
                  Cancel Booking
                </Link>
              )}
              <Link
                href="/sales"
                className="block w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Back to Sales
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{sale.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Stages:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{sale.stages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
