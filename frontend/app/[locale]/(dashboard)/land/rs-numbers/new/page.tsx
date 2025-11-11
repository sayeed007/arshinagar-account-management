'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { landApi, UnitType } from '@/lib/api';

export default function NewRSNumberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rsNumber: '',
    projectName: '',
    location: '',
    totalArea: '',
    unitType: 'Katha' as UnitType,
    description: '',
  });

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
      // Prepare data
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

      await landApi.rsNumbers.create(data);
      alert('RS Number created successfully!');
      router.push('/dashboard/land/rs-numbers');
    } catch (error: any) {
      console.error('Failed to create RS Number:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to create RS Number';
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

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New RS Number</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Create a new land record (RS Number)
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
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
            {loading ? 'Creating...' : 'Create RS Number'}
          </button>
          <Link
            href="/dashboard/land/rs-numbers"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
