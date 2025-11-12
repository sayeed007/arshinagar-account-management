'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { employeeCostsApi, EmployeeCost, Employee } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';

export default function PayrollPage() {
  const [loading, setLoading] = useState(true);
  const [costs, setCosts] = useState<EmployeeCost[]>([]);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    loadPayroll();
  }, [selectedMonth, selectedYear]);

  const loadPayroll = async () => {
    try {
      setLoading(true);
      const data = await employeeCostsApi.getAll({
        month: selectedMonth,
        year: selectedYear,
      });
      setCosts(data.data || []);
    } catch (error: unknown) {
      console.error('Failed to load payroll:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
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
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1];
  };

  const calculateTotals = () => {
    return costs.reduce(
      (acc, cost) => ({
        salary: acc.salary + cost.salary,
        commission: acc.commission + cost.commission,
        fuel: acc.fuel + cost.fuel,
        entertainment: acc.entertainment + cost.entertainment,
        bonus: acc.bonus + cost.bonus,
        overtime: acc.overtime + cost.overtime,
        otherAllowances: acc.otherAllowances + cost.otherAllowances,
        advances: acc.advances + cost.advances,
        deductions: acc.deductions + cost.deductions,
        netPay: acc.netPay + cost.netPay,
      }),
      {
        salary: 0,
        commission: 0,
        fuel: 0,
        entertainment: 0,
        bonus: 0,
        overtime: 0,
        otherAllowances: 0,
        advances: 0,
        deductions: 0,
        netPay: 0,
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
  }));

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const totals = calculateTotals();

  return (
    <div>
      <div className="mb-6 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Summary</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getMonthName(selectedMonth)} {selectedYear}
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Print Report
          </button>
        </div>

        <div className="mt-4 flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-center">Arshinagar Account Management</h1>
        <h2 className="text-xl font-semibold text-center mt-2">
          Payroll Summary - {getMonthName(selectedMonth)} {selectedYear}
        </h2>
        <p className="text-sm text-center mt-1">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading payroll data...</p>
          </div>
        </div>
      ) : costs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No payroll data found for {getMonthName(selectedMonth)} {selectedYear}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden print:shadow-none">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fuel
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Entertainment
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bonus
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Overtime
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Other
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Advances
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Net Pay
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {costs.map((cost) => {
                  const employee = cost.employeeId as Employee;
                  return (
                    <tr key={cost._id}>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{employee.designation}</div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(cost.salary)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(cost.commission)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(cost.fuel)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(cost.entertainment)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(cost.bonus)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(cost.overtime)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(cost.otherAllowances)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-red-600 dark:text-red-400">
                        {formatCurrency(cost.advances)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-red-600 dark:text-red-400">
                        {formatCurrency(cost.deductions)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(cost.netPay)}
                      </td>
                    </tr>
                  );
                })}
                {/* Totals Row */}
                <tr className="bg-gray-100 dark:bg-gray-900 font-semibold">
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Total ({costs.length} employees)
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(totals.salary)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(totals.commission)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(totals.fuel)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(totals.entertainment)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(totals.bonus)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(totals.overtime)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(totals.otherAllowances)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-red-600 dark:text-red-400">
                    {formatCurrency(totals.advances)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-red-600 dark:text-red-400">
                    {formatCurrency(totals.deductions)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(totals.netPay)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && costs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 print:hidden">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Gross Pay</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {formatCurrency(
                totals.salary +
                  totals.commission +
                  totals.fuel +
                  totals.entertainment +
                  totals.bonus +
                  totals.overtime +
                  totals.otherAllowances
              )}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Deductions</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {formatCurrency(totals.advances + totals.deductions)}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Net Pay</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {formatCurrency(totals.netPay)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
