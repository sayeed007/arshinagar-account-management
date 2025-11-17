'use client';

import { useState, useEffect } from 'react';
import { reportsApi, DayBookReport, CashBookReport, BankBookReport, AgingReport, StageWiseCollectionReport, ExpenseByCategoryReport, EmployeeCostSummaryReport } from '@/lib/api';
import { showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, Users, Calendar } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'financial' | 'sales' | 'expenses'>('financial');

  // Report data states
  const [dayBook, setDayBook] = useState<DayBookReport | null>(null);
  const [cashBook, setCashBook] = useState<CashBookReport | null>(null);
  const [bankBook, setBankBook] = useState<BankBookReport | null>(null);
  const [agingReport, setAgingReport] = useState<AgingReport | null>(null);
  const [stageWiseCollection, setStageWiseCollection] = useState<StageWiseCollectionReport | null>(null);
  const [expenseByCategory, setExpenseByCategory] = useState<ExpenseByCategoryReport | null>(null);
  const [employeeCostSummary, setEmployeeCostSummary] = useState<EmployeeCostSummaryReport | null>(null);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      loadReports();
    }
  }, [dateRange, activeTab]);

  const loadReports = async () => {
    try {
      setLoading(true);

      if (activeTab === 'financial') {
        const [dayBookData, cashBookData, bankBookData] = await Promise.all([
          reportsApi.getDayBook(dateRange),
          reportsApi.getCashBook(dateRange),
          reportsApi.getBankBook(dateRange),
        ]);
        setDayBook(dayBookData);
        setCashBook(cashBookData);
        setBankBook(bankBookData);
      } else if (activeTab === 'sales') {
        const [agingData, stageWiseData] = await Promise.all([
          reportsApi.getAgingReport(),
          reportsApi.getStageWiseCollection(dateRange),
        ]);
        setAgingReport(agingData);
        setStageWiseCollection(stageWiseData);
      } else if (activeTab === 'expenses') {
        const [expenseData, employeeData] = await Promise.all([
          reportsApi.getExpenseByCategory(dateRange),
          reportsApi.getEmployeeCostSummary(dateRange),
        ]);
        setExpenseByCategory(expenseData);
        setEmployeeCostSummary(employeeData);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
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

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header] || '').join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderFinancialReports = () => {
    if (!dayBook || !cashBook || !bankBook) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading financial reports...</p>
        </div>
      );
    }

    // Prepare data for charts
    const summaryData = [
      { name: 'Cash Receipts', amount: cashBook.summary.totalReceipts, type: 'Receipt' },
      { name: 'Cash Payments', amount: cashBook.summary.totalPayments, type: 'Payment' },
      { name: 'Bank Receipts', amount: bankBook.summary.totalReceipts, type: 'Receipt' },
      { name: 'Bank Payments', amount: bankBook.summary.totalPayments, type: 'Payment' },
    ];

    const balanceData = [
      { name: 'Cash Balance', value: cashBook.summary.closingBalance, fill: '#10b981' },
      { name: 'Bank Balance', value: bankBook.summary.closingBalance, fill: '#3b82f6' },
    ];

    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Receipts</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(dayBook.summary.totalReceipts)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Payments</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {formatCurrency(dayBook.summary.totalPayments)}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Balance</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatCurrency(dayBook.summary.balance)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cash Balance</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {formatCurrency(cashBook.summary.closingBalance)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receipts vs Payments Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Receipts vs Payments</h3>
              <button
                onClick={() => downloadCSV(summaryData, 'receipts-vs-payments')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Download CSV"
              >
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cash vs Bank Balance Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Cash vs Bank Balance</h3>
              <button
                onClick={() => downloadCSV(balanceData, 'cash-vs-bank-balance')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Download CSV"
              >
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={balanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {balanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day Book Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">Day Book Transactions</h3>
            <button
              onClick={() => {
                const csvData = dayBook.transactions.map(t => ({
                  Date: t.date,
                  Particulars: t.particulars,
                  Voucher: t.receiptNumber || t.paymentNumber || '-',
                  Receipt: t.type === 'Receipt' ? t.amount : 0,
                  Payment: t.type === 'Payment' ? t.amount : 0,
                  Balance: t.balance,
                }));
                downloadCSV(csvData, 'day-book');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Particulars</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Receipt</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {dayBook.transactions.slice(0, 10).map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {transaction.particulars}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {transaction.type === 'Receipt' && (
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(transaction.amount)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {transaction.type === 'Payment' && (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(transaction.amount)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-gray-900 dark:text-white">
                      {formatCurrency(transaction.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dayBook.transactions.length > 10 && (
            <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Showing 10 of {dayBook.transactions.length} transactions. Export CSV for full data.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSalesReports = () => {
    if (!agingReport || !stageWiseCollection) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading sales reports...</p>
        </div>
      );
    }

    // Prepare aging data for charts
    const agingData = [
      { name: 'Current', amount: agingReport.current.amount, count: agingReport.current.count },
      { name: '31-60 Days', amount: agingReport.days31to60.amount, count: agingReport.days31to60.count },
      { name: '61-90 Days', amount: agingReport.days61to90.amount, count: agingReport.days61to90.count },
      { name: '90+ Days', amount: agingReport.over90.amount, count: agingReport.over90.count },
    ];

    // Prepare stage-wise collection data
    const stageData = [
      { name: 'Booking', amount: stageWiseCollection.summary.booking },
      { name: 'Installment', amount: stageWiseCollection.summary.installment },
      { name: 'Registration', amount: stageWiseCollection.summary.registration },
      { name: 'Handover', amount: stageWiseCollection.summary.handover },
      { name: 'Other', amount: stageWiseCollection.summary.other },
    ];

    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Receivables</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatCurrency(agingReport.total.amount)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {agingReport.total.count}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Collections</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(stageWiseCollection.summary.total)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aging Analysis Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Receivables Aging Analysis</h3>
              <button
                onClick={() => downloadCSV(agingData, 'aging-analysis')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Download CSV"
              >
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agingData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
                <Bar dataKey="amount" fill="#f59e0b" />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stage-wise Collection Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Collections by Stage</h3>
              <button
                onClick={() => downloadCSV(stageData, 'stage-wise-collection')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Download CSV"
              >
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stageData.filter(d => d.amount > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${formatCurrency(entry.amount)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aging Details Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">Aging Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Age Bucket</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Count</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {agingData.map((bucket, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {bucket.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                      {bucket.count}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(bucket.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {agingReport.total.amount > 0
                        ? ((bucket.amount / agingReport.total.amount) * 100).toFixed(1)
                        : 0}%
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Total</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    {agingReport.total.count}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    {formatCurrency(agingReport.total.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    100%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderExpenseReports = () => {
    if (!expenseByCategory || !employeeCostSummary) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading expense reports...</p>
        </div>
      );
    }

    // Prepare expense category data
    const categoryData = Object.keys(expenseByCategory.byCategory).map(categoryName => ({
      name: categoryName,
      amount: expenseByCategory.byCategory[categoryName].total,
      count: expenseByCategory.byCategory[categoryName].expenses.length,
    }));

    // Prepare employee cost data
    const employeeData = Object.values(employeeCostSummary.byEmployee).map((emp: any) => ({
      name: emp.employee.name,
      salary: emp.totals.salary,
      commission: emp.totals.commission,
      other: emp.totals.fuel + emp.totals.entertainment + emp.totals.otherAllowances,
    }));

    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {formatCurrency(expenseByCategory.summary.totalAmount)}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {Object.keys(expenseByCategory.byCategory).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Payroll</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {formatCurrency(employeeCostSummary.summary.totalNetPay)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Employees</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {Object.keys(employeeCostSummary.byEmployee).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense by Category Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Expenses by Category</h3>
              <button
                onClick={() => downloadCSV(categoryData, 'expense-by-category')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Download CSV"
              >
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${formatCurrency(entry.amount)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Employee Cost Breakdown Stacked Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Employee Cost Breakdown</h3>
              <button
                onClick={() => downloadCSV(employeeData, 'employee-costs')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Download CSV"
              >
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
                <Bar dataKey="salary" stackId="a" fill="#3b82f6" />
                <Bar dataKey="commission" stackId="a" fill="#10b981" />
                <Bar dataKey="other" stackId="a" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Details Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">Expense Category Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Count</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categoryData.map((category, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                      {category.count}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(category.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {expenseByCategory.summary.totalAmount > 0
                        ? ((category.amount / expenseByCategory.summary.totalAmount) * 100).toFixed(1)
                        : 0}%
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Total</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    {categoryData.reduce((sum, cat) => sum + cat.count, 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    {formatCurrency(expenseByCategory.summary.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    100%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive financial and operational insights
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-3 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Date Range
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('financial')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'financial'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Financial Reports
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'sales'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Sales & Collections
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'expenses'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Expenses & Payroll
          </button>
        </nav>
      </div>

      {/* Report Content */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reports...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'financial' && renderFinancialReports()}
            {activeTab === 'sales' && renderSalesReports()}
            {activeTab === 'expenses' && renderExpenseReports()}
          </>
        )}
      </div>
    </div>
  );
}
