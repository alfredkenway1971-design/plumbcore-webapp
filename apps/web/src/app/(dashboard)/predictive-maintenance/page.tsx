'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { canAccess, PLAN_PRICING } from '@/lib/feature-gates';
import type { PlanTier } from '@/lib/feature-gates';
import {
  Button, Card, Input, Modal, EmptyState, ErrorState, StatusBadge,
} from '@/pkg/ui-components';
import {
  getEquipment, getPredictions, getStats, acknowledgePrediction,
  getRiskColor, getRiskLabel,
} from '@/lib/predictiveDb';
import type { Equipment, Prediction } from '@/lib/predictiveDb';

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-9 w-56 rounded-xl bg-slate-50" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1,2,3,4].map((i: any) => <div key={i} className="h-20 rounded-xl bg-slate-50" />)}
      </div>
      <div className="h-64 rounded-xl bg-slate-100" />
    </div>
  );
}

export default function PredictiveMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const company = useAuthStore((s) => s.company);
  const tier = (company?.subscription_tier || '') as string;
  const hasAccess = canAccess(tier, 'predictiveMaintenance');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    setEquipment(getEquipment());
    setPredictions(getPredictions());
    setStats(getStats());
    return () => clearTimeout(t);
  }, [refreshKey]);

  const handleAcknowledge = useCallback((predId: string) => {
    acknowledgePrediction(predId);
    setPredictions(getPredictions());
    setStats(getStats());
  }, []);

  const sortedPredictions = useMemo(() => {
    return [...predictions].sort((a, b) => b.failureRiskScore - a.failureRiskScore);
  }, [predictions]);

  const unacknowledged = useMemo(() => predictions.filter(p => !p.acknowledged), [predictions]);

  if (!hasAccess) {
    return (
      <div className="p-4 sm:p-6">
        <Card variant="bordered" padding="lg">
          <EmptyState
            title="Predictive Maintenance"
            description="Upgrade to Enterprise plan to access AI-powered predictive maintenance."
            action={
              <a href="/pricing">
                <Button size="sm">Contact Sales</Button>
              </a>
            }
          />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState title="Failed to load" message={error} onRetry={() => setError(null)} />
      </div>
    );
  }

  if (loading) {
    return <div className="p-4 sm:p-6"><Skeleton /></div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Predictive Maintenance</h1>
        <p className="text-sm text-slate-500 mt-0.5">AI-powered equipment failure prediction and preventive maintenance</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-red-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Critical</p>
            <p className="text-xl font-bold text-red-600">{stats.critical}</p>
          </div>
          <div className="rounded-xl bg-amber-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Warning</p>
            <p className="text-xl font-bold text-amber-600">{stats.warning}</p>
          </div>
          <div className="rounded-xl bg-green-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Good</p>
            <p className="text-xl font-bold text-green-600">{stats.good}</p>
          </div>
          <div className="rounded-xl bg-blue-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Prev. Revenue</p>
            <p className="text-xl font-bold text-blue-600">${stats.preventiveRevenue.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Avg Risk Bar */}
      {stats && (
        <div className="rounded-xl ring-1 ring-black/5 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-900">Average Risk Score</p>
            <span className="text-sm font-bold" style={{ color: getRiskColor(stats.avgRisk) }}>{stats.avgRisk}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{
              width: `${stats.avgRisk}%`,
              backgroundColor: getRiskColor(stats.avgRisk),
            }} />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">{stats.potentialJobs} equipment items need attention</p>
        </div>
      )}

      {/* Prediction Cards */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Equipment Risk Assessment ({unacknowledged.length} items)
        </h3>
        <div className="space-y-2">
          {sortedPredictions.map(pred => {
            const eq = equipment.find(e => e.id === pred.equipmentId);
            const riskColor = getRiskColor(pred.failureRiskScore);
            const riskLabel = getRiskLabel(pred.failureRiskScore);
            const acknowledged = pred.acknowledged;

            return (
              <div key={pred.id} className={`rounded-xl border ${acknowledged ? 'border-slate-100 bg-slate-50/50' : 'border-slate-200 bg-white'} p-4 transition-all`}>
                <div className="flex items-start gap-4">
                  {/* Risk score circle */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold text-white" style={{ backgroundColor: riskColor }}>
                      {pred.failureRiskScore}%
                    </div>
                    <span className="text-[10px] font-semibold mt-1" style={{ color: riskColor }}>{riskLabel}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {eq?.customerName || 'Unknown'} — {eq?.brand} {eq?.model || ''}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {eq?.type?.replace('_', ' ')} • Installed {eq?.installDate ? new Date(eq.installDate).getFullYear() : '?'}
                        </p>
                      </div>
                      {!acknowledged && (
                        <Button size="sm" variant="ghost" onClick={() => handleAcknowledge(pred.id)}>
                          Dismiss
                        </Button>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        ⏱ Predicted: {new Date(pred.predictedFailureDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        🎯 Confidence: {pred.confidence}%
                      </span>
                      {acknowledged && (
                        <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                          ✓ Acknowledged
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-2">{pred.recommendedAction}</p>
                  </div>
                </div>

                {/* Risk bar */}
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${pred.failureRiskScore}%`,
                    backgroundColor: riskColor,
                    opacity: acknowledged ? 0.4 : 1,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment List */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Registered Equipment ({equipment.length})</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[500px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-2.5 font-semibold text-slate-900">Customer</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-900">Type</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-900">Brand</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-900">Installed</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-900">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {equipment.map(eq => {
                const pred = predictions.find(p => p.equipmentId === eq.id);
                return (
                  <tr key={eq.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 text-slate-700">{eq.customerName}</td>
                    <td className="px-4 py-2.5 capitalize text-slate-700">{eq.type.replace('_', ' ')}</td>
                    <td className="px-4 py-2.5 text-slate-700">{eq.brand}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">{new Date(eq.installDate).getFullYear()}</td>
                    <td className="px-4 py-2.5">
                      {pred && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-900" style={{ backgroundColor: getRiskColor(pred.failureRiskScore) }}>
                          {pred.failureRiskScore}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
