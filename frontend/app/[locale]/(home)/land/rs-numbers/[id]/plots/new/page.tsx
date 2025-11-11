'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { landApi, RSNumber, PlotStatus } from '@/lib/api';

export default function NewPlotPage() {
  const params = useParams();
  const router = useRouter();
  const [rsNumber, setRSNumber] = useState<RSNumber | null>(null);
  const [loading, setLoading] = useState(false);
  const [rsLoading, setRsLoading] = useState(true);
  const [formData, setFormData] = useState({
    plotNumber: '',
    area: '',
    status: 'Available' as PlotStatus,
    description: '',
  });

  useEffect(() => {
    if (params.id) {
      loadRSNumber();
    }
  }, [params.id]);

  const loadRSNumber = async () => {
    try {
      setRsLoading(true);
      const data = await landApi.rsNumbers.getById(params.id as string);
      setRSNumber(data);
    } catch (error: any) {
      console.error('Failed to load RS Number:', error);
      alert(error.response?.data?.error?.message || 'Failed to load RS Number');
      router.push('/land/rs-numbers');
    } finally {
      setRsLoading(false);
    }
  };

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
      const plotArea = parseFloat(formData.area);

      // Validate area against remaining area
      if (rsNumber && plotArea > rsNumber.remainingArea) {
        alert(
          `Insufficient area. Available: ${rsNumber.remainingArea} ${rsNumber.unitType}\nYou tried to allocate: ${plotArea} ${rsNumber.unitType}`
        );
        setLoading(false);
        return;
      }

      // Prepare data
      const data: any = {
        rsNumberId: params.id,
        plotNumber: formData.plotNumber.trim(),
        area: plotArea,
        status: formData.status,
      };

      // Add optional description
      if (formData.description.trim()) {
        data.description = formData.description.trim();
      }

      await landApi.plots.create(data);
      alert('Plot created successfully!');
      router.push(`/land/rs-numbers/${params.id}`);
    } catch (error: any) {
      console.error('Failed to create plot:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to create plot';
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

  if (rsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
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
          <Link
            href={`/land/rs-numbers/${params.id}`}
            className="hover:text-indigo-600"
          >
            {rsNumber.rsNumber}
          </Link>
          <span>/</span>
          <span>New Plot</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Plot</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Create a new plot under {rsNumber.rsNumber}
        </p>
      </div>

      {/* Area Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Available Area
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700 dark:text-blue-300">Total Area:</span>
            <span className="ml-2 font-semibold text-blue-900 dark:text-blue-100">
              {rsNumber.totalArea} {rsNumber.unitType}
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">Remaining:</span>
            <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
              {rsNumber.remainingArea} {rsNumber.unitType}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Plot Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plot Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Area ({rsNumber.unitType}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
              min="0.01"
              max={rsNumber.remainingArea}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder={`Max: ${rsNumber.remainingArea}`}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Area of the plot (cannot exceed remaining area: {rsNumber.remainingArea}{' '}
              {rsNumber.unitType})
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
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

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Plot'}
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
