'use client';

import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';
import { SMSTemplate, SMSCategory } from '@/lib/api';
import { Calendar, Code, Globe, Tag, CheckCircle, XCircle } from 'lucide-react';

interface SMSTemplateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: SMSTemplate | null;
  onEdit?: (template: SMSTemplate) => void;
}

const categoryLabels: Record<SMSCategory, string> = {
  [SMSCategory.PAYMENT_CONFIRMATION]: 'Payment Confirmation',
  [SMSCategory.INSTALLMENT_REMINDER]: 'Installment Reminder',
  [SMSCategory.MISSED_INSTALLMENT]: 'Missed Installment',
  [SMSCategory.CHEQUE_DUE]: 'Cheque Due',
  [SMSCategory.BULK]: 'Bulk SMS',
  [SMSCategory.MANUAL]: 'Manual SMS',
};

export function SMSTemplateDetailsModal({
  isOpen,
  onClose,
  template,
  onEdit,
}: SMSTemplateDetailsModalProps) {
  if (!template) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Template Details" size="lg">
      <ModalContent>
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {template.name}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    template.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {template.isActive ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Template Code & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Code className="w-4 h-4" />
                Template Code
              </div>
              <div className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                {template.templateCode}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Tag className="w-4 h-4" />
                Category
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {categoryLabels[template.category]}
              </div>
            </div>
          </div>

          {/* Variables */}
          {template.variables.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Variables
              </h4>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variable) => (
                  <div
                    key={variable}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-mono"
                  >
                    {'{' + variable + '}'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {/* English Message */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="w-4 h-4" />
                Message (English)
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-sans">
                  {template.messageEN}
                </pre>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Length: {template.messageEN.length} characters
              </div>
            </div>

            {/* Bangla Message */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="w-4 h-4" />
                Message (Bangla)
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-sans">
                  {template.messageBN}
                </pre>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Length: {template.messageBN.length} characters
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Created: {formatDate(template.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Updated: {formatDate(template.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onEdit(template);
                onClose();
              }}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Template
            </button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
}
