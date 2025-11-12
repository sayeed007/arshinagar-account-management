'use client';
import { showSuccess, showError } from '@/lib/toast';
import Link from 'next/link';

import { useState } from 'react';

export default function SettingsPage() {
  const [lockDate, setLockDate] = useState('');
  const [officeCharge, setOfficeCharge] = useState('10');
  const [installmentReminder, setInstallmentReminder] = useState('3');

  const handleSaveLockDate = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/settings/finance/lock-date`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ lockDate, isActive: true }),
        }
      );

      if (response.ok) {
        showSuccess('Lock date saved successfully');
      }
    } catch (error) {
      console.error('Failed to save lock date:', error);
    }
  };

  const handleSaveGeneralSettings = async () => {
    try {
      const settings = [
        {
          key: 'DEFAULT_OFFICE_CHARGE_PERCENT',
          value: parseFloat(officeCharge),
          type: 'number',
          category: 'finance',
          description: 'Default office charge percentage for cancellations',
        },
        {
          key: 'INSTALLMENT_REMINDER_DAYS',
          value: parseInt(installmentReminder),
          type: 'number',
          category: 'sms',
          description: 'Days before installment due date to send reminder',
        },
      ];

      for (const setting of settings) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify(setting),
        });
      }

      showSuccess('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">System Settings</h1>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Financial Settings</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lock Date
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Prevent edits before this date (accounting period lock)
          </p>
          <div className="flex gap-2">
            <input
              type="date"
              value={lockDate}
              onChange={(e) => setLockDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <button
              onClick={handleSaveLockDate}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Lock Date
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Office Charge (%)
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Default percentage charged when a booking is cancelled
          </p>
          <input
            type="number"
            value={officeCharge}
            onChange={(e) => setOfficeCharge(e.target.value)}
            min="0"
            max="100"
            className="border rounded px-3 py-2 w-32"
          />
          <span className="ml-2 text-gray-600">%</span>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">SMS & Notification Settings</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Installment Reminder Days
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Send SMS reminder N days before installment due date
          </p>
          <input
            type="number"
            value={installmentReminder}
            onChange={(e) => setInstallmentReminder(e.target.value)}
            min="1"
            max="30"
            className="border rounded px-3 py-2 w-32"
          />
          <span className="ml-2 text-gray-600">days</span>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSaveGeneralSettings}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save General Settings
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
        <div className="space-y-2">
          <Link
            href="/sms/templates"
            className="block text-blue-600 hover:text-blue-700"
          >
            → Manage SMS Templates
          </Link>
          <Link
            href="/expenses/categories"
            className="block text-blue-600 hover:text-blue-700"
          >
            → Manage Expense Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
