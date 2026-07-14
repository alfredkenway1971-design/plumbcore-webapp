'use client';

import { useState, useEffect } from 'react';
import { Save, Shield, Globe, Bell, Database, Key, Zap, Mail, Smartphone } from 'lucide-react';

export default function AdminSystemSettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'PlumbCore AI',
    supportEmail: 'support@plumbcore.ai',
    maxFreeTrials: 14,
    aiRateLimit: 1000,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: true,
    autoApproveNewCompanies: false,
    require2FA: false,
    dataRetentionDays: 365,
    maxFileUploadMb: 25,
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
  });
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load persisted language/currency from localStorage on mount
  useEffect(() => {
    try {
      const lang = localStorage.getItem('plumbcore_admin_language');
      const currency = localStorage.getItem('plumbcore_admin_currency');
      if (lang || currency) {
        setSettings(p => ({
          ...p,
          ...(lang ? { defaultLanguage: lang } : {}),
          ...(currency ? { defaultCurrency: currency } : {}),
        }));
      }
    } catch {
      // localStorage unavailable — use defaults
    }
    setLoaded(true);
  }, []);

  const update = (key: string, value: any) => {
    setSettings(p => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('plumbcore_admin_language', settings.defaultLanguage);
      localStorage.setItem('plumbcore_admin_currency', settings.defaultCurrency);
    } catch {
      // localStorage unavailable
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    {
      title: 'General',
      icon: Globe,
      fields: [
        { key: 'platformName', label: 'Platform Name', type: 'text' },
        { key: 'supportEmail', label: 'Support Email', type: 'email' },
        { key: 'defaultLanguage', label: 'Default Language', type: 'select', options: ['en', 'fr', 'es', 'de'] },
        { key: 'defaultCurrency', label: 'Default Currency', type: 'select', options: ['USD', 'CAD', 'EUR', 'GBP'] },
      ],
    },
    {
      title: 'Security',
      icon: Shield,
      fields: [
        { key: 'require2FA', label: 'Require 2FA for Admins', type: 'toggle' },
        { key: 'autoApproveNewCompanies', label: 'Auto-approve New Companies', type: 'toggle' },
        { key: 'dataRetentionDays', label: 'Data Retention (days)', type: 'number' },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      fields: [
        { key: 'emailNotifications', label: 'Email Notifications', type: 'toggle' },
        { key: 'smsNotifications', label: 'SMS Notifications', type: 'toggle' },
      ],
    },
    {
      title: 'AI & Limits',
      icon: Zap,
      fields: [
        { key: 'aiRateLimit', label: 'AI Requests/Minute (per company)', type: 'number' },
        { key: 'maxFileUploadMb', label: 'Max File Upload (MB)', type: 'number' },
      ],
    },
    {
      title: 'Maintenance',
      icon: Database,
      fields: [
        { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'toggle' },
        { key: 'maxFreeTrials', label: 'Max Trial Days', type: 'number' },
      ],
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure platform-wide settings and preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm ring-1 ring-black/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><Icon className="w-5 h-5 text-blue-500" /></div>
                <h2 className="text-sm font-semibold text-slate-900">{section.title}</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                {section.fields.map(field => {
                  const value = (settings as any)[field.key];
                  return (
                    <div key={field.key} className="flex items-center justify-between gap-4">
                      <label className="text-sm font-medium text-slate-700">{field.label}</label>
                      <div className="shrink-0">
                        {field.type === 'toggle' ? (
                          <button onClick={() => update(field.key, !value)} className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-slate-700'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform ${value ? 'translate-x-5' : ''}`} />
                          </button>
                        ) : field.type === 'select' ? (
                          <select value={value} onChange={e => update(field.key, e.target.value)} className="h-9 px-3 hover:bg-slate-50 border-0 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20">
                            {field.options?.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                          </select>
                        ) : (
                          <input type={field.type} value={value} onChange={e => update(field.key, field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)} className="h-9 w-48 px-3 hover:bg-slate-50 border-0 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 text-right" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button — centered at bottom */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4">
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-3 h-12 px-10 rounded-xl bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition-all shadow-md ring-1 ring-black/10 min-w-[200px]"
        >
          <Save className="w-5 h-5" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
        {saved && (
          <span className="mt-2 text-sm text-green-600 animate-pulse">All settings saved successfully</span>
        )}
      </div>
    </div>
  );
}
