'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';

interface CancellationRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string) => Promise<void>;
  loading?: boolean;
}

export function CancellationRejectModal({
  isOpen,
  onClose,
  onReject,
  loading = false,
}: CancellationRejectModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }
    await onReject(reason);
    setReason('');
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject Cancellation">
      <ModalContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Please provide a reason for rejecting this cancellation. The sale will be restored to active status.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
            placeholder="Enter rejection reason..."
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
            disabled={loading || !reason.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
