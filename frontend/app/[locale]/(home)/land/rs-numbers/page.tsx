'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { landApi, RSNumber, UnitType } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';

export default function RSNumbersPage() {
  const [rsNumbers, setRSNumbers] = useState<RSNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    rsNumber: '',
    projectName: '',
    location: '',
    totalArea: '',
    unitType: 'Katha' as UnitType,
    description: '',
  });

  useEffect(() => {
    loadRSNumbers();
  }, [page, search]);

  const loadRSNumbers = async () => {
    try {
      setLoading(true);
      const response = await landApi.rsNumbers.getAll({
        page,
        limit: 20,
        search: search || undefined,
        isActive: true,
      });

      setRSNumbers(response.data || []);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
        setTotal(response.pagination.total);
      }
    } catch (error: unknown) {
      console.error('Failed to load RS Numbers:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRSNumbers();
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setFormData({
      rsNumber: '',
      projectName: '',
      location: '',
      totalArea: '',
      unitType: 'Katha',
      description: '',
    });
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Prepare data
      const data: Record<string, unknown> = {
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

      await landApi.rsNumbers.create(data);
      showSuccess('RS Number created successfully!');
      handleCloseCreateModal();
      loadRSNumbers(); // Refresh the list
    } catch (error) {
      console.error('Failed to create RS Number:', error);
      showError(getErrorMessage(error));
    } finally {
      setCreating(false);
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

  const getAvailabilityStatus = (percentage: number) => {
    if (percentage >= 100) return 'Fully Utilized';
    if (percentage >= 75) return 'Almost Full';
    if (percentage >= 50) return 'Partially Available';
    return 'Available';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RS Numbers</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {total} RS Numbers
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Add RS Number
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by RS Number, project, or location..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Grid View */}
      {loading ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading RS Numbers...</p>
        </div>
      ) : rsNumbers.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-600 dark:text-gray-400">No RS Numbers found</p>
          {search && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Try adjusting your search
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rsNumbers.map((rs) => {
              const utilization = getUtilizationPercentage(rs);
              const status = getAvailabilityStatus(utilization);

              return (
                <Link
                  key={rs._id}
                  href={`/land/rs-numbers/${rs._id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {rs.rsNumber}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {rs.projectName}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        utilization >= 100
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : utilization >= 75
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    📍 {rs.location}
                  </p>

                  {/* Area Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Area:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {rs.totalArea} {rs.unitType}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sold:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {rs.soldArea} {rs.unitType}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Allocated:</span>
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                        {rs.allocatedArea} {rs.unitType}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {rs.remainingArea} {rs.unitType}
                      </span>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Utilization</span>
                      <span>{utilization.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getUtilizationColor(utilization)}`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create RS Number Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        title="Add New RS Number"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <ModalContent>
            <div className="space-y-4">
              {/* RS Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  RS Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="rsNumber"
                  value={formData.rsNumber}
                  onChange={handleChange}
                  required
                  minLength={1}
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., RS-123 or 123/A"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Unique identifier for the land parcel (will be auto-converted to uppercase)
                </p>
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
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

              {/* Total Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalArea"
                  value={formData.totalArea}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., 100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Total area of the land parcel (must be greater than 0)
                </p>
              </div>

              {/* Unit Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="unitType"
                  value={formData.unitType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Acre">Acre</option>
                  <option value="Katha">Katha</option>
                  <option value="Sq Ft">Sq Ft (Square Feet)</option>
                  <option value="Decimal">Decimal</option>
                  <option value="Bigha">Bigha</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select the unit of measurement for the land area
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
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
                type="submit"
                disabled={creating}
                className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create RS Number'}
              </button>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                disabled={creating}
                className="flex-1 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
