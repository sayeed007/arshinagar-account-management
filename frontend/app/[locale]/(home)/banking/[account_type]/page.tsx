'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { bankAccountsApi, cashAccountsApi, BankAccount, CashAccount, AccountType } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { BankAccountFormModal } from '@/components/banking/bank-account-form-modal';
import { CashAccountFormModal } from '@/components/banking/cash-account-form-modal';

type AccountTypeParam = 'bank-accounts' | 'cash-accounts';

export default function AccountsListPage() {
  const params = useParams();
  const accountType = params.account_type as AccountTypeParam;

  const isBankAccounts = accountType === 'bank-accounts';
  const [loading, setLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [selectedCashAccount, setSelectedCashAccount] = useState<CashAccount | null>(null);

  useEffect(() => {
    loadAccounts();
  }, [accountType]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      if (isBankAccounts) {
        const response = await bankAccountsApi.getAll({ limit: 100 });
        setBankAccounts(response.data);
      } else {
        const response = await cashAccountsApi.getAll({ limit: 100 });
        setCashAccounts(response.data);
      }
    } catch (error: unknown) {
      console.error('Failed to load accounts:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (account?: BankAccount | CashAccount) => {
    if (isBankAccounts) {
      setSelectedBankAccount((account as BankAccount) || null);
    } else {
      setSelectedCashAccount((account as CashAccount) || null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBankAccount(null);
    setSelectedCashAccount(null);
  };

  const handleSuccess = () => {
    loadAccounts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${isBankAccounts ? 'bank' : 'cash'} account?`)) {
      return;
    }

    try {
      if (isBankAccounts) {
        await bankAccountsApi.delete(id);
      } else {
        await cashAccountsApi.delete(id);
      }
      showSuccess('Account deleted successfully');
      loadAccounts();
    } catch (error: unknown) {
      console.error('Failed to delete account:', error);
      showError(getErrorMessage(error));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAccountTypeBadge = (type: AccountType) => {
    const colors: Record<AccountType, string> = {
      [AccountType.SAVINGS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [AccountType.CURRENT]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [AccountType.FDR]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      [AccountType.DPS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      [AccountType.OTHER]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[type]}`}>
        {type}
      </span>
    );
  };

  const pageTitle = isBankAccounts ? 'Bank Accounts' : 'Cash Accounts';
  const addButtonText = isBankAccounts ? '+ Add Bank Account' : '+ Add Cash Account';
  const accounts = isBankAccounts ? bankAccounts : cashAccounts;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage all {isBankAccounts ? 'bank' : 'cash'} accounts
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className={`px-4 py-2 text-white rounded-md ${
            isBankAccounts
              ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
              : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
          }`}
        >
          {addButtonText}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No accounts found</p>
          <button
            onClick={() => handleOpenModal()}
            className={`px-4 py-2 text-white rounded-md ${
              isBankAccounts
                ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
            }`}
          >
            Add First Account
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {isBankAccounts ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Bank / Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Account Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Branch
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Account Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Description
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isBankAccounts
                  ? bankAccounts.map((account) => (
                      <tr key={account._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.bankName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {account.accountName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {account.accountNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getAccountTypeBadge(account.accountType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {account.branchName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(account.currentBalance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                          <button
                            onClick={() => handleOpenModal(account)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(account._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  : cashAccounts.map((account) => (
                      <tr key={account._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {account.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(account.currentBalance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                          <button
                            onClick={() => handleOpenModal(account)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(account._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isBankAccounts ? (
        <BankAccountFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          account={selectedBankAccount}
          onSuccess={handleSuccess}
        />
      ) : (
        <CashAccountFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          account={selectedCashAccount}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
