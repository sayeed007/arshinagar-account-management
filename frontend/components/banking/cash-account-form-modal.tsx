'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';
import { cashAccountsApi, CashAccount } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';

interface CashAccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: CashAccount | null;
  onSuccess: (account: CashAccount) => void;
}

export function CashAccountFormModal({
  isOpen,
  onClose,
  account,
  onSuccess,
}: CashAccountFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    openingBalance: '',
    notes: '',
  });

  const isEditMode = !!account;

  // Initialize form data when account changes
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        description: account.description || '',
        openingBalance: account.openingBalance?.toString() || '0',
        notes: account.notes || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        openingBalance: '0',
        notes: '',
      });
    }
  }, [account]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        name: formData.name,
        description: formData.description || undefined,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        notes: formData.notes || undefined,
      };

      let updatedAccount: CashAccount;

      if (isEditMode && account) {
        // Update cash account
        updatedAccount = await cashAccountsApi.update(account._id, {
          name: baseData.name,
          description: baseData.description,
          notes: baseData.notes,
        });
        showSuccess('Cash account updated successfully!');
      } else {
        // Create cash account
        updatedAccount = await cashAccountsApi.create(baseData);
        showSuccess('Cash account created successfully!');
      }

      onSuccess(updatedAccount);
      onClose();
    } catch (error: unknown) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} cash account:`, error);
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
      size="md"
      title={isEditMode ? 'Edit Cash Account' : 'Add Cash Account'}
    >
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <div className="space-y-4">
            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
                placeholder="e.g., Cash in Hand, Petty Cash"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
                placeholder="Brief description of this cash account"
              />
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Initial cash amount in this account
                </p>
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
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
