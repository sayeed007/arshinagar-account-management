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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem('accessToken');

    let endpoint = '';
    if (financialReports.find((r) => r.id === reportId)) {
      endpoint = `/reports/financial/${reportId}`;
    } else if (salesReports.find((r) => r.id === reportId)) {
      endpoint = `/reports/sales/${reportId}`;
    } else if (expenseReports.find((r) => r.id === reportId)) {
      endpoint = `/reports/expense/${reportId}`;
    }

    const url = `${apiUrl}${endpoint}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
    window.open(url + `&token=${token}`, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-3">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Financial Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {financialReports.map((report) => (
              <div
                key={report.id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold mb-1">{report.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                <button
                  onClick={() => handleViewReport(report.id)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Report →
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Sales Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salesReports.map((report) => (
              <div
                key={report.id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold mb-1">{report.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                <button
                  onClick={() => handleViewReport(report.id)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Report →
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Expense & Payroll Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseReports.map((report) => (
              <div
                key={report.id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold mb-1">{report.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                <button
                  onClick={() => handleViewReport(report.id)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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
