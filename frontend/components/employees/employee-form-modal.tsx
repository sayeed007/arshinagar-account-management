'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal';
import { employeesApi, Employee } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSuccess: (employee: Employee) => void;
}

export function EmployeeFormModal({
  isOpen,
  onClose,
  employee,
  onSuccess,
}: EmployeeFormModalProps) {
  const isEditMode = !!employee;
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
    resignDate: '',
    baseSalary: '',
  });

  // Initialize form data when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        designation: employee.designation,
        phone: employee.phone,
        email: employee.email || '',
        nid: employee.nid || '',
        address: employee.address || '',
        bankName: employee.bankAccount?.bankName || '',
        accountNumber: employee.bankAccount?.accountNumber || '',
        accountHolderName: employee.bankAccount?.accountHolderName || '',
        joinDate: employee.joinDate.split('T')[0],
        resignDate: employee.resignDate ? employee.resignDate.split('T')[0] : '',
        baseSalary: employee.baseSalary.toString(),
      });
    } else {
      setFormData({
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
        resignDate: '',
        baseSalary: '',
      });
    }
  }, [employee]);

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
      const baseData = {
        name: formData.name,
        designation: formData.designation,
        phone: formData.phone,
        email: formData.email || undefined,
        nid: formData.nid || undefined,
        address: formData.address || undefined,
        joinDate: formData.joinDate,
        baseSalary: parseFloat(formData.baseSalary),
        bankAccount:
          formData.bankName && formData.accountNumber
            ? {
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                accountHolderName: formData.accountHolderName || formData.name,
              }
            : undefined,
      };

      let updatedEmployee: Employee;

      if (isEditMode && employee) {
        // Update employee - can include resignDate
        const updateData = {
          ...baseData,
          resignDate: formData.resignDate || undefined,
        };
        updatedEmployee = await employeesApi.update(employee._id, updateData);
        showSuccess('Employee updated successfully!');
      } else {
        // Create employee - no resignDate
        updatedEmployee = await employeesApi.create(baseData);
        showSuccess('Employee created successfully!');
      }

      onSuccess(updatedEmployee);
      onClose();
    } catch (error: unknown) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} employee:`, error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Employee' : 'Add New Employee'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <div className="space-y-4">
            {/* Personal Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Personal Information
              </h3>

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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="01XXXXXXXXX"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Bangladesh mobile number
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    NID
                  </label>
                  <input
                    type="text"
                    name="nid"
                    value={formData.nid}
                    onChange={handleChange}
                    pattern="\d{10}|\d{13}|\d{17}"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="10, 13, or 17 digits"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Employment Information
              </h3>

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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {isEditMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Resign Date
                      </label>
                      <input
                        type="date"
                        name="resignDate"
                        value={formData.resignDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Leave empty if employee is still active
                      </p>
                    </div>
                  )}
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 30000"
                  />
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Defaults to employee name if not provided"
                  />
                </div>
              </div>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update Employee'
                : 'Create Employee'}
            </button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
