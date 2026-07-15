'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import PlumbCoreLogo from '@/components/PlumbCoreLogo';

/* ── Types ── */
type LeadStatus = 'pending' | 'routing' | 'matching' | 'assigned' | 'en_route' | 'arrived' | 'complete' | 'refunded';

interface PlumberInfo {
  id: string; companyId: string; companyName: string; phone: string;
  avgRating: number; totalReviews: number; licenseNumber: string; logoUrl: string;
}

interface LeadStatusResponse {
  id: string; status: LeadStatus; diagnosis: string; severity: string;
  totalEstimate: number; depositPaid: number; customerCity: string;
  customerName: string; createdAt: string; estimatedJobValue: number;
  plumber: PlumberInfo | null;
}

/* ── Icons ── */
const I = {
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Truck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  Pin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  Party: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 21.75h16.5M12 3l.375 1.688c.255 1.148.757 2.224 1.473 3.127l1.03 1.299c.507.64.192 1.655-.592 1.916l-.012.004a9.925 9.925 0 01-6.548 0l-.012-.004c-.784-.261-1.099-1.277-.592-1.916l1.03-1.299A7.199 7.199 0 0012 3z" />
    </svg>
  ),
  Star: (p: any) => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
};

/* ── State Display Components ── */

function MatchingState({ data }: { data: LeadStatusResponse }) {
  return (
    <div className="space-y-6">
      {/* Spinner */}
      <div className="flex justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
          <div className="absolute inset-0 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-1.5">Finding your plumber...</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          We&apos;re searching our network of licensed plumbers in <strong className="text-slate-700">{data.customerCity || 'your area'}</strong>.
          You&apos;ll receive a notification when we find the right match.
        </p>
      </div>

      {/* Estimate Card */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimate Details</p>
        </div>
        <div className="px-4 py-3 space-y-3">
          <Row label="Issue" value={data.diagnosis} />
          <Row label="Severity" value={data.severity} highlight={data.severity === 'emergency' ? 'text-red-600' : 'text-slate-900'} />
          <Row label="Estimate" value={`$${data.totalEstimate?.toFixed(2)}`} />
          <div className="border-t border-slate-100 pt-3">
            <Row label="Deposit Paid" value={`-$${data.depositPaid?.toFixed(2)}`} valueClass="text-emerald-600 font-medium" />
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-sm font-bold text-slate-900">Remaining Balance</span>
              <span className="text-base font-bold text-blue-600">${((data.totalEstimate || 0) - (data.depositPaid || 0)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Badge */}
      <div className="bg-blue-50 rounded-2xl px-4 py-3 flex items-start gap-2.5 ring-1 ring-blue-200">
        <span className="text-lg shrink-0 mt-0.5">🔒</span>
        <div>
          <p className="text-sm font-semibold text-blue-800">48-Hour Refund Guarantee</p>
          <p className="text-xs text-blue-600 mt-0.5">Fully refundable if we can&apos;t find a plumber in your area.</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight, valueClass }: { label: string; value: string; highlight?: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-medium text-right max-w-[55%] ${valueClass || highlight || 'text-slate-900'}`}>{value}</span>
    </div>
  );
}

function PlumberCard({ plumber, actionLabel, actionHref }: { plumber: PlumberInfo; actionLabel: string; actionHref: string }) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-xl font-bold text-blue-600 shrink-0 ring-2 ring-white shadow-sm">
            {plumber.logoUrl ? (
              <img src={plumber.logoUrl} alt={plumber.companyName} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              plumber.companyName.split(' ').map(w => w[0]).slice(0, 2).join('')
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-slate-900 truncate">{plumber.companyName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <I.Star key={i} />
                ))}
              </div>
              <span className="text-xs text-slate-500">({plumber.totalReviews || 0})</span>
            </div>
          </div>
        </div>

        {plumber.licenseNumber && (
          <div className="bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700 font-medium inline-flex items-center gap-1.5 mb-4">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
            Licensed & Insured
          </div>
        )}

        <a href={actionHref} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] transition-all shadow-md shadow-blue-500/20">
          <I.Phone /> {actionLabel}
        </a>
      </div>
    </div>
  );
}

function AssignedState({ data }: { data: LeadStatusResponse }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <div className="w-8 h-8 text-emerald-500"><I.Check /></div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Plumber Assigned! 🎉</h2>
        <p className="text-sm text-slate-500">A licensed plumber has been assigned to your job</p>
      </div>

      {data.plumber ? (
        <PlumberCard plumber={data.plumber} actionLabel="Call for ETA" actionHref={`tel:${data.plumber.phone}`} />
      ) : (
        <div className="bg-amber-50 rounded-2xl px-4 py-3 text-sm text-amber-700 text-center ring-1 ring-amber-200">
          Plumber details loading — check back in a moment
        </div>
      )}
    </div>
  );
}

function EnRouteState({ data }: { data: LeadStatusResponse }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-3">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-2xl"><I.Truck /></span>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
            EN ROUTE
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Your plumber is on the way!</h2>
        <p className="text-sm text-slate-500">{data.plumber?.companyName || 'Your plumber'} is heading to your location.</p>
      </div>

      {/* Map placeholder */}
      <div className="bg-slate-100 rounded-2xl h-44 flex items-center justify-center ring-1 ring-black/5">
        <div className="text-center text-slate-400">
          <span className="text-2xl block mb-1">🗺️</span>
          <p className="text-sm font-medium">Live Map</p>
          <p className="text-xs mt-0.5">Plumber tracking will appear here</p>
        </div>
      </div>

      {/* ETA */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">⏱️</span>
          <div>
            <p className="text-xs text-slate-500">Estimated Arrival</p>
            <p className="text-lg font-bold text-slate-900">15-30 minutes</p>
          </div>
        </div>
      </div>

      {data.plumber && (
        <a href={`tel:${data.plumber.phone}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] transition-all shadow-md shadow-blue-500/20">
          <I.Phone /> Call Plumber
        </a>
      )}
    </div>
  );
}

