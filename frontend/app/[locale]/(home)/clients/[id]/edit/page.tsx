'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { clientApi, Client } from '@/lib/api';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    email: '',
    address: '',
    nid: '',
    notes: '',
  });

  useEffect(() => {
    if (params.id) {
      loadClient();
    }
  }, [params.id]);

  const loadClient = async () => {
    try {
      setDataLoading(true);
      const data = await clientApi.getById(params.id as string);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        alternatePhone: data.alternatePhone || '',
        email: data.email || '',
        address: data.address || '',
        nid: data.nid || '',
        notes: data.notes || '',
      });
    } catch (error: any) {
      console.error('Failed to load client:', error);
      alert(error.response?.data?.error?.message || 'Failed to load client');
      router.push('/clients');
    } finally {
      setDataLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      // Prepare data - remove empty optional fields
      const data: Partial<Client> = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      if (formData.alternatePhone.trim()) {
        data.alternatePhone = formData.alternatePhone.trim();
      }
      if (formData.email.trim()) {
        data.email = formData.email.trim();
      }
      if (formData.nid.trim()) {
        data.nid = formData.nid.trim();
      }
      if (formData.notes.trim()) {
        data.notes = formData.notes.trim();
      }

      await clientApi.update(params.id as string, data);
      alert('Client updated successfully!');
      router.push(`/clients/${params.id}`);
    } catch (error: any) {
      console.error('Failed to update client:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to update client';
      const details = error.response?.data?.error?.details;

      if (details) {
        const fieldErrors = Object.entries(details)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        alert(`Validation errors:\n${fieldErrors}`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading client...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/clients" className="hover:text-indigo-600">
            Clients
          </Link>
          <span>/</span>
          <Link href={`/clients/${params.id}`} className="hover:text-indigo-600">
            {formData.name}
          </Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Client</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Update client information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Full name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="^(\+8801|01)[3-9]\d{8}$"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="01XXXXXXXXX"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Bangladesh phone format: 01XXXXXXXXX
            </p>
          </div>

          {/* Alternate Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alternate Phone
            </label>
            <input
              type="tel"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={handleChange}
              pattern="^(\+8801|01)[3-9]\d{8}$"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="01XXXXXXXXX (optional)"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="email@example.com (optional)"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              minLength={5}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Complete address"
            />
          </div>

          {/* NID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              NID (National ID)
            </label>
            <input
              type="text"
              name="nid"
              value={formData.nid}
              onChange={handleChange}
              pattern="^\d{10,17}$"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="10-17 digit NID number (optional)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Bangladesh NID: 10-17 digits
            </p>
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
            {loading ? 'Updating...' : 'Update Client'}
          </button>
          <Link
            href={`/clients/${params.id}`}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
