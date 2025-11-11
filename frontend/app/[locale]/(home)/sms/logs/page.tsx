'use client';

import { useState, useEffect } from 'react';
import { smsApi, SMSLog, SMSStatus, SMSCategory } from '@/lib/api';

export default function SMSLogsPage() {
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await smsApi.getLogs({ page: 1, limit: 50 });
      setLogs(data.logs);
    } catch (error) {
      console.error('Failed to load SMS logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await smsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load SMS stats:', error);
    }
  };

  const getStatusColor = (status: SMSStatus) => {
    switch (status) {
      case SMSStatus.SENT:
      case SMSStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case SMSStatus.FAILED:
      case SMSStatus.BOUNCED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading SMS logs...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">SMS Logs</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600">Total SMS</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">Sent</p>
            <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">Failed</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date/Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Message
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">{log.phone}</td>
                <td className="px-4 py-3 text-sm">{log.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${getStatusColor(log.status)}`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm max-w-md truncate">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12 text-gray-500">No SMS logs found.</div>
      )}
    </div>
  );
}
