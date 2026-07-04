'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function QuoteStatusPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [quoteData, setQuoteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('analyzing');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/quotes/${token}`, { headers: { 'Content-Type': 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          setQuoteData(data);
          setStatus(data.status || 'quoted');
        } else {
          setStatus('expired');
        }
      } catch { setStatus('expired'); }
      setLoading(false);
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-gray-200 border-t-gray-900 rounded-full" />
      </div>
    );
  }

  const statusConfig: Record<string, { title: string; desc: string; color: string }> = {
    analyzing: { title: 'Analyzing your photos', desc: 'Our AI is examining the issue and matching parts. This takes about 30 seconds.', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    quoted: { title: 'Your estimate is ready', desc: 'Review the breakdown below and book your appointment.', color: 'bg-green-50 text-green-700 border-green-200' },
    scheduled: { title: 'Appointment confirmed', desc: 'A plumber is scheduled. Check your SMS for updates.', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    completed: { title: 'Job completed', desc: 'This job has been completed. Thank you for choosing PlumbCore.', color: 'bg-gray-50 text-gray-700 border-gray-200' },
    expired: { title: 'Link expired', desc: 'This quote link has expired. Please request a new quote.', color: 'bg-red-50 text-red-700 border-red-200' },
  };

  const config = statusConfig[status] || statusConfig.expired;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><span className="text-sm font-bold">plumbcore</span></div>
          <p className="text-xs text-gray-400">Quote status</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className={`rounded-2xl border ${config.color} p-5 mb-6`}>
          <h2 className="text-lg font-bold mb-1">{config.title}</h2>
          <p className="text-sm opacity-80">{config.desc}</p>
        </div>

        {status !== 'expired' && quoteData && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 bg-gray-900 text-white text-center"><p className="text-lg font-bold">{quoteData.priceLow} - {quoteData.priceHigh}</p><p className="text-xs text-gray-400 mt-0.5">Estimated total</p></div>
            {quoteData.photos?.length > 0 && <div className="px-5 py-4 border-b border-gray-50"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Photos</p><div className="grid grid-cols-3 gap-2">{quoteData.photos.map((p: string, i: number) => <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100"><img src={p} className="w-full h-full object-cover" alt="" /></div>)}</div></div>}
            {quoteData.diagnosis && <div className="px-5 py-4 border-b border-gray-50"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Diagnosis</p><p className="text-sm text-gray-900 mt-1">{quoteData.diagnosis}</p></div>}
            {quoteData.parts?.length > 0 && <div className="px-5 py-4 border-b border-gray-50"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Parts needed</p>{quoteData.parts.map((p: any, i: number) => <div key={i} className="flex items-center justify-between py-1.5"><span className="text-sm text-gray-700">{p.qty}x {p.name}</span><span className="text-sm font-medium">{p.total}</span></div>)}</div>}
            <div className="flex items-center justify-between px-5 py-4 bg-gray-50"><span className="text-sm text-gray-600">Total estimate</span><span className="text-2xl font-bold">{quoteData.priceLow} - {quoteData.priceHigh}</span></div>
          </div>
        )}

        {status === 'quoted' && (
          <div className="mt-6 space-y-3">
            <button className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl active:scale-[0.97] transition-all text-sm">Pay 49 deposit and book</button>
            <button onClick={() => router.push('/quote/plumbcore')} className="w-full border border-gray-200 text-gray-700 font-medium py-3.5 rounded-xl hover:bg-gray-50 transition-all text-sm">Request new quote</button>
          </div>
        )}

        {status === 'expired' && (
          <button onClick={() => router.push('/quote/plumbcore')} className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl active:scale-[0.97] transition-all text-sm mt-6">Request new quote</button>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">Secured by PlumbCore · Your data is encrypted</p>
      </div>
    </div>
  );
}