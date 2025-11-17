'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Approve Cancellation
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Approving...
              </>
            ) : (
              'Approve'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
