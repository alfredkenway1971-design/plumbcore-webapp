'use client';

import { useState } from 'react';
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

  const update = (key: string, value: any) => {
    setSettings(p => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
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
          <h1 className="text-2xl font-semibold tracking-tight text-white">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure platform-wide settings and preferences</p>
        </div>
        <button onClick={handleSave} className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-black/30">
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-[#0F172A] rounded-2xl ring-1 ring-white/5 shadow-lg shadow-black/30 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center"><Icon className="w-5 h-5 text-blue-500" /></div>
                <h2 className="text-sm font-semibold text-white">{section.title}</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                {section.fields.map(field => {
                  const value = (settings as any)[field.key];
                  return (
                    <div key={field.key} className="flex items-center justify-between gap-4">
                      <label className="text-sm font-medium text-slate-300">{field.label}</label>
                      <div className="shrink-0">
                        {field.type === 'toggle' ? (
                          <button onClick={() => update(field.key, !value)} className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-slate-700'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#0F172A] shadow-lg shadow-black/30 transition-transform ${value ? 'translate-x-5' : ''}`} />
                          </button>
                        ) : field.type === 'select' ? (
                          <select value={value} onChange={e => update(field.key, e.target.value)} className="h-9 px-3 bg-white/[0.02] border-0 rounded-lg text-sm text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20">
                            {field.options?.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                          </select>
                        ) : (
                          <input type={field.type} value={value} onChange={e => update(field.key, field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)} className="h-9 w-48 px-3 bg-white/[0.02] border-0 rounded-lg text-sm text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 text-right" />
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
    </div>
  );
}
