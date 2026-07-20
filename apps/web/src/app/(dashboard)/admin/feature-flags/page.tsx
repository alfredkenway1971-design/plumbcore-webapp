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

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
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
      <div><h1 className="text-xl sm:text-2xl font-bold text-foreground">Feature Flags</h1><p className="text-sm text-muted-foreground mt-0.5">Toggle features on/off, A/B test, and control rollouts</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-green-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Enabled</p><p className="text-lg font-bold text-emerald-600">0</p></div>
        <div className="rounded-lg bg-red-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Disabled</p><p className="text-lg font-bold text-red-600">0</p></div>
        <div className="rounded-lg bg-blue-tint px-4 py-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">A/B Tests Active</p><p className="text-lg font-bold text-primary">0</p></div>
      </div>

      {flags.length === 0 ? (
        <Card variant="bordered" padding="none">
          <div className="px-6 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-tint flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚩</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No feature flags configured</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Feature flags let you toggle features on and off, run A/B tests, and control rollout percentages per plan. Configure them here once you have features to manage.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {flags.map(flag => {
            const activeABTest = flag.rolloutPercent < 100 && flag.rolloutPercent > 0 && flag.enabled;
            return (
              <div key={flag.id} className={`rounded-xl border ${flag.enabled ? 'border-border bg-white' : 'border-border/50 hover:bg-muted'} p-4`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${flag.enabled ? 'bg-green-500' : 'bg-muted/80'}`} />
                      <p className="text-sm font-semibold text-foreground font-mono">{flag.name}</p>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold ${flag.enabled ? 'bg-green-50 text-green-700' : 'bg-muted text-muted-foreground'}`}>{flag.enabled ? 'ON' : 'OFF'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-muted-foreground">Plans: {flag.plans.join(', ')}</span>
                      {activeABTest && <span className="text-[10px] text-amber-600 font-semibold">🧪 A/B Test: {flag.rolloutPercent}%</span>}
                    </div>
                    {flag.enabled && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-muted-foreground">Rollout:</span>
                        <input type="range" min={0} max={100} value={flag.rolloutPercent} onChange={(e) => updateRollout(flag.id, Number(e.target.value))} className="w-24 h-1.5" />
                        <span className="text-[10px] font-mono text-muted-foreground/80 w-8">{flag.rolloutPercent}%</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => toggleFlag(flag.id)} className={`relative w-10 h-5 rounded-full transition-colors ${flag.enabled ? 'bg-primary' : 'bg-muted/80'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform ${flag.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
