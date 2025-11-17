'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const financialReports = [
    { id: 'day-book', name: 'Day Book', description: 'All transactions for a date range' },
    { id: 'cash-book', name: 'Cash Book', description: 'Cash receipts and payments' },
    { id: 'bank-book', name: 'Bank Book', description: 'Bank transactions' },
    {
      id: 'receipt-payment',
      name: 'Receipt & Payment Register',
      description: 'Summary of receipts and payments',
    },
  ];

  const salesReports = [
    { id: 'aging', name: 'Aging Report', description: 'Receivables aging analysis' },
    {
      id: 'stage-collection',
      name: 'Stage-wise Collection',
      description: 'Collections by sale stage',
    },
  ];

  const expenseReports = [
    {
      id: 'by-category',
      name: 'Expense by Category',
      description: 'Expenses grouped by category',
    },
    {
      id: 'employee-costs',
      name: 'Employee Cost Summary',
      description: 'Employee salary and costs',
    },
  ];

  const handleViewReport = (reportId: string) => {
    // Build URL with query parameters for the report viewer page
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });

    // Navigate to the appropriate report viewer page
    if (financialReports.find((r) => r.id === reportId)) {
      window.location.href = `/reports/financial/${reportId}?${params.toString()}`;
    } else if (salesReports.find((r) => r.id === reportId)) {
      window.location.href = `/reports/sales/${reportId}?${params.toString()}`;
    } else if (expenseReports.find((r) => r.id === reportId)) {
      window.location.href = `/reports/expense/${reportId}?${params.toString()}`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Reports & Analytics</h1>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border dark:border-gray-700">
        <h3 className="font-semibold mb-3 dark:text-white">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3 dark:text-white">Financial Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {financialReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold mb-1 dark:text-white">{report.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{report.description}</p>
                <button
                  onClick={() => handleViewReport(report.id)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  View Report →
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 dark:text-white">Sales Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salesReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold mb-1 dark:text-white">{report.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{report.description}</p>
                <button
                  onClick={() => handleViewReport(report.id)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  View Report →
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 dark:text-white">Expense & Payroll Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold mb-1 dark:text-white">{report.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{report.description}</p>
                <button
                  onClick={() => handleViewReport(report.id)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  View Report →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
