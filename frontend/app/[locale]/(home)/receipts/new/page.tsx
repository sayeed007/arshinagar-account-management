'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { receiptsApi, salesApi, Sale, ReceiptType, PaymentMethod } from '@/lib/api';

export default function NewReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saleIdParam = searchParams.get('saleId');

  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const [formData, setFormData] = useState({
    saleId: saleIdParam || '',
    receiptType: ReceiptType.BOOKING,
    amount: '',
    method: PaymentMethod.CASH,
    receiptDate: new Date().toISOString().split('T')[0],
    bankName: '',
    chequeNumber: '',
    notes: '',
  });

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    if (formData.saleId) {
      const sale = sales.find((s) => s._id === formData.saleId);
      setSelectedSale(sale || null);
    }
  }, [formData.saleId, sales]);

  const loadSales = async () => {
    try {
      setLoadingData(true);
      const response = await salesApi.getAll({ page: 1, limit: 100, isActive: true });
      setSales(response.data || []);
    } catch (error: any) {
      console.error('Failed to load sales:', error);
      alert('Failed to load sales');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedSale) {
        alert('Please select a sale');
        return;
      }

      const data: any = {
        clientId: typeof selectedSale.clientId === 'string' ? selectedSale.clientId : selectedSale.clientId._id,
        saleId: formData.saleId,
        receiptType: formData.receiptType,
        amount: parseFloat(formData.amount),
        method: formData.method,
        receiptDate: formData.saleId,
      };

      if (formData.method === PaymentMethod.CHEQUE || formData.method === PaymentMethod.PDC) {
        if (!formData.bankName || !formData.chequeNumber) {
          alert('Bank name and cheque number are required for cheque/PDC payments');
          return;
        }
        data.instrumentDetails = {
          bankName: formData.bankName,
          chequeNumber: formData.chequeNumber,
        };
      }

      if (formData.notes.trim()) {
        data.notes = formData.notes.trim();
      }

      const receipt = await receiptsApi.create(data);
      alert('Receipt created successfully!');
      router.push(`/receipts/${receipt._id}`);
    } catch (error: any) {
      console.error('Failed to create receipt:', error);
      alert(error.response?.data?.error?.message || 'Failed to create receipt');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Receipt</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Record a payment receipt
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Sale Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sale <span className="text-red-500">*</span>
            </label>
            <select
              name="saleId"
              value={formData.saleId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">Select a sale</option>
              {sales.map((sale) => (
                <option key={sale._id} value={sale._id}>
                  {sale.saleNumber} - Due: ৳{sale.dueAmount.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Receipt Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Receipt Type <span className="text-red-500">*</span>
            </label>
            <select
              name="receiptType"
              value={formData.receiptType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value={ReceiptType.BOOKING}>Booking</option>
              <option value={ReceiptType.INSTALLMENT}>Installment</option>
              <option value={ReceiptType.REGISTRATION}>Registration</option>
              <option value={ReceiptType.HANDOVER}>Handover</option>
              <option value={ReceiptType.OTHER}>Other</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount (BDT) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="e.g., 500000"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value={PaymentMethod.CASH}>Cash</option>
              <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
              <option value={PaymentMethod.CHEQUE}>Cheque</option>
              <option value={PaymentMethod.PDC}>PDC (Post-Dated Cheque)</option>
              <option value={PaymentMethod.MOBILE_WALLET}>Mobile Wallet</option>
            </select>
          </div>

          {/* Cheque Details (conditional) */}
          {(formData.method === PaymentMethod.CHEQUE || formData.method === PaymentMethod.PDC) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cheque Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="chequeNumber"
                  value={formData.chequeNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}

          {/* Receipt Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Receipt Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="receiptDate"
              value={formData.receiptDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              maxLength={1000}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Additional notes (optional)"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Receipt'}
          </button>
          <Link
            href="/receipts"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
