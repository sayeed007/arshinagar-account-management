'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { salesApi, clientApi, landApi, Client, Plot, PlotStatus } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';

export default function NewSalePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    clientId: '',
    plotId: '',
    totalPrice: '',
    saleDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [clientsRes, plotsRes] = await Promise.all([
        clientApi.getAll({ page: 1, limit: 100, isActive: true }),
        landApi.getAllPlots({ page: 1, limit: 100, status: PlotStatus.AVAILABLE }),
      ]);
      setClients(clientsRes.data || []);
      setPlots(plotsRes.data || []);
    } catch (error: unknown) {
      console.error('Failed to load data:', error);
      showError('Failed to load clients and plots');
    } finally {
      setLoadingData(false);
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
      const data = {
        clientId: formData.clientId,
        plotId: formData.plotId,
        totalPrice: parseFloat(formData.totalPrice),
        saleDate: formData.saleDate,
        notes: formData.notes.trim() || undefined,
        stages: [
          {
            stageName: 'Booking',
            plannedAmount: parseFloat(formData.totalPrice) * 0.1, // 10% booking
            receivedAmount: 0,
            dueAmount: parseFloat(formData.totalPrice) * 0.1,
            status: 'Pending',
          },
          {
            stageName: 'Installments',
            plannedAmount: parseFloat(formData.totalPrice) * 0.7, // 70% installments
            receivedAmount: 0,
            dueAmount: parseFloat(formData.totalPrice) * 0.7,
            status: 'Pending',
          },
          {
            stageName: 'Registration',
            plannedAmount: parseFloat(formData.totalPrice) * 0.15, // 15% registration
            receivedAmount: 0,
            dueAmount: parseFloat(formData.totalPrice) * 0.15,
            status: 'Pending',
          },
          {
            stageName: 'Handover',
            plannedAmount: parseFloat(formData.totalPrice) * 0.05, // 5% handover
            receivedAmount: 0,
            dueAmount: parseFloat(formData.totalPrice) * 0.05,
            status: 'Pending',
          },
        ],
      };

      const sale = await salesApi.create(data);
      showSuccess('Sale created successfully!');
      router.push(`/sales/${sale._id}`);
    } catch (error: unknown) {
      console.error('Failed to create sale:', error);
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Sale</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Create a new land sale transaction
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} - {client.phone}
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No clients found.{' '}
                <Link href="/clients/new" className="underline">
                  Create a client first
                </Link>
              </p>
            )}
          </div>

          {/* Plot Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plot <span className="text-red-500">*</span>
            </label>
            <select
              name="plotId"
              value={formData.plotId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">Select an available plot</option>
              {plots.map((plot) => (
                <option key={plot._id} value={plot._id}>
                  {plot.plotNumber} - {plot.area} {plot.unitType}
                </option>
              ))}
            </select>
            {plots.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No available plots found. Plots must be in "Available" status to be sold.
              </p>
            )}
          </div>

          {/* Total Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Price (BDT) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="totalPrice"
              value={formData.totalPrice}
              onChange={handleChange}
              required
              min="1"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="e.g., 5000000"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the total sale price in Bangladeshi Taka
            </p>
          </div>

          {/* Sale Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sale Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="saleDate"
              value={formData.saleDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              maxLength={1000}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Additional notes about this sale (optional)"
            />
          </div>

          {/* Payment Stages Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Default Payment Stages
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
              The following payment stages will be automatically created:
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Booking: 10% of total price</li>
              <li>• Installments: 70% of total price</li>
              <li>• Registration: 15% of total price</li>
              <li>• Handover: 5% of total price</li>
            </ul>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              You can adjust these stages after creating the sale.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading || clients.length === 0 || plots.length === 0}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Sale'}
          </button>
          <Link
            href="/sales"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
