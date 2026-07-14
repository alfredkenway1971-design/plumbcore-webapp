'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

/* ── Types ── */

type LeadStatus = 'pending' | 'routing' | 'matching' | 'assigned' | 'en_route' | 'arrived' | 'complete' | 'refunded';

interface LeadStatusResponse {
  id: string;
  status: LeadStatus;
  diagnosis: string;
  severity: string;
  totalEstimate: number;
  depositPaid: number;
  customerCity: string;
  customerName: string;
  createdAt: string;
  estimatedJobValue: number;
  plumber: {
    id: string;
    companyId: string;
    companyName: string;
    phone: string;
    avgRating: number;
    totalReviews: number;
    licenseNumber: string;
    logoUrl: string;
  } | null;
}

/* ── State Display Components ── */

function MatchingState({ data }: { data: LeadStatusResponse }) {
  return (
    <div className="space-y-8 text-center">
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl">🔍</span>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Finding your plumber...</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          We&apos;re searching our network of licensed plumbers in <strong>{data.customerCity || 'your area'}</strong>.
          You&apos;ll receive a notification when we find the right match.
        </p>
      </div>
      <div className="bg-slate-50 rounded-2xl p-6 max-w-sm mx-auto text-left space-y-3">
        <h3 className="font-semibold text-slate-900 text-sm">Estimate Details</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Issue</span>
            <span className="text-slate-900 font-medium text-right max-w-[200px]">{data.diagnosis}</span>
          </div>
          <div className="flex justify-between">
            <span>Severity</span>
            <span className="capitalize text-slate-900 font-medium">{data.severity}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimate</span>
            <span className="text-slate-900 font-medium">${data.totalEstimate?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Deposit Paid</span>
            <span className="text-emerald-600 font-medium">${data.depositPaid?.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-sm mx-auto">
        <p className="text-sm text-blue-700">
          🔒 <strong>48-Hour Refund Guarantee</strong> — Fully refundable if we can&apos;t find a plumber.
        </p>
      </div>
    </div>
  );
}

function AssignedState({ data }: { data: LeadStatusResponse }) {
  const plumber = data.plumber;
  return (
    <div className="space-y-8 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Plumber Assigned! 🎉</h2>
        <p className="text-slate-500">A licensed plumber has been assigned to your job</p>
      </div>

      {plumber && (
        <div className="bg-white ring-1 ring-black/5 rounded-2xl p-6 max-w-sm mx-auto shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-2xl shrink-0">
              {plumber.logoUrl ? (
                <img src={plumber.logoUrl} alt={plumber.companyName} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                '🔧'
              )}
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900 text-lg">{plumber.companyName}</p>
              {plumber.avgRating && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-amber-400 text-sm">{'★'.repeat(Math.round(plumber.avgRating))}</span>
                  <span className="text-slate-500 text-xs">({plumber.totalReviews || 0} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {plumber.licenseNumber && (
            <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700 inline-flex items-center gap-1 mb-4">
              <span>✅</span> Licensed: {plumber.licenseNumber}
            </div>
          )}

          <a
            href={`tel:${plumber.phone}`}
            className="block w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm hover:from-blue-500 hover:to-cyan-400 transition-all shadow-md"
          >
            📞 Call {plumber.companyName}
          </a>
        </div>
      )}

      {!plumber && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm mx-auto">
          <p className="text-sm text-amber-700">Plumber details loading. Refresh in a moment.</p>
        </div>
      )}
    </div>
  );
}

function EnRouteState({ data }: { data: LeadStatusResponse }) {
  const plumber = data.plumber;
  return (
    <div className="space-y-8 text-center">
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-amber-100 flex items-center justify-center">
          <span className="text-4xl">🚛</span>
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
          ON THE WAY
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your plumber is on the way!</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          {plumber?.companyName || 'Your plumber'} is heading to your location.
        </p>
      </div>

      {/* Live Map Placeholder */}
      <div className="bg-slate-100 rounded-2xl h-48 max-w-sm mx-auto flex items-center justify-center ring-1 ring-black/5">
        <div className="text-center text-slate-400">
          <span className="text-3xl block mb-2">🗺️</span>
          <p className="text-sm font-medium">Live Map</p>
          <p className="text-xs">Plumber tracking will appear here</p>
        </div>
      </div>

      {/* ETA Placeholder */}
      <div className="bg-white ring-1 ring-black/5 rounded-xl p-4 max-w-sm mx-auto">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">⏱️</span>
          <div>
            <p className="text-sm text-slate-500">Estimated Arrival</p>
            <p className="text-lg font-bold text-slate-900">15-30 minutes</p>
          </div>
        </div>
      </div>

      {plumber && (
        <a
          href={`tel:${plumber.phone}`}
          className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm hover:from-blue-500 hover:to-cyan-400 transition-all shadow-md"
        >
          📞 Call Plumber
        </a>
      )}
    </div>
  );
}

function ArrivedState({ data }: { data: LeadStatusResponse }) {
  const plumber = data.plumber;
  return (
    <div className="space-y-8 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <span className="text-4xl">✅</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your plumber has arrived!</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          {plumber?.companyName || 'Your plumber'} is at your location and ready to begin.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 max-w-sm mx-auto">
        <div className="text-5xl mb-3">📸</div>
        <p className="text-sm text-green-700 font-medium">Photo Check-In</p>
        <p className="text-xs text-green-600 mt-1">Your plumber has checked in at your location</p>
      </div>

      {plumber && (
        <a
          href={`tel:${plumber.phone}`}
          className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm hover:from-blue-500 hover:to-cyan-400 transition-all shadow-md"
        >
          📞 Contact Plumber
        </a>
      )}
    </div>
  );
}

function CompleteState({ data }: { data: LeadStatusResponse }) {
  return (
    <div className="space-y-8 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Complete! 🎉</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Thank you for choosing PlumbCore AI. We hope everything went smoothly!
        </p>
      </div>

      <div className="bg-white ring-1 ring-black/5 rounded-2xl p-6 max-w-sm mx-auto space-y-4 shadow-sm">
        {/* Review Stars */}
        <div>
          <p className="text-sm font-semibold text-slate-900 mb-2">How did we do?</p>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-500 text-slate-300 text-lg flex items-center justify-center transition-all active:scale-90"
                onClick={() => {
                  // TODO: Submit review
                  console.log(`Review: ${star} stars`);
                }}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1">Tap a star to rate your experience</p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <a
            href="#"
            className="block w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all"
          >
            📄 View Invoice
          </a>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Need help? Call <a href="tel:+15551234567" className="text-blue-600 font-medium">(555) 123-4567</a>
      </p>
    </div>
  );
}

function RefundedState({ data }: { data: LeadStatusResponse }) {
  return (
    <div className="space-y-8 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
        <span className="text-3xl">💸</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Refund Processed</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          We were unable to find an available plumber in your area. Your deposit of{' '}
          <strong>${data.depositPaid?.toFixed(2)}</strong> has been refunded.
        </p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm mx-auto">
        <p className="text-sm text-amber-700">
          ✅ Refund of <strong>${data.depositPaid?.toFixed(2)}</strong> processed. Please allow 5-10 business days to appear on your statement.
        </p>
      </div>
      <p className="text-xs text-slate-400">
        Need help? Call <a href="tel:+15551234567" className="text-blue-600 font-medium">(555) 123-4567</a>
      </p>
    </div>
  );
}

/* ── Progress Bar ── */

function ProgressBar({ status }: { status: LeadStatus }) {
  const steps = [
    { key: 'matching' as LeadStatus, label: 'Finding Plumber', icon: '🔍' },
    { key: 'assigned' as LeadStatus, label: 'Assigned', icon: '✅' },
    { key: 'en_route' as LeadStatus, label: 'On the Way', icon: '🚛' },
    { key: 'arrived' as LeadStatus, label: 'Arrived', icon: '📍' },
    { key: 'complete' as LeadStatus, label: 'Complete', icon: '🎉' },
  ];

  const order = ['pending', 'routing', 'matching', 'assigned', 'en_route', 'arrived', 'complete', 'refunded'];
  const currentIdx = order.indexOf(status);

  if (status === 'refunded') return null;

  return (
    <div className="flex items-center justify-between max-w-md mx-auto mb-10">
      {steps.map((step, i) => {
        const stepIdx = order.indexOf(step.key);
        const isActive = currentIdx >= stepIdx;
        const isCurrent = status === step.key;
        return (
          <div key={step.key} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all ${
                isActive
                  ? isCurrent
                    ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                    : 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step.icon}
            </div>
            <span className={`text-[10px] font-medium text-center ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`absolute mt-4 h-0.5 w-full left-1/2 ${isActive ? 'bg-blue-500' : 'bg-slate-200'}`}
                style={{ transform: 'translateY(18px)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Page ── */

export default function TrackPage() {
  const params = useParams();
  const leadId = params?.['lead-id'] as string;
  const [data, setData] = useState<LeadStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!leadId) return;
    try {
      const res = await fetch(`/api/leads/${leadId}/status`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Tracking page not found. Please check your tracking link.');
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const json: LeadStatusResponse = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error('[Track] Poll error:', err.message);
      if (!data) {
        setError('Unable to load tracking information. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [leadId, data]);

  // Initial fetch + poll every 30 seconds
  useEffect(() => {
    if (!leadId) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, [leadId, fetchStatus]);

  if (!leadId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p className="text-lg font-semibold">Invalid tracking link</p>
          <p className="text-sm">No lead ID provided.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-500 text-sm">Loading tracking info...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchStatus}
            className="py-2 px-6 rounded-xl bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const status = data.status || 'matching';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white ring-1 ring-black/5">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔧</span>
            <span className="text-sm font-bold text-slate-900">
              PlumbCore <span className="text-blue-500">AI</span>
            </span>
          </div>
          <a href={`tel:+15551234567`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            📞 (555) 123-4567
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <ProgressBar status={status} />

        {status === 'pending' || status === 'routing' || status === 'matching' ? (
          <MatchingState data={data} />
        ) : status === 'assigned' ? (
          <AssignedState data={data} />
        ) : status === 'en_route' ? (
          <EnRouteState data={data} />
        ) : status === 'arrived' ? (
          <ArrivedState data={data} />
        ) : status === 'complete' ? (
          <CompleteState data={data} />
        ) : status === 'refunded' ? (
          <RefundedState data={data} />
        ) : (
          <MatchingState data={data} />
        )}

        <div className="text-center mt-12">
          <p className="text-xs text-slate-400">
            Need help? Call <a href="tel:+15551234567" className="text-blue-600 font-medium">(555) 123-4567</a>
            {' · '}
            <button onClick={fetchStatus} className="text-blue-600 font-medium hover:underline">
              Refresh
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
