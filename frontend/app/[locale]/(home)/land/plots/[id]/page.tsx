'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { landApi, Plot, RSNumber, PlotStatus } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';

export default function PlotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [plot, setPlot] = useState<Plot | null>(null);
  const [rsNumber, setRSNumber] = useState<RSNumber | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadPlot();
    }
  }, [params.id]);

  const loadPlot = async () => {
    try {
      setLoading(true);
      const data = await landApi.plots.getById(params.id as string);
      setPlot(data);

      // Load associated RS Number
      if (data.rsNumberId) {
        const rsData = await landApi.rsNumbers.getById(
          typeof data.rsNumberId === 'string' ? data.rsNumberId : data.rsNumberId._id
        );
        setRSNumber(rsData);
      }
    } catch (error: any) {
      console.error('Failed to load plot:', error);
      showError(error.response?.data?.error?.message || 'Failed to load plot');
      router.push('/land/rs-numbers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this plot?')) return;

    try {
      await landApi.plots.delete(params.id as string);
      showSuccess('Plot deleted successfully');
      if (rsNumber) {
        router.push(`/land/rs-numbers/${rsNumber._id}`);
      } else {
        router.push('/land/rs-numbers');
      }
    } catch (error: any) {
      console.error('Failed to delete plot:', error);
      showError(error.response?.data?.error?.message || 'Failed to delete plot');
    }
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading plot...</p>
        </div>
      </div>
    );
  }

  if (!plot || !rsNumber) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Plot not found</p>
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
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/land/rs-numbers" className="hover:text-indigo-600">
            RS Numbers
          </Link>
          <span>/</span>
          <Link
            href={`/land/rs-numbers/${rsNumber._id}`}
            className="hover:text-indigo-600"
          >
            {rsNumber.rsNumber}
          </Link>
          <span>/</span>
          <span>Plot {plot.plotNumber}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Plot {plot.plotNumber}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {rsNumber.rsNumber} - {rsNumber.projectName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plot Info */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Plot Information
            </h2>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Plot Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                  {plot.plotNumber}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Area</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                  {plot.area} {rsNumber.unitType}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                      plot.status
                    )}`}
                  >
                    {plot.status}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  RS Number
                </dt>
                <dd className="mt-1">
                  <Link
                    href={`/land/rs-numbers/${rsNumber._id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    {rsNumber.rsNumber}
                  </Link>
                </dd>
              </div>

              {plot.description && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {plot.description}
                  </dd>
                </div>
              )}

              {plot.reservationDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Reservation Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(plot.reservationDate).toLocaleDateString()}
                  </dd>
                </div>
              )}

              {plot.saleDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Sale Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(plot.saleDate).toLocaleDateString()}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created At
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(plot.createdAt).toLocaleDateString()}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Updated
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(plot.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Client Info - Phase 3 */}
          {plot.status === 'Sold' && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Client Information
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Client information and sales details will be available in Phase 3 (Sales module)
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions
            </h2>
            <div className="space-y-3">
              <Link
                href={`/land/plots/${plot._id}/edit`}
                className="block w-full px-4 py-2 bg-indigo-600 text-white text-center rounded-md hover:bg-indigo-700"
              >
                Edit Plot
              </Link>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Plot
              </button>
              <Link
                href={`/land/rs-numbers/${rsNumber._id}`}
                className="block w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Back to RS Number
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
