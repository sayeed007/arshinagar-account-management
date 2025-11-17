'use client';

import { X } from 'lucide-react';
import { SMSLog, SMSStatus } from '@/lib/api';

interface SMSLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: SMSLog | null;
}

export function SMSLogDetailsModal({ isOpen, onClose, log }: SMSLogDetailsModalProps) {
  if (!isOpen || !log) return null;

  // Type assertion after null check
  const smsLog = log as SMSLog;

  const getStatusColor = (status: SMSStatus) => {
    switch (status) {
      case SMSStatus.SENT:
      case SMSStatus.DELIVERED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case SMSStatus.FAILED:
      case SMSStatus.BOUNCED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case SMSStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SMS Log Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(smsLog.status)}`}>
              {smsLog.status}
            </span>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-gray-900 dark:text-white font-mono">{smsLog.phone}</p>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-gray-900 dark:text-white capitalize">
                {smsLog.category.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                {smsLog.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Length: {smsLog.message.length} characters
              </p>
            </div>
          </div>

          {/* Template Code (if available) */}
          {smsLog.templateCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Template Code
              </label>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-gray-900 dark:text-white font-mono">{smsLog.templateCode}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created At
              </label>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(smsLog.createdAt)}</p>
              </div>
            </div>
            {smsLog.sentAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sent At
                </label>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(smsLog.sentAt)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Gateway Response (if available) */}
          {smsLog.gatewayResponse && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gateway Response
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <pre className="text-xs text-gray-900 dark:text-white whitespace-pre-wrap break-words font-mono">
                  {JSON.stringify(smsLog.gatewayResponse as Record<string, unknown>, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Error Message (if available) */}
          {smsLog.errorMessage && (
            <div>
              <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                Error Message
              </label>
              <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-900 dark:text-red-200 whitespace-pre-wrap break-words">
                  {smsLog.errorMessage}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
