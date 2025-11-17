'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';
import { smsApi, SMSTemplate, SMSCategory } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { Plus, X } from 'lucide-react';

interface SMSTemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: SMSTemplate | null;
  onSuccess: (template: SMSTemplate) => void;
}

const categoryLabels: Record<SMSCategory, string> = {
  [SMSCategory.PAYMENT_CONFIRMATION]: 'Payment Confirmation',
  [SMSCategory.INSTALLMENT_REMINDER]: 'Installment Reminder',
  [SMSCategory.MISSED_INSTALLMENT]: 'Missed Installment',
  [SMSCategory.CHEQUE_DUE]: 'Cheque Due',
  [SMSCategory.BULK]: 'Bulk SMS',
  [SMSCategory.MANUAL]: 'Manual SMS',
};

export function SMSTemplateFormModal({
  isOpen,
  onClose,
  template,
  onSuccess,
}: SMSTemplateFormModalProps) {
  const isEditMode = !!template;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    templateCode: '',
    name: '',
    messageBN: '',
    messageEN: '',
    variables: [] as string[],
    category: SMSCategory.MANUAL,
    isActive: true,
  });
  const [newVariable, setNewVariable] = useState('');

  // Initialize form data when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        templateCode: template.templateCode,
        name: template.name,
        messageBN: template.messageBN,
        messageEN: template.messageEN,
        variables: [...template.variables],
        category: template.category,
        isActive: template.isActive,
      });
    } else {
      setFormData({
        templateCode: '',
        name: '',
        messageBN: '',
        messageEN: '',
        variables: [],
        category: SMSCategory.MANUAL,
        isActive: true,
      });
    }
  }, [template]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleAddVariable = () => {
    if (newVariable.trim() && !formData.variables.includes(newVariable.trim())) {
      setFormData({
        ...formData,
        variables: [...formData.variables, newVariable.trim()],
      });
      setNewVariable('');
    }
  };

  const handleRemoveVariable = (variableToRemove: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((v) => v !== variableToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let updatedTemplate: SMSTemplate;

      if (isEditMode && template) {
        // Update template (cannot update templateCode)
        const updateData = {
          name: formData.name,
          messageBN: formData.messageBN,
          messageEN: formData.messageEN,
          variables: formData.variables,
          category: formData.category,
          isActive: formData.isActive,
        };
        updatedTemplate = await smsApi.updateTemplate(template._id, updateData);
        showSuccess('SMS template updated successfully!');
      } else {
        // Create template
        updatedTemplate = await smsApi.createTemplate(formData);
        showSuccess('SMS template created successfully!');
      }

      onSuccess(updatedTemplate);
      onClose();
    } catch (error: unknown) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} SMS template:`, error);
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
      title={isEditMode ? 'Edit SMS Template' : 'Create New SMS Template'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <div className="space-y-4">
            {/* Template Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Template Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="templateCode"
                value={formData.templateCode}
                onChange={handleChange}
                required
                disabled={isEditMode}
                maxLength={50}
                pattern="[A-Z_]+"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                placeholder="e.g., PAYMENT_CONFIRM"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use uppercase letters and underscores only. Cannot be changed after creation.
              </p>
            </div>

            {/* Template Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Payment Confirmation SMS"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message English */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message (English) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="messageEN"
                value={formData.messageEN}
                onChange={handleChange}
                required
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Dear {clientName}, your payment of {amount} has been received. Thank you!"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use {'{variable}'} for dynamic content. Current length: {formData.messageEN.length}/500
              </p>
            </div>

            {/* Message Bangla */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message (Bangla) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="messageBN"
                value={formData.messageBN}
                onChange={handleChange}
                required
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="প্রিয় {clientName}, আপনার {amount} টাকা পেমেন্ট গ্রহণ করা হয়েছে। ধন্যবাদ!"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use {'{variable}'} for dynamic content. Current length: {formData.messageBN.length}/500
              </p>
            </div>

            {/* Variables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Variables
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVariable();
                    }
                  }}
                  placeholder="e.g., clientName, amount, plotNo"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddVariable}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.variables.map((variable) => (
                  <div
                    key={variable}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    <span>{'{' + variable + '}'}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariable(variable)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              {formData.variables.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  No variables added yet. Add variables that will be replaced with actual data when sending SMS.
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Active (template can be used for sending SMS)
              </label>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update Template'
                : 'Create Template'}
            </button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