function ArrivedState({ data }: { data: LeadStatusResponse }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">✅</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Your plumber has arrived!</h2>
        <p className="text-sm text-slate-500">{data.plumber?.companyName || 'Your plumber'} is at your location and ready to begin.</p>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-5 text-center ring-1 ring-emerald-200">
        <span className="text-3xl block mb-2">📸</span>
        <p className="text-sm font-semibold text-emerald-800">Photo Check-In</p>
        <p className="text-xs text-emerald-600 mt-0.5">Your plumber has checked in at your location</p>
      </div>

      {data.plumber && (
        <a href={`tel:${data.plumber.phone}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] transition-all shadow-md shadow-blue-500/20">
          <I.Phone /> Contact Plumber
        </a>
      )}
    </div>
  );
}

function CompleteState({ data }: { data: LeadStatusResponse }) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <div className="w-8 h-8 text-emerald-500"><I.Check /></div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Job Complete! 🎉</h2>
        <p className="text-sm text-slate-500">Thank you for choosing PlumbCore AI. We hope everything went smoothly!</p>
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-slate-900 text-center mb-3">How did we do?</p>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all active:scale-90 ${
                (hoveredStar || selectedStar) >= star
                  ? 'bg-amber-100 text-amber-500'
                  : 'bg-slate-100 text-slate-300 hover:bg-amber-50 hover:text-amber-400'
              }`}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setSelectedStar(star)}
            >
              ★
            </button>
          ))}
        </div>
        {selectedStar > 0 && (
          <p className="text-xs text-slate-400 text-center mt-2">
            {selectedStar === 5 ? 'Amazing! Thank you! ⭐' :
             selectedStar === 4 ? 'Great! We appreciate it!' :
             selectedStar >= 3 ? 'Thanks for your feedback!' :
             'We\'re sorry — we\'ll improve!'}
          </p>
        )}
        {selectedStar === 0 && (
          <p className="text-xs text-slate-400 text-center mt-2">Tap a star to rate your experience</p>
        )}
      </div>

      <a href="#" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        View Invoice
      </a>
    </div>
  );
}

