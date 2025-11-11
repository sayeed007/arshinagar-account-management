'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { landApi, RSNumber, UnitType } from '@/lib/api';

export default function EditRSNumberPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [rsNumber, setRSNumber] = useState<RSNumber | null>(null);
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
    }
  }, [params.id]);

  const loadRSNumber = async () => {
    try {
      setDataLoading(true);
      const data = await landApi.rsNumbers.getById(params.id as string);
      setRSNumber(data);
      setFormData({
        rsNumber: data.rsNumber || '',
        projectName: data.projectName || '',
        location: data.location || '',
        totalArea: data.totalArea.toString() || '',
        unitType: data.unitType || 'Katha',
        description: data.description || '',
      });
    } catch (error: any) {
      console.error('Failed to load RS Number:', error);
      alert(error.response?.data?.error?.message || 'Failed to load RS Number');
      router.push('/land/rs-numbers');
    } finally {
      setDataLoading(false);
    }
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
    setLoading(true);

    try {
      const newTotalArea = parseFloat(formData.totalArea);

      // Validate: new total area must be >= (sold + allocated)
      if (rsNumber && newTotalArea < (rsNumber.soldArea + rsNumber.allocatedArea)) {
        alert(
          `Total area cannot be less than sold + allocated area.\n\nSold: ${rsNumber.soldArea} ${rsNumber.unitType}\nAllocated: ${rsNumber.allocatedArea} ${rsNumber.unitType}\nMinimum required: ${rsNumber.soldArea + rsNumber.allocatedArea} ${rsNumber.unitType}\nYou entered: ${newTotalArea} ${formData.unitType}`
        );
        setLoading(false);
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
      alert('RS Number updated successfully!');
      router.push(`/land/rs-numbers/${params.id}`);
    } catch (error: any) {
      console.error('Failed to update RS Number:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to update RS Number';
      const details = error.response?.data?.error?.details;

      if (details) {
        const fieldErrors = Object.entries(details)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        alert(`Validation errors:\n${fieldErrors}`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
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

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/land/rs-numbers" className="hover:text-indigo-600">
            RS Numbers
          </Link>
          <span>/</span>
          <Link href={`/land/rs-numbers/${params.id}`} className="hover:text-indigo-600">
            {rsNumber.rsNumber}
          </Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit RS Number</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Update RS Number information
        </p>
      </div>

      {/* Current Area Info */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          Current Area Allocation
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-yellow-700 dark:text-yellow-300">Sold:</span>
            <span className="ml-2 font-semibold text-yellow-900 dark:text-yellow-100">
              {rsNumber.soldArea} {rsNumber.unitType}
            </span>
          </div>
          <div>
            <span className="text-yellow-700 dark:text-yellow-300">Allocated:</span>
            <span className="ml-2 font-semibold text-yellow-900 dark:text-yellow-100">
              {rsNumber.allocatedArea} {rsNumber.unitType}
            </span>
          </div>
        </div>
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
          ⚠️ New total area must be at least {rsNumber.soldArea + rsNumber.allocatedArea} {rsNumber.unitType}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white uppercase"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
              min={rsNumber.soldArea + rsNumber.allocatedArea}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder={`Min: ${rsNumber.soldArea + rsNumber.allocatedArea}`}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Must be at least {rsNumber.soldArea + rsNumber.allocatedArea} {rsNumber.unitType} (sold + allocated)
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Additional details about the land parcel (optional)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Optional: Add any additional information about this RS Number
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update RS Number'}
          </button>
          <Link
            href={`/land/rs-numbers/${params.id}`}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
