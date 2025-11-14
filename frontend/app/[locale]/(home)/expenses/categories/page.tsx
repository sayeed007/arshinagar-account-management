'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { expenseCategoryApi, ExpenseCategory } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ExpenseCategoryFormModal } from '@/components/expenses/expense-category-form-modal';

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [categoryToToggle, setCategoryToToggle] = useState<{ id: string; name: string; currentStatus: boolean } | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [search]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await expenseCategoryApi.getAll({
        page: 1,
        limit: 100,
        search: search || undefined,
        isActive: true,
      });
      setCategories(response.data || []);
    } catch (error: unknown) {
      console.error('Failed to load categories:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClick = (id: string, name: string, currentStatus: boolean) => {
    setCategoryToToggle({ id, name, currentStatus });
    setShowToggleConfirm(true);
  };

  const handleToggleConfirm = async () => {
    if (!categoryToToggle) return;

    setToggling(true);
    try {
      await expenseCategoryApi.update(categoryToToggle.id, { isActive: !categoryToToggle.currentStatus });
      showSuccess('Category updated successfully');
      setShowToggleConfirm(false);
      setCategoryToToggle(null);
      loadCategories();
    } catch (error: unknown) {
      console.error('Failed to update category:', error);
      showError(getErrorMessage(error));
      setShowToggleConfirm(false);
    } finally {
      setToggling(false);
    }
  };

  const handleCategorySuccess = () => {
    loadCategories();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Categories</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage expense categories for organization
        </p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center whitespace-nowrap"
          >
            + New Category
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No expense categories found</p>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
            >
              Create your first category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleToggleClick(category._id, category.name, category.isActive)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {category.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showToggleConfirm}
        onClose={() => {
          setShowToggleConfirm(false);
          setCategoryToToggle(null);
        }}
        onConfirm={handleToggleConfirm}
        title={`${categoryToToggle?.currentStatus ? 'Deactivate' : 'Activate'} Category`}
        message={`Are you sure you want to ${categoryToToggle?.currentStatus ? 'deactivate' : 'activate'} "${categoryToToggle?.name}"?${
          categoryToToggle?.currentStatus ? '\n\nDeactivated categories will not be available for new expenses.' : ''
        }`}
        confirmText={categoryToToggle?.currentStatus ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        variant={categoryToToggle?.currentStatus ? 'warning' : 'info'}
        isLoading={toggling}
      />

      {/* Expense Category Form Modal */}
      <ExpenseCategoryFormModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={handleCategorySuccess}
      />
    </div>
  );
}
