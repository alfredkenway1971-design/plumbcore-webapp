'use client';

import { useState } from 'react';
import { Brain, TrendingUp, Users, Zap, AlertTriangle } from 'lucide-react';

export default function AdminAiUsageStatsPage() {
  const features: any[] = [];

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">AI Usage Stats</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor AI feature adoption and usage patterns</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Weekly AI Calls', value: '0', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Photo Estimates', value: '0', icon: Brain, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Voice Notes', value: '0', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'AI Chats', value: '0', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 shadow-sm ring-1 ring-black/5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm ring-1 ring-black/5 p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-purple-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No AI usage data yet</h3>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          AI usage statistics, daily usage charts, and feature adoption details will appear here once plumbers start using AI-powered features like photo estimates, voice notes, and AI chat.
        </p>
      </div>
    </div>
  );
}
