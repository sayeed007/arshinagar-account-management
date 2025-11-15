'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { bankAccountsApi, cashAccountsApi, BankAccount, CashAccount, AccountType } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { BankAccountFormModal } from '@/components/banking/bank-account-form-modal';
import { CashAccountFormModal } from '@/components/banking/cash-account-form-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Edit, Trash2, Calendar, Building, CreditCard, FileText } from 'lucide-react';

type AccountTypeParam = 'bank-accounts' | 'cash-accounts';

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountType = params.account_type as AccountTypeParam;
  const accountId = params.account_id as string;

  const isBankAccounts = accountType === 'bank-accounts';
  const [loading, setLoading] = useState(true);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [cashAccount, setCashAccount] = useState<CashAccount | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAccountDetails();
  }, [accountId, accountType]);

  const loadAccountDetails = async () => {
    try {
      setLoading(true);
      if (isBankAccounts) {
        const account = await bankAccountsApi.getById(accountId);
        setBankAccount(account);
      } else {
        const account = await cashAccountsApi.getById(accountId);
        setCashAccount(account);
      }
    } catch (error: unknown) {
      console.error('Failed to load account details:', error);
      showError(getErrorMessage(error));
      router.push(`/banking/${accountType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    loadAccountDetails();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if (isBankAccounts) {
        await bankAccountsApi.delete(accountId);
      } else {
        await cashAccountsApi.delete(accountId);
      }
      showSuccess('Account deleted successfully');
      router.push(`/banking/${accountType}`);
    } catch (error: unknown) {
      console.error('Failed to delete account:', error);
      showError(getErrorMessage(error));
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colors[type]}`}>
        {type}
      </span>
    );
  };

  const account = isBankAccounts ? bankAccount : cashAccount;
  const pageTitle = isBankAccounts ? 'Bank Account Details' : 'Cash Account Details';

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: 'Banking & Accounts', href: '/banking' },
          { label: isBankAccounts ? 'Bank Accounts' : 'Cash Accounts', href: `/banking/${accountType}` },
          { label: account ? (isBankAccounts ? (account as BankAccount).accountName : (account as CashAccount).name) : 'Loading...' },
        ]}
        title={account ? (isBankAccounts ? (account as BankAccount).accountName : (account as CashAccount).name) : pageTitle}
        subtitle="View and manage account details"
      />

      {account && (
        <div className="mb-6 flex justify-end gap-2">
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      ) : !account ? (
        <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">Account not found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Account Information Card */}
          <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90 mb-1">
                    {isBankAccounts ? 'Account Name' : 'Cash Account'}
                  </p>
                  <h2 className="text-2xl font-bold">
                    {isBankAccounts
                      ? (bankAccount as BankAccount).accountName
                      : (cashAccount as CashAccount).name}
                  </h2>
                  {isBankAccounts && (
                    <p className="text-sm opacity-90 mt-2">
                      {(bankAccount as BankAccount).bankName}
                      {(bankAccount as BankAccount).branchName &&
                        ` - ${(bankAccount as BankAccount).branchName}`}
                    </p>
                  )}
                </div>
                {isBankAccounts && getAccountTypeBadge((bankAccount as BankAccount).accountType)}
              </div>
            </div>

            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Balance Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Balance Information
                </h3>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Opening Balance</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(account.openingBalance)}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Current Balance</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(account.currentBalance)}
                  </p>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Account Details
                </h3>

                {isBankAccounts ? (
                  <>
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bank Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {(bankAccount as BankAccount).bankName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Branch Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {(bankAccount as BankAccount).branchName || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                        <p className="font-medium text-gray-900 dark:text-white font-mono">
                          {(bankAccount as BankAccount).accountNumber}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {(cashAccount as CashAccount).description || '-'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Created At</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(account.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(account.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${
                    account.isActive
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {account.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes Section - Full Width */}
              {account.notes && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Notes
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {account.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction History Placeholder */}
          <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Transaction History
              </h3>
            </div>
            <div className="p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Transaction history feature coming soon
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Track all transactions related to this account
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isBankAccounts ? (
        <BankAccountFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          account={bankAccount}
          onSuccess={handleSuccess}
        />
      ) : (
        <CashAccountFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          account={cashAccount}
          onSuccess={handleSuccess}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${isBankAccounts ? 'Bank' : 'Cash'} Account`}
        message={`Are you sure you want to delete this ${isBankAccounts ? 'bank' : 'cash'} account? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
