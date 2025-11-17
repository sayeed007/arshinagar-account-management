'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';

interface CancellationApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (notes?: string) => Promise<void>;
  loading?: boolean;
}

export function CancellationApproveModal({
  isOpen,
  onClose,
  onApprove,
  loading = false,
}: CancellationApproveModalProps) {
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    await onApprove(notes || undefined);
    setNotes('');
  };

  const handleClose = () => {
    if (!loading) {
      setNotes('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Approve Cancellation">
      <ModalContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Are you sure you want to approve this cancellation? This will allow refund processing to begin.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
            placeholder="Add any notes..."
          />
        </div>
      </ModalContent>

      <ModalFooter>
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Approving...' : 'Approve'}
          </button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
