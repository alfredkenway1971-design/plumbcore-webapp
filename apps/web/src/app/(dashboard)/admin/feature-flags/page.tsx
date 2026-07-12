'use client';

import { useState } from 'react';
import { Card, Button, ErrorState } from '@/pkg/ui-components';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  plans: string[];
  rolloutPercent: number;
}

const mockFlags: FeatureFlag[] = [
  { id: 'FF-001', name: 'route-optimization', description: 'Route Optimization for Pro+ plans', enabled: true, plans: ['pro', 'business', 'enterprise'], rolloutPercent: 100 },
  { id: 'FF-002', name: 'truck-gps', description: 'Truck GPS Tracking', enabled: true, plans: ['business', 'enterprise'], rolloutPercent: 100 },
  { id: 'FF-003', name: 'predictive-maintenance', description: 'AI Predictive Maintenance', enabled: true, plans: ['enterprise'], rolloutPercent: 100 },
  { id: 'FF-004', name: 'new-dashboard-v2', description: 'New dashboard design (A/B test)', enabled: true, plans: ['pro'], rolloutPercent: 50 },
  { id: 'FF-005', name: 'ai-upsell', description: 'AI-powered upsell suggestions during jobs', enabled: false, plans: ['pro', 'business', 'enterprise'], rolloutPercent: 0 },
  { id: 'FF-006', name: 'dark-mode', description: 'Dark mode UI theme', enabled: true, plans: ['all'], rolloutPercent: 25 },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(mockFlags);
  const [error, setError] = useState<string | null>(null);

  const toggleFlag = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const updateRollout = (id: string, percent: number) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, rolloutPercent: Math.min(100, Math.max(0, percent)) } : f));
  };

  if (error) return <div className="p-6"><ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div><h1 className="text-xl sm:text-2xl font-bold text-white">Feature Flags</h1><p className="text-sm text-slate-500 mt-0.5">Toggle features on/off, A/B test, and control rollouts</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-green-500/10 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Enabled</p><p className="text-lg font-bold text-green-400">{flags.filter(f => f.enabled).length}</p></div>
        <div className="rounded-lg bg-red-500/10 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">Disabled</p><p className="text-lg font-bold text-red-400">{flags.filter(f => !f.enabled).length}</p></div>
        <div className="rounded-lg bg-blue-500/10 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-slate-500">A/B Tests Active</p><p className="text-lg font-bold text-blue-400">{flags.filter(f => f.rolloutPercent < 100 && f.rolloutPercent > 0).length}</p></div>
      </div>

      <div className="space-y-2">
        {flags.map(flag => {
          const activeABTest = flag.rolloutPercent < 100 && flag.rolloutPercent > 0 && flag.enabled;
          return (
            <div key={flag.id} className={`rounded-xl border ${flag.enabled ? 'border-white/10 bg-[#0F172A]' : 'border-white/5 bg-white/[0.02]'} p-4`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${flag.enabled ? 'bg-green-500' : 'bg-slate-600'}`} />
                    <p className="text-sm font-semibold text-white font-mono">{flag.name}</p>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold ${flag.enabled ? 'bg-green-500/10 text-green-300' : 'bg-white/[0.04] text-slate-500'}`}>{flag.enabled ? 'ON' : 'OFF'}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{flag.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-slate-600">Plans: {flag.plans.join(', ')}</span>
                    {activeABTest && <span className="text-[10px] text-amber-400 font-semibold">🧪 A/B Test: {flag.rolloutPercent}%</span>}
                  </div>
                  {flag.enabled && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-600">Rollout:</span>
                      <input type="range" min={0} max={100} value={flag.rolloutPercent} onChange={(e) => updateRollout(flag.id, Number(e.target.value))} className="w-24 h-1.5" />
                      <span className="text-[10px] font-mono text-slate-400 w-8">{flag.rolloutPercent}%</span>
                    </div>
                  )}
                </div>
                <button onClick={() => toggleFlag(flag.id)} className={`relative w-10 h-5 rounded-full transition-colors ${flag.enabled ? 'bg-blue-500' : 'bg-slate-600'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#0F172A] shadow-lg shadow-black/30 transition-transform ${flag.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
