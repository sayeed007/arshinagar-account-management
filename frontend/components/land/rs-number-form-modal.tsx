'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';
import { landApi, RSNumber, UnitType } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage, AppError } from '@/lib/types';

interface RSNumberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  rsNumber?: RSNumber | null;
  onSuccess: (rsNumber: RSNumber) => void;
}

export function RSNumberFormModal({
  isOpen,
  onClose,
  rsNumber,
  onSuccess,
}: RSNumberFormModalProps) {
  const isEditMode = !!rsNumber;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rsNumber: '',
    projectName: '',
    location: '',
    totalArea: '',
    unitType: UnitType.KATHA,
    description: '',
  });

  // Initialize form data when rsNumber changes
  useEffect(() => {
    if (rsNumber) {
      setFormData({
        rsNumber: rsNumber.rsNumber || '',
        projectName: rsNumber.projectName || '',
        location: rsNumber.location || '',
        totalArea: rsNumber.totalArea?.toString() || '',
        unitType: rsNumber.unitType || UnitType.KATHA,
        description: rsNumber.description || '',
      });
    } else {
      setFormData({
        rsNumber: '',
        projectName: '',
        location: '',
        totalArea: '',
        unitType: UnitType.KATHA,
        description: '',
      });
    }
  }, [rsNumber]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Auto-uppercase RS Number
    if (name === 'rsNumber') {
      setFormData({
        ...formData,
        [name]: value.toUpperCase(),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = {
        rsNumber: formData.rsNumber.trim(),
        projectName: formData.projectName.trim(),
        location: formData.location.trim(),
        totalArea: parseFloat(formData.totalArea),
        unitType: formData.unitType,
      };

      // Add optional description
      if (formData.description.trim()) {
        data.description = formData.description.trim();
      }

      let updatedRSNumber: RSNumber;

      if (isEditMode && rsNumber) {
        // Update RS Number
        updatedRSNumber = await landApi.rsNumbers.update(rsNumber._id, data);
        showSuccess('RS Number updated successfully!');
      } else {
        // Create RS Number
        updatedRSNumber = await landApi.rsNumbers.create(data);
        showSuccess('RS Number created successfully!');
      }

      onSuccess(updatedRSNumber);
      onClose();
    } catch (error: unknown) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} RS Number:`, error);
      const errorMessage = getErrorMessage(error);
      const details = (error as AppError).response?.data?.error?.details;

      if (details) {
        const fieldErrors = Object.entries(details)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        showError(`Validation errors:\n${fieldErrors}`);
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Calculate minimum total area for edit mode
  const minTotalArea = rsNumber
    ? rsNumber.soldArea + rsNumber.allocatedArea
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit RS Number' : 'Add New RS Number'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalContent>
          {/* Warning Banner for Edit Mode */}
          {isEditMode && rsNumber && minTotalArea > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Total area must be at least{' '}
                <strong>
                  {minTotalArea} {rsNumber.unitType}
                </strong>{' '}
                (Sold: {rsNumber.soldArea} + Allocated: {rsNumber.allocatedArea})
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* RS Number */}
            <div>
              <label
                htmlFor="rsNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                RS Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="rsNumber"
                name="rsNumber"
                value={formData.rsNumber}
                onChange={handleChange}
                required
                minLength={1}
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., RS-1234"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Unique identifier for the land parcel (auto-converted to uppercase)
              </p>
            </div>

            {/* Project Name */}
            <div>
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Arshinagar Housing Project"
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Mouza: Arshinagar, JL No: 25"
              />
            </div>

            {/* Total Area and Unit Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="totalArea"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Total Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="totalArea"
                  name="totalArea"
                  value={formData.totalArea}
                  onChange={handleChange}
                  required
                  min={isEditMode ? minTotalArea : 0.01}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isEditMode && minTotalArea > 0
                    ? `Minimum: ${minTotalArea}`
                    : 'Must be greater than 0'}
                </p>
              </div>
              <div>
                <label
                  htmlFor="unitType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Unit Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="unitType"
                  name="unitType"
                  value={formData.unitType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={UnitType.ACRE}>{UnitType.ACRE}</option>
                  <option value={UnitType.KATHA}>{UnitType.KATHA}</option>
                  <option value={UnitType.SQFT}>{UnitType.SQFT}</option>
                  <option value={UnitType.DECIMAL}>{UnitType.DECIMAL}</option>
                  <option value={UnitType.BIGHA}>{UnitType.BIGHA}</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={1000}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Additional details about the land parcel (optional)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Optional: Add any additional information about this RS Number
              </p>
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
              className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update RS Number'
                : 'Create RS Number'}
            </button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
