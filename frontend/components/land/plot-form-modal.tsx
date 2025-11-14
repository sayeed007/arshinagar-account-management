'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';
import { landApi, Plot, RSNumber, PlotStatus } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage, AppError } from '@/lib/types';

interface PlotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  rsNumber: RSNumber;
  plot?: Plot | null;
  onSuccess: () => void;
}

export function PlotFormModal({
  isOpen,
  onClose,
  rsNumber,
  plot,
  onSuccess,
}: PlotFormModalProps) {
  const isEditMode = !!plot;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plotNumber: '',
    area: '',
    status: 'Available' as PlotStatus,
    description: '',
  });

  // Initialize form data when plot changes
  useEffect(() => {
    if (plot) {
      setFormData({
        plotNumber: plot.plotNumber || '',
        area: plot.area.toString() || '',
        status: plot.status || PlotStatus.AVAILABLE,
        description: plot.description || '',
      });
    } else {
      setFormData({
        plotNumber: '',
        area: '',
        status: PlotStatus.AVAILABLE,
        description: '',
      });
    }
  }, [plot]);

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
      const newArea = parseFloat(formData.area);

      if (isEditMode && plot) {
        // Edit mode validation
        const oldArea = plot.area || 0;

        if (newArea > oldArea) {
          const areaIncrease = newArea - oldArea;
          if (areaIncrease > rsNumber.remainingArea) {
            showError(
              `Insufficient area. Available: ${rsNumber.remainingArea} ${rsNumber.unitType}\nYou tried to add: ${areaIncrease} ${rsNumber.unitType}\nCurrent plot area: ${oldArea} ${rsNumber.unitType}\nNew plot area: ${newArea} ${rsNumber.unitType}`
            );
            setLoading(false);
            return;
          }
        }

        // Update plot
        const data: any = {
          plotNumber: formData.plotNumber.trim(),
          area: newArea,
          status: formData.status,
        };

        if (formData.description.trim()) {
          data.description = formData.description.trim();
        }

        await landApi.plots.update(plot._id, data);
        showSuccess('Plot updated successfully!');
      } else {
        // Create mode validation
        if (newArea > rsNumber.remainingArea) {
          showError(
            `Insufficient area. Available: ${rsNumber.remainingArea} ${rsNumber.unitType}\nYou tried to allocate: ${newArea} ${rsNumber.unitType}`
          );
          setLoading(false);
          return;
        }

        // Create plot
        const data: Record<string, unknown> = {
          rsNumberId: rsNumber._id,
          plotNumber: formData.plotNumber.trim(),
          area: newArea,
          status: formData.status,
        };

        if (formData.description.trim()) {
          data.description = formData.description.trim();
        }

        await landApi.plots.create(data);
        showSuccess('Plot created successfully!');
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} plot:`, error);
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

  // Calculate max area allowed
  const maxAreaAllowed = isEditMode && plot
    ? rsNumber.remainingArea + plot.area
    : rsNumber.remainingArea;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Plot' : 'Add New Plot'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalContent>
          {/* Area Information Banner */}
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {isEditMode ? 'Area Information' : 'Available Area'}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {isEditMode && plot && (
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Current Plot Area:</span>
                  <span className="ml-2 font-semibold text-blue-900 dark:text-blue-100">
                    {plot.area} {rsNumber.unitType}
                  </span>
                </div>
              )}
              {!isEditMode && (
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Total Area:</span>
                  <span className="ml-2 font-semibold text-blue-900 dark:text-blue-100">
                    {Number(rsNumber.totalArea)} {rsNumber.unitType}
                  </span>
                </div>
              )}
              <div>
                <span className="text-blue-700 dark:text-blue-300">
                  {isEditMode ? 'RS Remaining:' : 'Remaining:'}
                </span>
                <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                  {Number(rsNumber.remainingArea)} {rsNumber.unitType}
                </span>
              </div>
            </div>
            {isEditMode && (
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                ℹ️ Maximum plot area: {maxAreaAllowed.toFixed(2)} {rsNumber.unitType} (current + remaining)
              </p>
            )}
          </div>

          <div className="space-y-4">
            {/* Plot Number */}
            <div>
              <label htmlFor="plotNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Plot Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="plotNumber"
                name="plotNumber"
                value={formData.plotNumber}
                onChange={handleChange}
                required
                minLength={1}
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g., P-001, Plot-1A, 123"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Unique identifier for the plot within this RS Number
              </p>
            </div>

            {/* Area */}
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Area ({rsNumber.unitType}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                min="0.01"
                max={maxAreaAllowed}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder={`Max: ${maxAreaAllowed.toFixed(2)}`}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isEditMode
                  ? `Max: ${maxAreaAllowed.toFixed(2)} ${rsNumber.unitType}`
                  : `Cannot exceed remaining area: ${rsNumber.remainingArea} ${rsNumber.unitType}`}
              </p>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
                <option value="Blocked">Blocked</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current status of the plot
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Additional details about the plot (optional)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Optional: Add any additional information about this plot
              </p>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
              ? 'Update Plot'
              : 'Create Plot'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
