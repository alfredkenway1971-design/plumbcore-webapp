'use client';

import { useState } from 'react';
import { Card, Button, ErrorState } from '@/pkg/ui-components';

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

const segments = ['all', 'trial', 'at-risk', 'churned'];

const campaignsData: Campaign[] = [];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(campaignsData);
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

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl sm:text-2xl font-bold text-slate-900">Email Campaigns</h1><p className="text-sm text-slate-500 mt-0.5">Create, schedule, and track email campaigns</p></div>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ New Campaign</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg bg-blue-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Total Sent</p><p className="text-lg font-bold text-blue-600">0</p></div>
        <div className="rounded-lg bg-green-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Avg Open Rate</p><p className="text-lg font-bold text-green-600">0%</p></div>
        <div className="rounded-lg bg-amber-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Drafts</p><p className="text-lg font-bold text-amber-600">0</p></div>
        <div className="rounded-lg bg-slate-100 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Scheduled</p><p className="text-lg font-bold text-slate-400">0</p></div>
      </div>

      {campaigns.length === 0 ? (
        <Card variant="bordered" padding="none">
          <div className="px-6 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No campaigns yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Create your first email campaign to reach plumbers with trial reminders, feature announcements, and win-back offers.
            </p>
            <Button size="sm" className="mt-4" onClick={() => setShowCreate(true)}>+ New Campaign</Button>
          </div>
        </Card>
      ) : (
        <Card variant="bordered" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead><tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-900">Subject</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900">Segment</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900">Sent</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900">Opens</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900">Clicks</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{c.subject}</td>
                    <td className="px-4 py-3 capitalize text-slate-400">{c.segment}</td>
                    <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.status === 'sent' ? 'bg-green-50 text-green-700' : c.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>{c.status}</span></td>
                    <td className="px-4 py-3 text-slate-400">{c.sentCount || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{c.openRate ? `${c.openRate}%` : '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{c.clickRate ? `${c.clickRate}%` : '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{c.scheduledDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">New Campaign</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Template</label>
                  {form.body && (
                    <button onClick={() => setPreview(!preview)} className="text-xs text-blue-600 hover:text-blue-600 transition-colors">
                      {preview ? '✕ Close preview' : '👁 Preview'}
                    </button>
                  )}
                </div>
              </div>
              <div><label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Subject <span className="text-red-600">*</span></label><input value={form.subject} onChange={(e: any) => setForm(f => ({...f, subject: e.target.value}))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></div>
              <div><label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Body</label><textarea value={form.body} onChange={(e: any) => setForm(f => ({...f, body: e.target.value}))} rows={8} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-mono" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Segment</label>
                  <select value={form.segment} onChange={(e: any) => setForm(f => ({...f, segment: e.target.value}))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    {segments.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Schedule Date (optional)</label><input type="date" value={form.scheduledDate} onChange={(e: any) => setForm(f => ({...f, scheduledDate: e.target.value}))} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button onClick={createCampaign}>Save Campaign</Button>
              </div>
              {preview && form.body && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Preview:</p>
                  <div className="bg-white rounded-lg p-4 shadow-sm max-w-md mx-auto border border-gray-100">
                    <p className="text-sm whitespace-pre-wrap text-gray-900">{form.body.replace(/\{\{name\}\}/g, 'John').replace(/\{\{days\}\}/g, '3').replace(/\{\{feature\}\}/g, 'Predictive Maintenance')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
