'use client';

import { useState, useEffect } from 'react';
import { smsApi, SMSTemplate, SMSLog, SMSCategory, SMSStatus } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { SMSTemplateFormModal } from '@/components/sms/sms-template-form-modal';
import { SMSTemplateDetailsModal } from '@/components/sms/sms-template-details-modal';
import { SMSLogDetailsModal } from '@/components/sms/sms-log-details-modal';
import { Eye, Edit2, Trash2 } from 'lucide-react';

type TabType = 'overview' | 'templates' | 'logs' | 'send';

export default function SMSPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    byCategory: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(false);

  // Send SMS form state
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [bulkPhones, setBulkPhones] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | null>(null);
  const [isLogDetailsModalOpen, setIsLogDetailsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SMSLog | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const statsData = await smsApi.getStats();
        setStats(statsData);
      } else if (activeTab === 'templates') {
        const templatesData = await smsApi.getTemplates();
        setTemplates(templatesData);
      } else if (activeTab === 'logs') {
        const [logsData, statsData] = await Promise.all([
          smsApi.getLogs({ limit: 50 }),
          smsApi.getStats(),
        ]);
        setLogs(logsData.logs);
        setStats(statsData);
      }
    } catch (error: unknown) {
      console.error('Failed to load data:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone || !testMessage) {
      showError('Please enter phone number and message');
      return;
    }

    try {
      await smsApi.sendTest({ phone: testPhone, message: testMessage });
      showSuccess('Test SMS sent successfully');
      setTestPhone('');
      setTestMessage('');
    } catch (error: unknown) {
      console.error('Failed to send test SMS:', error);
      showError(getErrorMessage(error));
    }
  };

  const handleSendBulk = async () => {
    if (!bulkPhones || !bulkMessage) {
      showError('Please enter phone numbers and message');
      return;
    }

    try {
      const phones = bulkPhones.split('\n').filter((p) => p.trim());
      const result = await smsApi.sendBulk({ phones, message: bulkMessage });
      showSuccess(`Bulk SMS sent: ${result.sent} sent, ${result.failed} failed`);
      setBulkPhones('');
      setBulkMessage('');
    } catch (error: unknown) {
      console.error('Failed to send bulk SMS:', error);
      showError(getErrorMessage(error));
    }
  };

  // Template handlers
  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsFormModalOpen(true);
  };

  const handleEditTemplate = (template: SMSTemplate) => {
    setSelectedTemplate(template);
    setIsFormModalOpen(true);
  };

  const handleViewTemplate = (template: SMSTemplate) => {
    setSelectedTemplate(template);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteTemplate = async (template: SMSTemplate) => {
    if (!confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      return;
    }

    try {
      await smsApi.deleteTemplate(template._id);
      showSuccess('Template deleted successfully');
      loadData();
    } catch (error: unknown) {
      console.error('Failed to delete template:', error);
      showError(getErrorMessage(error));
    }
  };

  const handleTemplateSuccess = (template: SMSTemplate) => {
    loadData();
  };

  // Log handlers
  const handleViewLog = (log: SMSLog) => {
    setSelectedLog(log);
    setIsLogDetailsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: SMSStatus) => {
    const statusColors: Record<SMSStatus, string> = {
      [SMSStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      [SMSStatus.SENT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [SMSStatus.DELIVERED]:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [SMSStatus.FAILED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      [SMSStatus.BOUNCED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SMS Management</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage SMS templates, view logs, and send messages
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'templates', label: 'Templates' },
            { key: 'logs', label: 'SMS Logs' },
            { key: 'send', label: 'Send SMS' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total SMS Sent</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">Successfully Sent</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {stats.sent}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {stats.failed}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Category */}
              <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">By Category</h3>
                <div className="space-y-2">
                  {Object.entries(stats.byCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {count}
                      </span>
                    </div>
                  ))}
                  {Object.keys(stats.byCategory).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
                  )}
                </div>
              </div>

              {/* By Status */}
              <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">By Status</h3>
                <div className="space-y-2">
                  {Object.entries(stats.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {status}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {count}
                      </span>
                    </div>
                  ))}
                  {Object.keys(stats.byStatus).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold dark:text-white">SMS Templates</h2>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                + New Template
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : templates.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">No templates found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template._id}
                    className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold dark:text-white">{template.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {template.templateCode}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            template.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      <strong>EN:</strong> {template.messageEN}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      <strong>BN:</strong> {template.messageBN}
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleViewTemplate(template)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/30"
                        title="Edit Template"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template)}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <h2 className="text-lg font-semibold mb-4 dark:text-white">SMS Logs</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total SMS</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-700 dark:text-green-400">Sent</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.sent}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-700 dark:text-red-400">Failed</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</p>
                  </div>
                </div>

                {/* Logs Table */}
                {logs.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-12 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No SMS logs found</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Phone
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Message
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Category
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Sent At
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {logs.map((log) => (
                            <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {log.phone}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                                  {log.message}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                  {log.category.replace(/_/g, ' ')}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(log.status)}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {log.sentAt ? formatDate(log.sentAt) : 'Not sent'}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <button
                                  onClick={() => handleViewLog(log)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Send SMS Tab */}
        {activeTab === 'send' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test SMS */}
            <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Send Test SMS</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={4}
                    placeholder="Enter your message..."
                    className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleSendTest}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Send Test SMS
                </button>
              </div>
            </div>

            {/* Bulk SMS */}
            <div className="bg-white dark:bg-slate-900 border dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Send Bulk SMS</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Numbers (one per line)
                  </label>
                  <textarea
                    value={bulkPhones}
                    onChange={(e) => setBulkPhones(e.target.value)}
                    rows={4}
                    placeholder="01XXXXXXXXX&#10;01YYYYYYYYY&#10;01ZZZZZZZZZ"
                    className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                    rows={4}
                    placeholder="Enter your message..."
                    className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleSendBulk}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                >
                  Send Bulk SMS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SMSTemplateFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        template={selectedTemplate}
        onSuccess={handleTemplateSuccess}
      />
      <SMSTemplateDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        template={selectedTemplate}
        onEdit={handleEditTemplate}
      />
      <SMSLogDetailsModal
        isOpen={isLogDetailsModalOpen}
        onClose={() => setIsLogDetailsModalOpen(false)}
        log={selectedLog}
      />
    </div>
  );
}
