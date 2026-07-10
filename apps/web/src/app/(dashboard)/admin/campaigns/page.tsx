'use client';

import { useState } from 'react';
import { Card, Button, Input, Modal, ErrorState } from '@/pkg/ui-components';

interface Campaign {
  id: string;
  subject: string;
  segment: string;
  status: 'draft' | 'scheduled' | 'sent';
  sentCount: number;
  openRate: number;
  clickRate: number;
  scheduledDate: string;
}

const mockCampaigns: Campaign[] = [
  { id: 'CAM-001', subject: 'Trial Expiry Reminder — Your 14 days are almost up', segment: 'trial', status: 'scheduled', sentCount: 0, openRate: 0, clickRate: 0, scheduledDate: '2026-07-12' },
  { id: 'CAM-002', subject: "We miss you — Here's 20% off your first month back", segment: 'churned', status: 'draft', sentCount: 0, openRate: 0, clickRate: 0, scheduledDate: '' },
  { id: 'CAM-003', subject: 'New: AI Predictive Maintenance is now live!', segment: 'all', status: 'sent', sentCount: 245, openRate: 42, clickRate: 18, scheduledDate: '2026-07-05' },
  { id: 'CAM-004', subject: 'Your subscription is at risk — update payment', segment: 'at-risk', status: 'sent', sentCount: 12, openRate: 75, clickRate: 50, scheduledDate: '2026-07-04' },
];

const segments = ['all', 'trial', 'at-risk', 'churned'];

const templates = [
  { name: 'Trial Expiry Reminder', subject: 'Your 14-day trial ends soon', body: "Hi {{name}},\n\nYour PlumbCore AI trial is ending in {{days}} days. Upgrade now to keep your data and continue using all features.\n\nhttps://plumbcore-ai.vercel.app/pricing" },
  { name: 'Win-back', subject: "We miss you — Come back to PlumbCore AI", body: "Hi {{name}},\n\nWe noticed you haven't been active lately. Here's a special offer to welcome you back.\n\nhttps://plumbcore-ai.vercel.app/pricing" },
  { name: 'Feature Announcement', subject: 'New feature: {{feature}} is now available', body: "Hi {{name}},\n\nWe're excited to announce {{feature}} — now available on your plan.\n\nLog in to try it: https://plumbcore-ai.vercel.app/dashboard" },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ subject: '', body: '', segment: 'all', scheduledDate: '' });
  const [preview, setPreview] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createCampaign = () => {
    if (!form.subject) return;
    setCampaigns(prev => [...prev, {
      id: `CAM-${String(prev.length + 1).padStart(3, '0')}`,
      subject: form.subject,
      segment: form.segment,
      status: form.scheduledDate ? 'scheduled' : 'draft',
      sentCount: 0, openRate: 0, clickRate: 0,
      scheduledDate: form.scheduledDate,
    }]);
    setShowCreate(false);
    setForm({ subject: '', body: '', segment: 'all', scheduledDate: '' });
    setActiveTemplate('');
  };

  const applyTemplate = (template: typeof templates[0]) => {
    setForm(f => ({ ...f, subject: template.subject, body: template.body }));
    setActiveTemplate(template.name);
  };

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl sm:text-2xl font-bold text-gray-900">Email Campaigns</h1><p className="text-sm text-gray-500 mt-0.5">Create, schedule, and track email campaigns</p></div>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ New Campaign</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-blue-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-gray-500">Total Sent</p><p className="text-lg font-bold text-blue-600">{campaigns.reduce((s, c) => s + c.sentCount, 0).toLocaleString()}</p></div>
        <div className="rounded-lg bg-green-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-gray-500">Avg Open Rate</p><p className="text-lg font-bold text-green-600">{campaigns.length ? Math.round(campaigns.reduce((s, c) => s + c.openRate, 0) / campaigns.length) : 0}%</p></div>
        <div className="rounded-lg bg-amber-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-gray-500">Drafts</p><p className="text-lg font-bold text-amber-600">{campaigns.filter(c => c.status === 'draft').length}</p></div>
        <div className="rounded-lg bg-gray-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-gray-500">Scheduled</p><p className="text-lg font-bold text-gray-600">{campaigns.filter(c => c.status === 'scheduled').length}</p></div>
      </div>

      <Card variant="bordered" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Subject</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Segment</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Sent</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Opens</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Clicks</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Date</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{c.subject}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{c.segment}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.status === 'sent' ? 'bg-green-100 text-green-700' : c.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span></td>
                  <td className="px-4 py-3 text-gray-600">{c.sentCount || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.openRate ? `${c.openRate}%` : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.clickRate ? `${c.clickRate}%` : '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.scheduledDate || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showCreate && (
        <Modal open={true} onClose={() => setShowCreate(false)} title="New Campaign">
          <div className="space-y-4 p-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-steel-light">Template</label>
                {form.body && (
                  <button onClick={() => setPreview(!preview)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    {preview ? '✕ Close preview' : '👁 Preview'}
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {templates.map(t => (
                  <button
                    key={t.name}
                    onClick={() => applyTemplate(t)}
                    className={`text-xs rounded-lg border px-2.5 py-1.5 transition-all ${
                      activeTemplate === t.name
                        ? 'border-blue-400 bg-blue-500/10 text-blue-300'
                        : 'border-white-border text-steel-light hover:border-steel hover:text-white'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div><label className="text-xs font-medium text-steel-light">Subject <span className="text-status-error">*</span></label><Input value={form.subject} onChange={(e: any) => setForm(f => ({...f, subject: e.target.value}))} /></div>
            <div><label className="text-xs font-medium text-steel-light">Body</label><textarea value={form.body} onChange={(e: any) => setForm(f => ({...f, body: e.target.value}))} rows={8} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-accent/50 focus:ring-1 focus:ring-accent/20 font-mono" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-steel-light">Segment</label>
                <select value={form.segment} onChange={(e: any) => setForm(f => ({...f, segment: e.target.value}))} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-accent/50 focus:ring-1 focus:ring-accent/20">
                  {segments.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-medium text-steel-light">Schedule Date (optional)</label><Input type="date" value={form.scheduledDate} onChange={(e: any) => setForm(f => ({...f, scheduledDate: e.target.value}))} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={createCampaign}>Save Campaign</Button>
            </div>
            {preview && form.body && (
              <div className="rounded-xl border border-white-border bg-white-subtle p-4">
                <p className="text-xs font-semibold text-steel-light mb-2">Preview:</p>
                <div className="bg-white rounded-lg p-4 shadow-sm max-w-md mx-auto">
                  <p className="text-sm whitespace-pre-wrap text-gray-900">{form.body.replace(/\{\{name\}\}/g, 'John').replace(/\{\{days\}\}/g, '3').replace(/\{\{feature\}\}/g, 'Predictive Maintenance')}</p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
