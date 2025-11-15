'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';
import { bankAccountsApi, BankAccount, AccountType } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';

interface BankAccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: BankAccount | null;
  onSuccess: (account: BankAccount) => void;
}

export function BankAccountFormModal({
  isOpen,
  onClose,
  account,
  onSuccess,
}: BankAccountFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountName: '',
    accountType: AccountType.SAVINGS,
    openingBalance: '',
    notes: '',
  });

  const isEditMode = !!account;

  // Initialize form data when account changes
  useEffect(() => {
    if (account) {
      setFormData({
        bankName: account.bankName || '',
        branchName: account.branchName || '',
        accountNumber: account.accountNumber || '',
        accountName: account.accountName || '',
        accountType: account.accountType || AccountType.SAVINGS,
        openingBalance: account.openingBalance?.toString() || '0',
        notes: account.notes || '',
      });
    } else {
      setFormData({
        bankName: '',
        branchName: '',
        accountNumber: '',
        accountName: '',
        accountType: AccountType.SAVINGS,
        openingBalance: '0',
        notes: '',
      });
    }
  }, [account]);

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
      const baseData = {
        bankName: formData.bankName,
        branchName: formData.branchName || undefined,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        accountType: formData.accountType,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        notes: formData.notes || undefined,
      };

      let updatedAccount: BankAccount;

      if (isEditMode && account) {
        // Update bank account
        updatedAccount = await bankAccountsApi.update(account._id, baseData);
        showSuccess('Bank account updated successfully!');
      } else {
        // Create bank account
        updatedAccount = await bankAccountsApi.create(baseData);
        showSuccess('Bank account created successfully!');
      }

      onSuccess(updatedAccount);
      onClose();
    } catch (error: unknown) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} bank account:`, error);
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
      size="lg"
      title={isEditMode ? 'Edit Bank Account' : 'Add Bank Account'}
    >
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <div className="space-y-4">
            {/* Bank Name */}
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
                className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
                placeholder="e.g., Dutch-Bangla Bank"
              />
            </div>

            {/* Branch Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch Name
              </label>
              <input
                type="text"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
                placeholder="e.g., Gulshan Branch"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                required
                className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
                placeholder="e.g., 1234567890"
              />
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                required
                className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
                placeholder="e.g., Company Current Account"
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Type <span className="text-red-500">*</span>
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                required
                className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
              >
                <option value={AccountType.SAVINGS}>Savings</option>
                <option value={AccountType.CURRENT}>Current</option>
                <option value={AccountType.FDR}>FDR</option>
                <option value={AccountType.DPS}>DPS</option>
                <option value={AccountType.OTHER}>Other</option>
              </select>
            </div>

            {/* Opening Balance - Only for create */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Opening Balance (BDT)
                </label>
                <input
                  type="number"
                  name="openingBalance"
                  value={formData.openingBalance}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
                  placeholder="0"
                />
              </div>
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
                rows={3}
                className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
