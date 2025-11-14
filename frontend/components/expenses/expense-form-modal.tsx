'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';
import { expensesApi, expenseCategoryApi, ExpenseCategory, PaymentMethod, Expense } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (expense: Expense) => void;
}

export function ExpenseFormModal({
  isOpen,
  onClose,
  onSuccess,
}: ExpenseFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    vendor: '',
    description: '',
    paymentMethod: PaymentMethod.CASH,
    bankName: '',
    chequeNumber: '',
    notes: '',
  });

  // Load categories on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoadingData(true);
      const response = await expenseCategoryApi.getAll({ page: 1, limit: 100, isActive: true });
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
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
      if (formData.paymentMethod === PaymentMethod.CHEQUE) {
        if (!formData.bankName || !formData.chequeNumber) {
          showError('Bank name and cheque number are required for cheque payments');
          setLoading(false);
          return;
        }
      }

      const data: any = {
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        expenseDate: formData.expenseDate,
        vendor: formData.vendor || undefined,
        description: formData.description,
        paymentMethod: formData.paymentMethod,
      };

      // Add instrument details for cheque
      if (formData.paymentMethod === PaymentMethod.CHEQUE && formData.bankName && formData.chequeNumber) {
        data.instrumentDetails = {
          bankName: formData.bankName,
          chequeNumber: formData.chequeNumber,
        };
      }

      // Add notes if provided
      if (formData.notes.trim()) {
        data.notes = formData.notes.trim();
      }

      const expense = await expensesApi.create(data);
      showSuccess('Expense created successfully!');
      onSuccess(expense);
      onClose();

      // Reset form
      setFormData({
        categoryId: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        vendor: '',
        description: '',
        paymentMethod: PaymentMethod.CASH,
        bankName: '',
        chequeNumber: '',
        notes: '',
      });
    } catch (error: unknown) {
      console.error('Failed to create expense:', error);
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
      title="Create New Expense"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalContent>
          {loadingData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading categories...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expense Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No categories found. Please create a category first.
                  </p>
                )}
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
                  placeholder="e.g., 5000"
                />
              </div>

              {/* Expense Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expense Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vendor
                </label>
                <input
                  type="text"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Vendor or supplier name (optional)"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  maxLength={1000}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe the expense..."
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={PaymentMethod.CASH}>Cash</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                  <option value={PaymentMethod.CHEQUE}>Cheque</option>
                  <option value={PaymentMethod.MOBILE_WALLET}>Mobile Wallet</option>
                </select>
              </div>

              {/* Cheque Details (conditional) */}
              {formData.paymentMethod === PaymentMethod.CHEQUE && (
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
                  rows={2}
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
              disabled={loading || loadingData || categories.length === 0}
              className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
