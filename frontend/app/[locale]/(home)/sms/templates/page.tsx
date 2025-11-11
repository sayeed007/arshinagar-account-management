'use client';

import { useState, useEffect } from 'react';
import { smsApi, SMSTemplate, SMSCategory } from '@/lib/api';

export default function SMSTemplatesPage() {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await smsApi.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: SMSTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleToggleActive = async (template: SMSTemplate) => {
    try {
      await smsApi.updateTemplate(template._id, { isActive: !template.isActive });
      await loadTemplates();
    } catch (error) {
      console.error('Failed to toggle template:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading SMS templates...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SMS Templates</h1>
        <button
          onClick={() => {
            setEditingTemplate(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template._id}
            className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <p className="text-sm text-gray-500">{template.templateCode}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  template.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-gray-600">Bangla:</p>
                <p className="text-sm">{template.messageBN}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">English:</p>
                <p className="text-sm">{template.messageEN}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((v) => (
                    <span key={v} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                      {`{${v}}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleEdit(template)}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(template)}
                className={`px-3 py-1 text-sm rounded ${
                  template.isActive
                    ? 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {template.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No SMS templates found. Create your first template to get started.
        </div>
      )}
    </div>
  );
}
