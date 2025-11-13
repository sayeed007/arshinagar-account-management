'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { expenseCategoryApi, ExpenseCategory } from '@/lib/api';
import { toast } from 'sonner';

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string; isActive: boolean } | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

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
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to load expense categories');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClick = (id: string, name: string, isActive: boolean) => {
    setSelectedCategory({ id, name, isActive });
    setShowToggleModal(true);
  };

  const handleConfirmToggle = async () => {
    if (!selectedCategory) return;

    try {
      setToggleLoading(true);
      await expenseCategoryApi.update(selectedCategory.id, { isActive: !selectedCategory.isActive });
      toast.success('Category updated successfully');
      setShowToggleModal(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error: any) {
      console.error('Failed to update category:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update category');
    } finally {
      setToggleLoading(false);
    }
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
          <Link
            href="/expenses/categories/new"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center whitespace-nowrap"
          >
            + New Category
          </Link>
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
            <Link
              href="/expenses/categories/new"
              className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
            >
              Create your first category
            </Link>
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

      {/* Toggle Status Confirmation Modal */}
      {showToggleModal && selectedCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {selectedCategory.isActive ? 'Deactivate' : 'Activate'} Category
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to {selectedCategory.isActive ? 'deactivate' : 'activate'}{' '}
                <span className="font-semibold">{selectedCategory.name}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowToggleModal(false);
                    setSelectedCategory(null);
                  }}
                  disabled={toggleLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmToggle}
                  disabled={toggleLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {toggleLoading ? 'Updating...' : selectedCategory.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
