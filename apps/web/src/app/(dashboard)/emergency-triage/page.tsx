'use client';

import { useState } from 'react';
import { Button, Card, EmptyState, ErrorState } from '@/pkg/ui-components';

/* ── Types ── */
interface EmergencyCall {
  id: string;
  callerName: string;
  phone: string;
  issue: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  callTime: string;
  status: 'Waiting' | 'Dispatched' | 'Resolved';
}

interface AITriageResult {
  priority: string;
  suggestedAction: string;
  estimatedResponseTime: string;
}

/* ── Mock Data ── */
const MOCK_CALLS: EmergencyCall[] = [
  { id: 'EC-001', callerName: 'Maria Gonzalez', phone: '(512) 555-0142', issue: 'Burst pipe in basement — water flooding rapidly', urgency: 'Critical', callTime: '2 min ago', status: 'Waiting' },
  { id: 'EC-002', callerName: 'Thomas Baker', phone: '(512) 555-0187', issue: 'Sewage backup in ground floor bathroom', urgency: 'Critical', callTime: '8 min ago', status: 'Waiting' },
  { id: 'EC-003', callerName: 'Linda Chen', phone: '(512) 555-0201', issue: 'No hot water — water heater leaking from bottom', urgency: 'High', callTime: '15 min ago', status: 'Waiting' },
  { id: 'EC-004', callerName: 'Robert Kim', phone: '(512) 555-0113', issue: 'Kitchen sink clogged — water not draining', urgency: 'Medium', callTime: '28 min ago', status: 'Waiting' },
  { id: 'EC-005', callerName: 'Oak Springs Apts', phone: '(512) 555-0300', issue: 'Unit 312 — toilet overflowing, tenant reports', urgency: 'High', callTime: '35 min ago', status: 'Dispatched' },
  { id: 'EC-006', callerName: 'Diana Foster', phone: '(512) 555-0072', issue: 'Dripping faucet in guest bathroom', urgency: 'Low', callTime: '1 hr ago', status: 'Waiting' },
  { id: 'EC-007', callerName: 'Sunset Retirement Home', phone: '(512) 555-0450', issue: 'Building C — water pressure dropped to near zero', urgency: 'Critical', callTime: '42 min ago', status: 'Dispatched' },
  { id: 'EC-008', callerName: 'James Wilson', phone: '(512) 555-0098', issue: 'Gas smell near water heater — possible leak', urgency: 'Critical', callTime: '55 min ago', status: 'Resolved' },
];

const URGENCY_COLORS: Record<string, string> = {
  Low: 'bg-blue-100 text-blue-700 border-blue-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Critical: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_COLORS: Record<string, string> = {
  Waiting: 'bg-yellow-100 text-yellow-700',
  Dispatched: 'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
};

/* ── Skeleton ── */
function CallCardsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 rounded-xl bg-white/5 ring-1 ring-black/5" />
      ))}
    </div>
  );
}

