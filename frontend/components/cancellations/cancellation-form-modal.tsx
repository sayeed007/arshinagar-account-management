'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';
import { salesApi, cancellationsApi, Sale, Client, Plot, RSNumber, Cancellation } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';

interface CancellationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string | null;
  onSuccess: (cancellation: Cancellation) => void;
}

export function CancellationFormModal({
  isOpen,
  onClose,
  saleId,
  onSuccess,
}: CancellationFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [sale, setSale] = useState<Sale | null>(null);

  const [formData, setFormData] = useState({
    reason: '',
    officeChargePercent: 10,
    otherDeductions: 0,
    notes: '',
  });

  // Load sale data when modal opens or saleId changes
  useEffect(() => {
    if (isOpen && saleId) {
      loadSale();
    } else {
      setSale(null);
      setLoadingData(true);
    }
  }, [isOpen, saleId]);

  const loadSale = async () => {
    try {
      setLoadingData(true);
      const data = await salesApi.getById(saleId!);
      setSale(data);
    } catch (error: unknown) {
      console.error('Failed to load sale:', error);
      showError(getErrorMessage(error));
      onClose();
    } finally {
      setLoadingData(false);
    }
  };

  const calculateRefundableAmount = () => {
    if (!sale) return 0;
    const officeCharge = (sale.paidAmount * formData.officeChargePercent) / 100;
    return sale.paidAmount - officeCharge - formData.otherDeductions;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!saleId) {
      showError('Sale ID is required');
      return;
    }

    if (!formData.reason.trim()) {
      showError('Cancellation reason is required');
      return;
    }

    if (formData.officeChargePercent < 0 || formData.officeChargePercent > 100) {
      showError('Office charge percentage must be between 0 and 100');
      return;
    }

    if (formData.otherDeductions < 0) {
      showError('Other deductions cannot be negative');
      return;
    }

    const refundableAmount = calculateRefundableAmount();
    if (refundableAmount < 0) {
      showError('Refundable amount cannot be negative. Please review the deductions.');
      return;
    }

    try {
      setLoading(true);
      const data = await cancellationsApi.create({
        saleId,
        ...formData,
      });

      showSuccess('Cancellation created successfully!');
      onSuccess(data);
      onClose();

      // Reset form
      setFormData({
        reason: '',
        officeChargePercent: 10,
        otherDeductions: 0,
        notes: '',
      });
    } catch (error: unknown) {
      console.error('Failed to create cancellation:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!saleId) {
    return null;
  }

  const client = sale?.clientId as Client;
  const plot = sale?.plotId as Plot;
  const rsNumber = sale?.rsNumberId as RSNumber;
  const officeChargeAmount = sale ? (sale.paidAmount * formData.officeChargePercent) / 100 : 0;
  const refundableAmount = calculateRefundableAmount();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cancel Booking"
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <ModalContent>
          {loadingData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading sale details...</p>
            </div>
          ) : sale ? (
            <div className="space-y-4">
              {/* Sale Information Card */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Sale Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Sale Number</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{sale.saleNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Client</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {client.name}
                      <span className="text-gray-500 dark:text-gray-400 ml-2">({client.phone})</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Plot</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {plot.plotNumber} ({plot.area} sq ft)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Project</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {rsNumber.projectName} - {rsNumber.rsNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Price</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatCurrency(sale.totalPrice)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Paid</dt>
                    <dd className="mt-1 text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(sale.paidAmount)}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Cancellation Form Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter the reason for cancellation..."
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
                    required
                    className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">%</span>
                  <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                    = {formatCurrency(officeChargeAmount)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Refund Calculation Preview */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Refund Calculation Preview
                </h3>
                <div className="space-y-2">
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
                  <div className="flex justify-between items-center py-2 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 mt-2">
                    <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Refundable Amount:
                    </span>
                    <span className="text-lg font-bold text-green-800 dark:text-green-200">
                      {formatCurrency(refundableAmount)}
                    </span>
                  </div>
                </div>
                {refundableAmount < 0 && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-xs text-red-800 dark:text-red-200">
                      Warning: The refundable amount is negative. Please review the deductions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Sale not found</p>
            </div>
          )}
        </ModalContent>

        <ModalFooter>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || loadingData}
              className="flex-1 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingData || !sale || refundableAmount < 0}
              className="flex-1 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Cancellation...' : 'Create Cancellation'}
            </button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
