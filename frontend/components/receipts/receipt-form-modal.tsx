'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';
import { receiptsApi, salesApi, Sale, ReceiptType, PaymentMethod, Receipt } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';

interface ReceiptFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId?: string; // Pre-select a sale if provided
  onSuccess: (receipt: Receipt) => void;
}

export function ReceiptFormModal({
  isOpen,
  onClose,
  saleId,
  onSuccess,
}: ReceiptFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const [formData, setFormData] = useState({
    saleId: saleId || '',
    receiptType: ReceiptType.BOOKING,
    amount: '',
    method: PaymentMethod.CASH,
    receiptDate: new Date().toISOString().split('T')[0],
    bankName: '',
    chequeNumber: '',
    notes: '',
  });

  // Load sales on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSales();
    }
  }, [isOpen]);

  // Update formData when saleId prop changes
  useEffect(() => {
    if (saleId) {
      setFormData((prev) => ({ ...prev, saleId }));
    }
  }, [saleId]);

  // Update selected sale when saleId changes
  useEffect(() => {
    if (formData.saleId) {
      const sale = sales.find((s) => s._id === formData.saleId);
      setSelectedSale(sale || null);
    } else {
      setSelectedSale(null);
    }
  }, [formData.saleId, sales]);

  const loadSales = async () => {
    try {
      setLoadingData(true);
      const response = await salesApi.getAll({ page: 1, limit: 100, isActive: true });
      setSales(response.data || []);
    } catch (error) {
      console.error('Failed to load sales:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedSale) {
        showError('Please select a sale');
        setLoading(false);
        return;
      }

      if (formData.method === PaymentMethod.CHEQUE || formData.method === PaymentMethod.PDC) {
        if (!formData.bankName || !formData.chequeNumber) {
          showError('Bank name and cheque number are required for cheque/PDC payments');
          setLoading(false);
          return;
        }
      }

      const data: any = {
        clientId: typeof selectedSale.clientId === 'string' ? selectedSale.clientId : selectedSale.clientId._id,
        saleId: formData.saleId,
        receiptType: formData.receiptType,
        amount: parseFloat(formData.amount),
        method: formData.method,
        receiptDate: formData.receiptDate,
      };

      // Add instrument details for cheque/PDC
      if ((formData.method === PaymentMethod.CHEQUE || formData.method === PaymentMethod.PDC) && formData.bankName && formData.chequeNumber) {
        data.instrumentDetails = {
          bankName: formData.bankName,
          chequeNumber: formData.chequeNumber,
        };
      }

      // Add notes if provided
      if (formData.notes.trim()) {
        data.notes = formData.notes.trim();
      }

      const receipt = await receiptsApi.create(data);
      showSuccess('Receipt created successfully!');
      onSuccess(receipt);
      onClose();

      // Reset form
      setFormData({
        saleId: saleId || '',
        receiptType: ReceiptType.BOOKING,
        amount: '',
        method: PaymentMethod.CASH,
        receiptDate: new Date().toISOString().split('T')[0],
        bankName: '',
        chequeNumber: '',
        notes: '',
      });
    } catch (error: unknown) {
      console.error('Failed to create receipt:', error);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Receipt"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalContent>
          {loadingData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading sales...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sale Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sale <span className="text-red-500">*</span>
                </label>
                <select
                  name="saleId"
                  value={formData.saleId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a sale</option>
                  {sales.map((sale) => (
                    <option key={sale._id} value={sale._id}>
                      {sale.saleNumber} - Due: ৳{sale.dueAmount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Receipt Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Receipt Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="receiptType"
                  value={formData.receiptType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={ReceiptType.BOOKING}>Booking</option>
                  <option value={ReceiptType.INSTALLMENT}>Installment</option>
                  <option value={ReceiptType.REGISTRATION}>Registration</option>
                  <option value={ReceiptType.HANDOVER}>Handover</option>
                  <option value={ReceiptType.OTHER}>Other</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (BDT) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., 500000"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={PaymentMethod.CASH}>Cash</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                  <option value={PaymentMethod.CHEQUE}>Cheque</option>
                  <option value={PaymentMethod.PDC}>PDC (Post-Dated Cheque)</option>
                  <option value={PaymentMethod.MOBILE_WALLET}>Mobile Wallet</option>
                </select>
              </div>

              {/* Cheque Details (conditional) */}
              {(formData.method === PaymentMethod.CHEQUE || formData.method === PaymentMethod.PDC) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cheque Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="chequeNumber"
                      value={formData.chequeNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Receipt Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Receipt Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="receiptDate"
                  value={formData.receiptDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Additional notes (optional)"
                />
              </div>
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
              disabled={loading || loadingData}
              className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Receipt'}
            </button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