/* ── Main Page ── */
export default function EmergencyTriagePage() {
  const [calls, setCalls] = useState<EmergencyCall[]>(MOCK_CALLS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triageInput, setTriageInput] = useState('');
  const [triageResult, setTriageResult] = useState<AITriageResult | null>(null);
  const [triageLoading, setTriageLoading] = useState(false);

  const activeCalls = calls.filter((c: any) => c.status === 'Waiting').length;

  /* ── Handlers ── */
  const handleDispatch = (id: string) => {
    setCalls(prev => prev.map(c => c.id === id ? { ...c, status: 'Dispatched' as const } : c));
  };

  const handleResolve = (id: string) => {
    setCalls(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved' as const } : c));
  };

  const handleLogLead = (call: EmergencyCall) => {
    window.location.href = `/leads?name=${encodeURIComponent(call.callerName)}&phone=${encodeURIComponent(call.phone)}&issue=${encodeURIComponent(call.issue)}`;
  };

  const handleCallBack = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleAnalyzeUrgency = async () => {
    if (!triageInput.trim()) return;
    setTriageLoading(true);
    setTriageResult(null);

    // Simulate AI urgency assessment (since we don't have a dedicated endpoint for this)
    setTimeout(() => {
      const lower = triageInput.toLowerCase();
      let priority = 'Standard';
      let action = 'Schedule a service visit during business hours.';
      let responseTime = '4–8 hours';

      if (lower.includes('burst') || lower.includes('flood') || lower.includes('sewage') || lower.includes('gas')) {
        priority = 'Critical — Immediate Response';
        action = 'Dispatch nearest available tech immediately. Safety first — shut off main water/gas if needed.';
        responseTime = '15–30 minutes';
      } else if (lower.includes('leak') || lower.includes('no hot water') || lower.includes('overflow')) {
        priority = 'High — Priority Response';
        action = 'Dispatch closest tech within the hour. Assess damage level on arrival.';
        responseTime = '1–2 hours';
      } else if (lower.includes('clog') || lower.includes('drain') || lower.includes('slow')) {
        priority = 'Medium — Standard Response';
        action = 'Schedule a service visit. Can be handled during regular routing.';
        responseTime = '2–4 hours';
      }

      setTriageResult({ priority, suggestedAction: action, estimatedResponseTime: responseTime });
      setTriageLoading(false);
    }, 1500);
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
        <CallCardsSkeleton />
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Emergency Call Triage</h1>
        <Card variant="bordered" padding="lg">
          <ErrorState title="Failed to load calls" message={error} onRetry={() => setError(null)} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emergency Call Triage</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage after-hours emergency calls and dispatch response.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-semibold text-foreground">{activeCalls} Active {activeCalls === 1 ? 'Call' : 'Calls'}</span>
        </div>
      </div>

      {/* Empty State */}
      {calls.filter((c: any) => c.status !== 'Resolved').length === 0 && (
        <Card variant="bordered" padding="lg">
          <EmptyState
            icon={
              <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="No active emergencies"
            description="All calls have been resolved or dispatched. Great work!"
          />
        </Card>
      )}

      {/* Call Cards */}
      {calls.filter((c: any) => c.status !== 'Resolved').length > 0 && (
        <div className="space-y-4">
          {calls.filter((c: any) => c.status !== 'Resolved').map((call) => (
            <Card key={call.id} variant="bordered" padding="md">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Left Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{call.callerName}</h3>
                    <a href={`tel:${call.phone}`} className="text-xs text-primary hover:underline">{call.phone}</a>
                    <span className={`ml-auto sm:ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${URGENCY_COLORS[call.urgency]}`}>
                      {call.urgency}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{call.issue}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground/80">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {call.callTime}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[call.status]}`}>
                      {call.status}
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex sm:flex-col items-center sm:items-stretch gap-2 shrink-0">
                  {call.status === 'Waiting' && (
                    <Button variant="primary" size="sm" onClick={() => handleDispatch(call.id)}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Dispatch Now
                    </Button>
                  )}
                  {call.status === 'Dispatched' && (
                    <Button variant="primary" size="sm" onClick={() => handleResolve(call.id)}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Resolve
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCallBack(call.phone)}
                      className="inline-flex items-center gap-1 rounded-xl bg-white/5 ring-1 ring-black/5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      Call Back
                    </button>
                    <button
                      onClick={() => handleLogLead(call)}
                      className="inline-flex items-center gap-1 rounded-xl bg-white/5 ring-1 ring-black/5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                      Log as Lead
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Triage AI Panel */}
      <Card variant="bordered" padding="md">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Triage AI Assistance
        </h2>
        <div className="space-y-3">
          <textarea
            value={triageInput}
            onChange={(e) => setTriageInput(e.target.value)}
            placeholder="Describe the customer's issue from the call..."
            rows={4}
            className="w-full rounded-xl ring-1 ring-black/5 bg-white px-4 py-3 text-sm text-foreground placeholder-gray-400 outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-primary/20 resize-none"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">{triageInput.length} characters</p>
            <Button
              variant="primary"
              size="sm"
              disabled={!triageInput.trim() || triageLoading}
              loading={triageLoading}
              onClick={handleAnalyzeUrgency}
            >
              {triageLoading ? 'Analyzing...' : 'Analyze Urgency'}
            </Button>
          </div>
        </div>

        {/* AI Recommendation */}
        {triageLoading && (
          <div className="mt-4 space-y-3 animate-pulse">
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-3/4 rounded bg-muted" />
          </div>
        )}

        {triageResult && !triageLoading && (
          <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-primary">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-primary">AI Urgency Assessment</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2">
                    <span className="text-xs text-muted-foreground">Response Priority</span>
                    <span className="text-xs font-semibold text-foreground">{triageResult.priority}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2">
                    <span className="text-xs text-muted-foreground">Suggested Action</span>
                    <span className="text-xs text-foreground text-right max-w-[200px]">{triageResult.suggestedAction}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2">
                    <span className="text-xs text-muted-foreground">Estimated Response Time</span>
                    <span className="text-xs font-semibold text-foreground">{triageResult.estimatedResponseTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
