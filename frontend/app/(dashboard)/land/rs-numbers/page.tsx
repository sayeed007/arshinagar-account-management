'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { landApi, RSNumber } from '@/lib/api';

export default function RSNumbersPage() {
  const [rsNumbers, setRSNumbers] = useState<RSNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

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
    } catch (error: any) {
      console.error('Failed to load RS Numbers:', error);
      alert(error.response?.data?.error?.message || 'Failed to load RS Numbers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRSNumbers();
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
        <Link
          href="/dashboard/land/rs-numbers/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Add RS Number
        </Link>
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
                  href={`/dashboard/land/rs-numbers/${rs._id}`}
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
    </div>
  );
}