function RefundedState({ data }: { data: LeadStatusResponse }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">💸</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Refund Processed</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          We were unable to find an available plumber in your area. Your deposit of{' '}
          <strong className="text-slate-700">${data.depositPaid?.toFixed(2)}</strong> has been refunded.
        </p>
      </div>

      <div className="bg-amber-50 rounded-2xl px-4 py-3 ring-1 ring-amber-200 text-center">
        <p className="text-sm text-amber-700">
          ✅ Refund of <strong>${data.depositPaid?.toFixed(2)}</strong> processed. Please allow 5-10 business days to appear on your statement.
        </p>
      </div>
    </div>
  );
}

/* ── Progress Bar ── */
const STEPS = [
  { key: 'matching' as LeadStatus, icon: '🔍' },
  { key: 'assigned' as LeadStatus, icon: '✓' },
  { key: 'en_route' as LeadStatus, icon: '🚛' },
  { key: 'arrived' as LeadStatus, icon: '📍' },
  { key: 'complete' as LeadStatus, icon: '🎉' },
];
const ORDER = ['pending', 'routing', 'matching', 'assigned', 'en_route', 'arrived', 'complete', 'refunded'];
const LABELS: Record<string, string> = { matching: 'Finding', assigned: 'Assigned', en_route: 'En Route', arrived: 'Arrived', complete: 'Done' };

function ProgressBar({ status }: { status: LeadStatus }) {
  if (status === 'refunded') return null;
  const currentIdx = ORDER.indexOf(status);

  return (
    <div className="flex items-center justify-between max-w-sm mx-auto mb-8 px-2">
      {STEPS.map((step, i) => {
        const stepIdx = ORDER.indexOf(step.key);
        const isActive = currentIdx >= stepIdx;
        const isCurrent = status === step.key;
        return (
          <div key={step.key} className="flex flex-col items-center gap-1.5 flex-1 relative">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              isActive
                ? isCurrent
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                  : 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-300'
            }`}>
              {step.key === 'matching' ? '🔍' : step.key === 'en_route' ? '🚛' : isActive && step.key !== 'arrived' ? '✓' : step.icon}
            </div>
            <span className={`text-[10px] font-medium text-center ${isActive ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
              {LABELS[step.key] || step.key}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`absolute top-4 h-0.5 w-full left-1/2 -translate-y-1/2 -z-10 ${isActive ? 'bg-blue-500' : 'bg-slate-200'}`} />
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
        if (res.status === 404) { setError('Tracking page not found. Please check your tracking link.'); setLoading(false); return; }
        throw new Error(`HTTP ${res.status}`);
      }
      setData(await res.json());
      setError(null);
    } catch (err: any) {
      console.error('[Track] Poll error:', err.message);
      if (!data) setError('Unable to load tracking information. Please try again.');
    } finally { setLoading(false); }
  }, [leadId, data]);

  useEffect(() => {
    if (!leadId) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, [leadId, fetchStatus]);

  const renderContent = () => {
    if (!leadId) return <p className="text-sm text-slate-500">No lead ID provided.</p>;
    if (loading) return (
      <div className="flex flex-col items-center gap-3 py-20">
        <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading tracking info...</p>
      </div>
    );
    if (error && !data) return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3"><span className="text-xl">⚠️</span></div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Something went wrong</h2>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <button onClick={fetchStatus} className="py-2.5 px-6 rounded-xl bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 active:scale-[0.98] transition-all">Try Again</button>
      </div>
    );
    if (!data) return null;

    const status = data.status || 'matching';
    return (
      <>
        <ProgressBar status={status} />
        {status === 'pending' || status === 'routing' || status === 'matching' ? <MatchingState data={data} /> :
         status === 'assigned' ? <AssignedState data={data} /> :
         status === 'en_route' ? <EnRouteState data={data} /> :
         status === 'arrived' ? <ArrivedState data={data} /> :
         status === 'complete' ? <CompleteState data={data} /> :
         status === 'refunded' ? <RefundedState data={data} /> :
         <MatchingState data={data} />}
        <div className="text-center mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Need help? <a href="tel:+155****4567" className="text-blue-600 font-medium">(555) 123-4567</a>
            {' · '}
            <button onClick={fetchStatus} className="text-blue-600 font-medium hover:underline">Refresh</button>
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white/80 backdrop-blur-xl ring-1 ring-black/5 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <PlumbCoreLogo size="sm" showText={true} />
          <a href="tel:+155****4567" className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-all active:scale-95">
            <I.Phone /> Call
          </a>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
