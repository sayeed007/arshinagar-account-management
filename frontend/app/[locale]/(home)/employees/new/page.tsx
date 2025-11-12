'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { employeesApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/types';
import { showSuccess, showError } from '@/lib/toast';

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    phone: '',
    email: '',
    nid: '',
    address: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    joinDate: new Date().toISOString().split('T')[0],
    baseSalary: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: Record<string, unknown> = {
        name: formData.name,
        designation: formData.designation,
        phone: formData.phone,
        email: formData.email || undefined,
        nid: formData.nid || undefined,
        address: formData.address || undefined,
        joinDate: formData.joinDate,
        baseSalary: parseFloat(formData.baseSalary),
      };

      if (formData.bankName && formData.accountNumber) {
        data.bankAccount = {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountHolderName: formData.accountHolderName || formData.name,
        };
      }

      const employee = await employeesApi.create(data);
      showSuccess('Employee created successfully!');
      router.push(`/employees/${employee._id}`);
    } catch (error) {
      console.error('Failed to create employee:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Employee</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create a new employee record</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Personal Information */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="e.g., Sales Manager, Accountant"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="01[3-9]\d{8}"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="01XXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bangladesh mobile number</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NID</label>
                <input
                  type="text"
                  name="nid"
                  value={formData.nid}
                  onChange={handleChange}
                  pattern="\d{10}|\d{13}|\d{17}"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="10, 13, or 17 digits"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Employment Information</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Join Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Base Salary (BDT) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="baseSalary"
                    value={formData.baseSalary}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="e.g., 30000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Account Information */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Bank Account Information (Optional)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Defaults to employee name if not provided"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
          <Link
            href="/employees"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
