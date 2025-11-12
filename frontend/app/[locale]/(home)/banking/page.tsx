'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { bankAccountsApi, cashAccountsApi, BankAccount, CashAccount, AccountType } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';

export default function BankingDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [bankStats, setBankStats] = useState<any>(null);
  const [cashStats, setCashStats] = useState<any>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [bankStatsRes, cashStatsRes, bankAccountsRes, cashAccountsRes] = await Promise.all([
        bankAccountsApi.getStats(),
        cashAccountsApi.getStats(),
        bankAccountsApi.getAll({ limit: 10, isActive: true }),
        cashAccountsApi.getAll({ limit: 10, isActive: true }),
      ]);

      setBankStats(bankStatsRes);
      setCashStats(cashStatsRes);
      setBankAccounts(bankAccountsRes.data);
      setCashAccounts(cashAccountsRes.data);
    } catch (error: any) {
      console.error('Failed to load banking dashboard:', error);
      alert(error.response?.data?.error?.message || 'Failed to load dashboard data');
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

  const totalBalance = (bankStats?.totalBalance || 0) + (cashStats?.totalBalance || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading banking dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Banking & Accounts</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage bank accounts, cash accounts, and cheques
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bank Accounts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {bankStats?.totalAccounts || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {bankStats?.activeAccounts || 0} active
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bank Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(bankStats?.totalBalance || 0)}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
              <svg
                className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cash Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(cashStats?.totalBalance || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {cashStats?.totalAccounts || 0} accounts
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link
          href="/banking/bank-accounts/new"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Bank Account
        </Link>
        <Link
          href="/banking/cash-accounts/new"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Cash Account
        </Link>
        <Link
          href="/banking/cheques"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Manage Cheques
        </Link>
      </div>

      {/* Bank Accounts List */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bank Accounts</h2>
            <Link
              href="/banking/bank-accounts"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
            >
              View All →
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {bankAccounts.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No bank accounts found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bank / Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Account Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {bankAccounts.map((account) => (
                  <tr key={account._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/banking/bank-accounts/${account._id}`}
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                      >
                        {account.bankName}
                      </Link>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {account.accountName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {account.accountNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {account.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(account.currentBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Cash Accounts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cash Accounts</h2>
            <Link
              href="/banking/cash-accounts"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
            >
              View All →
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {cashAccounts.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No cash accounts found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {cashAccounts.map((account) => (
                  <tr key={account._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/banking/cash-accounts/${account._id}`}
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                      >
                        {account.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {account.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(account.currentBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
