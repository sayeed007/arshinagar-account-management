'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { landApi, RSNumber, Plot, PlotStatus, UnitType } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage, AppError } from '@/lib/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';

export default function RSNumberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [rsNumber, setRSNumber] = useState<RSNumber | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [plotsLoading, setPlotsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    rsNumber: '',
    projectName: '',
    location: '',
    totalArea: '',
    unitType: 'Katha' as UnitType,
    description: '',
  });

  useEffect(() => {
    if (params.id) {
      loadRSNumber();
      loadPlots();
    }
  }, [params.id]);

  const loadRSNumber = async () => {
    try {
      setLoading(true);
      const data = await landApi.rsNumbers.getById(params.id as string);
      setRSNumber(data);
    } catch (error: unknown) {
      console.error('Failed to load RS Number:', error);
      showError(getErrorMessage(error));
      router.push('/land/rs-numbers');
    } finally {
      setLoading(false);
    }
  };

  const loadPlots = async () => {
    try {
      setPlotsLoading(true);
      const response = await landApi.getAllPlots({
        rsNumberId: params.id as string,
        page: 1,
        limit: 100,
      });
      setPlots(response.data || []);
    } catch (error: unknown) {
      console.error('Failed to load plots:', error);
    } finally {
      setPlotsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await landApi.rsNumbers.delete(params.id as string);
      showSuccess('RS Number deleted successfully');
      router.push('/land/rs-numbers');
    } catch (error: unknown) {
      console.error('Failed to delete RS Number:', error);
      showError(getErrorMessage(error));
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenEditModal = () => {
    if (rsNumber) {
      setFormData({
        rsNumber: rsNumber.rsNumber || '',
        projectName: rsNumber.projectName || '',
        location: rsNumber.location || '',
        totalArea: rsNumber.totalArea.toString() || '',
        unitType: rsNumber.unitType || 'Katha',
        description: rsNumber.description || '',
      });
      setShowEditModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setFormData({
      rsNumber: '',
      projectName: '',
      location: '',
      totalArea: '',
      unitType: 'Katha',
      description: '',
    });
  };

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const newTotalArea = parseFloat(formData.totalArea);

      // Validate: new total area must be >= (sold + allocated)
      if (rsNumber && newTotalArea < (rsNumber.soldArea + rsNumber.allocatedArea)) {
        showError(
          `Total area cannot be less than sold + allocated area.\n\nSold: ${rsNumber.soldArea} ${rsNumber.unitType}\nAllocated: ${rsNumber.allocatedArea} ${rsNumber.unitType}\nMinimum required: ${rsNumber.soldArea + rsNumber.allocatedArea} ${rsNumber.unitType}\nYou entered: ${newTotalArea} ${formData.unitType}`
        );
        setUpdating(false);
        return;
      }

      // Prepare data
      const data: any = {
        rsNumber: formData.rsNumber.trim(),
        projectName: formData.projectName.trim(),
        location: formData.location.trim(),
        totalArea: newTotalArea,
        unitType: formData.unitType,
      };

      // Add optional description
      if (formData.description.trim()) {
        data.description = formData.description.trim();
      }

      await landApi.rsNumbers.update(params.id as string, data);
      showSuccess('RS Number updated successfully!');
      handleCloseEditModal();
      loadRSNumber(); // Reload RS Number data
    } catch (error: unknown) {
      console.error('Failed to update RS Number:', error);
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
      setUpdating(false);
    }
  };

  const getUtilizationPercentage = (rs: RSNumber) => {
    if (rs.totalArea === 0) return 0;
    return ((rs.soldArea + rs.allocatedArea) / rs.totalArea) * 100;
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadgeClass = (status: PlotStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Reserved':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Sold':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Blocked':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading RS Number...</p>
        </div>
      </div>
    );
  }

  if (!rsNumber) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">RS Number not found</p>
        <Link
          href="/land/rs-numbers"
          className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
        >
          Back to RS Numbers
        </Link>
      </div>
    );
  }

  const utilization = getUtilizationPercentage(rsNumber);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/land/rs-numbers" className="hover:text-indigo-600">
            RS Numbers
          </Link>
          <span>/</span>
          <span>{rsNumber.rsNumber}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{rsNumber.rsNumber}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rsNumber.projectName}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* RS Number Info */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Plot Information
            </h2>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  RS Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                  {rsNumber.rsNumber}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Project Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {rsNumber.projectName}
                </dd>
              </div>

              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Location
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {rsNumber.location}
                </dd>
              </div>

              {rsNumber.description && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {rsNumber.description}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created At
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(rsNumber.createdAt).toLocaleDateString()}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rsNumber.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                  >
                    {rsNumber.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Area Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Area Statistics
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Area:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {rsNumber.totalArea} {rsNumber.unitType}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Sold Area:</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {rsNumber.soldArea} {rsNumber.unitType}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Allocated Area:</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {rsNumber.allocatedArea} {rsNumber.unitType}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Remaining Area:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {rsNumber.remainingArea} {rsNumber.unitType}
                </span>
              </div>

              {/* Utilization Bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Utilization</span>
                  <span>{utilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getUtilizationColor(utilization)}`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Plots List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Plots ({plots.length})
              </h2>
              <Link
                href={`/land/rs-numbers/${rsNumber._id}/plots/new`}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                + Add Plot
              </Link>
            </div>

            {plotsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">Loading plots...</p>
              </div>
            ) : plots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No plots created yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Add plots to start managing land allocations
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Plot #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Area
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {plots.map((plot) => (
                      <tr
                        key={plot._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {plot.plotNumber}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {plot.area} {rsNumber.unitType}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                              plot.status
                            )}`}
                          >
                            {plot.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Link
                            href={`/land/plots/${plot._id}`}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleOpenEditModal}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Edit RS Number
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete RS Number
              </button>
              <Link
                href="/land/rs-numbers"
                className="block w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Back to List
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete RS Number"
        message={`Are you sure you want to delete RS Number "${rsNumber?.rsNumber}"?\n\nThis will also delete all ${plots.length} associated plot${plots.length !== 1 ? 's' : ''}. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleting}
      />

      {/* Edit RS Number Modal */}
      <Modal isOpen={showEditModal} onClose={handleCloseEditModal} title="Edit RS Number" size="lg">
        <form onSubmit={handleUpdate}>
          <ModalContent>
            {/* Warning Banner */}
            {rsNumber && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Total area must be at least{' '}
                  <strong>{rsNumber.soldArea + rsNumber.allocatedArea} {rsNumber.unitType}</strong> (Sold:{' '}
                  {rsNumber.soldArea} + Allocated: {rsNumber.allocatedArea})
                </p>
              </div>
            )}

            <div className="space-y-4">
              {/* RS Number */}
              <div>
                <label htmlFor="rsNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  RS Number *
                </label>
                <input
                  type="text"
                  id="rsNumber"
                  name="rsNumber"
                  value={formData.rsNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="e.g., RS-1234"
                />
              </div>

              {/* Project Name */}
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Enter project name"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Enter location"
                />
              </div>

              {/* Total Area and Unit Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="totalArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Area *
                  </label>
                  <input
                    type="number"
                    id="totalArea"
                    name="totalArea"
                    value={formData.totalArea}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="unitType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit Type *
                  </label>
                  <select
                    id="unitType"
                    name="unitType"
                    value={formData.unitType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="Katha">Katha</option>
                    <option value="Decimal">Decimal</option>
                    <option value="Acre">Acre</option>
                    <option value="Bigha">Bigha</option>
                    <option value="Square Feet">Square Feet</option>
                  </select>
                </div>
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Enter description (optional)"
                />
              </div>
            </div>
          </ModalContent>

          <ModalFooter>
            <button
              type="button"
              onClick={handleCloseEditModal}
              disabled={updating}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update RS Number'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
