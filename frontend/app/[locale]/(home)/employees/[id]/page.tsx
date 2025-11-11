'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { employeesApi, Employee, EmployeeCost } from '@/lib/api';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [costs, setCosts] = useState<EmployeeCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCosts, setLoadingCosts] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadEmployee();
      loadCosts();
    }
  }, [params.id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeesApi.getById(params.id as string);
      setEmployee(data);
    } catch (error: any) {
      console.error('Failed to load employee:', error);
      alert(error.response?.data?.error?.message || 'Failed to load employee');
      router.push('/employees');
    } finally {
      setLoading(false);
    }
  };

  const loadCosts = async () => {
    try {
      setLoadingCosts(true);
      const data = await employeesApi.getCosts(params.id as string);
      setCosts(data);
    } catch (error: any) {
      console.error('Failed to load cost history:', error);
    } finally {
      setLoadingCosts(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading employee...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Employee not found</p>
        <Link href="/employees" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
          Back to Employees
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/employees" className="hover:text-indigo-600">
            Employees
          </Link>
          <span>/</span>
          <span>{employee.name}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.name}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{employee.designation}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employee Information</h2>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{employee.phone}</dd>
              </div>

              {employee.email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{employee.email}</dd>
                </div>
              )}

              {employee.nid && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">NID</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{employee.nid}</dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Base Salary</dt>
                <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(employee.baseSalary)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Join Date</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(employee.joinDate).toLocaleDateString()}
                </dd>
              </div>

              {employee.resignDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Resign Date</dt>
                  <dd className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {new Date(employee.resignDate).toLocaleDateString()}
                  </dd>
                </div>
              )}

              {employee.address && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{employee.address}</dd>
                </div>
              )}

              {employee.bankAccount && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Account</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {employee.bankAccount.bankName} - {employee.bankAccount.accountNumber}
                    {employee.bankAccount.accountHolderName && ` (${employee.bankAccount.accountHolderName})`}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Cost History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cost History</h2>
              <Link
                href={`/employees/${employee._id}/costs/new`}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                + Add Cost Entry
              </Link>
            </div>

            {loadingCosts ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : costs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No cost history available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Period</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Salary</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Commission</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Other</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {costs.map((cost) => (
                      <tr key={cost._id}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {getMonthName(cost.month)} {cost.year}
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">{formatCurrency(cost.salary)}</td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">{formatCurrency(cost.commission)}</td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          {formatCurrency(cost.fuel + cost.entertainment + cost.bonus + cost.overtime + cost.otherAllowances)}
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap font-semibold">{formatCurrency(cost.netPay)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/employees/edit/${employee._id}`}
                className="block w-full px-4 py-2 bg-indigo-600 text-white text-center rounded-md hover:bg-indigo-700"
              >
                Edit Employee
              </Link>
              <Link
                href={`/employees/${employee._id}/costs/new`}
                className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700"
              >
                Add Cost Entry
              </Link>
              <Link
                href="/employees"
                className="block w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Back to Employees
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Status</h3>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  employee.resignDate
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}
              >
                {employee.resignDate ? 'Resigned' : 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
