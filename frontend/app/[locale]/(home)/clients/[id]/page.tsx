'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { clientApi, Client, salesApi, Sale, SaleStatus } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { ClientFormModal } from '@/components/clients/client-form-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadClient();
    }
  }, [params.id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await clientApi.getById(params.id as string);
      setClient(data);
      // Load sales for this client
      loadSales(params.id as string);
    } catch (error: unknown) {
      console.error('Failed to load client:', error);
      showError(getErrorMessage(error));
      router.push('/clients');
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async (clientId: string) => {
    try {
      setLoadingSales(true);
      const response = await salesApi.getAll({ clientId, page: 1, limit: 100 });
      setSales(response.data || []);
    } catch (error: unknown) {
      console.error('Failed to load sales:', error);
    } finally {
      setLoadingSales(false);
    }
  };

  const handleEditSuccess = () => {
    loadClient(); // Reload client data
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await clientApi.delete(params.id as string);
      showSuccess('Client deleted successfully');
      setShowDeleteConfirm(false);
      router.push('/clients');
    } catch (error: unknown) {
      console.error('Failed to delete client:', error);
      showError(getErrorMessage(error));
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Client not found</p>
        <Link href="/clients" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
          Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Clients', href: '/clients' },
          { label: client.name },
        ]}
        title={client.name}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Client Info */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Client Information
            </h2>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Primary Phone
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {client.phone}
                </dd>
              </div>

              {client.alternatePhone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Alternate Phone
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {client.alternatePhone}
                  </dd>
                </div>
              )}

              {client.email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {client.email}
                  </dd>
                </div>
              )}

              {client.nid && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    NID Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {client.nid}
                  </dd>
                </div>
              )}

              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {client.address}
                </dd>
              </div>

              {client.notes && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Notes
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {client.notes}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created At
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(client.createdAt).toLocaleDateString()}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${client.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                  >
                    {client.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Purchase History */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Purchase History
            </h2>

            {loadingSales ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading sales...</p>
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No purchase history found for this client.
                </p>
                <Link
                  href="/sales/new"
                  className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Create New Sale
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sale #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Plot
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Paid
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Due
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sales.map((sale) => {
                      const plotInfo = typeof sale.plotId === 'object' ? sale.plotId : null;
                      return (
                        <tr key={sale._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {sale.saleNumber}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {plotInfo ? `${plotInfo.plotNumber}` : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ৳{sale.totalPrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                            ৳{sale.paidAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-orange-600 dark:text-orange-400">
                            ৳{sale.dueAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${sale.status === SaleStatus.COMPLETED
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : sale.status === SaleStatus.ACTIVE
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : sale.status === SaleStatus.CANCELLED
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}
                            >
                              {sale.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <Link
                              href={`/sales/${sale._id}`}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Total Sales</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {sales.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Total Value</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        ৳{sales.reduce((sum, sale) => sum + sale.totalPrice, 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Total Due</p>
                      <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        ৳{sales.reduce((sum, sale) => sum + sale.dueAmount, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
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
                onClick={() => setShowEditModal(true)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Edit Client
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Client
              </button>
              <Link
                href="/clients"
                className="block w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Back to List
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Client Modal */}
      <ClientFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        client={client}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Client"
        message={`Are you sure you want to delete "${client?.name}"?\n\nThis action cannot be undone. All associated data including purchase history will be permanently removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
