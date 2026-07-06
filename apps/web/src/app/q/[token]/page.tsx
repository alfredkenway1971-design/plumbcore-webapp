'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useI18n } from '@/components/i18n-provider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Check, Clock, Shield, Star, Phone, ChevronRight, X, AlertTriangle, MessageCircle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string; icon: any }> = {
  analyzing: { label: 'Analyzing', bg: 'bg-blue-50', color: 'text-blue-700', border: 'border-blue-200', icon: Clock },
  quoted: { label: 'Ready', bg: 'bg-emerald-50', color: 'text-emerald-700', border: 'border-emerald-200', icon: Check },
  deposit_paid: { label: 'Deposit Paid', bg: 'bg-amber-50', color: 'text-amber-700', border: 'border-amber-200', icon: Check },
  scheduled: { label: 'Scheduled', bg: 'bg-blue-50', color: 'text-blue-700', border: 'border-blue-200', icon: Calendar },
  completed: { label: 'Completed', bg: 'bg-emerald-50', color: 'text-emerald-700', border: 'border-emerald-200', icon: Check },
  expired: { label: 'Expired', bg: 'bg-red-50', color: 'text-red-700', border: 'border-red-200', icon: AlertTriangle },
};

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const steps = ['analyzing','quoted','deposit_paid','scheduled','completed'];
  const idx = steps.indexOf(currentStatus);
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <div key={s} className="flex-1 flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i <= idx ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {i <= idx ? <Check className="w-3 h-3" /> : i + 1}
          </div>
          <span className={`text-[10px] mt-1 ${i <= idx ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>{s.replace('_',' ')}</span>
        </div>
      ))}
    </div>
  );
}

export default function QuoteStatusPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { locale, changeLocale } = useI18n();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('analyzing');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/quotes/${token}`, { headers: { 'Content-Type': 'application/json' } });
        if (res.ok) { const d = await res.json(); setData(d); setStatus(d.status || 'quoted'); }
        else setStatus('expired');
      } catch { setStatus('expired'); }
      setLoading(false);
    };
    load();
  }, [token]);

  const config = statusConfig[status] || statusConfig.expired;
  const isExpired = status === 'expired';
  const plumber = { name: 'Mike Torres', rating: 4.9, jobs: 1286, license: 'PLC-4582-TX' };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 mx-auto relative"><div className="absolute inset-0 rounded-full border-3 border-slate-100" /><div className="absolute inset-0 rounded-full border-3 border-blue-500 border-t-transparent animate-spin" /></div>
        <p className="text-sm text-slate-500">Loading your estimate...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm"><span className="text-white text-sm font-bold">P</span></div>
            <div><p className="text-sm font-bold text-slate-900">Your Estimate</p><p className="text-[11px] text-slate-400">PlumbCore AI &bull; Premium Plumbing</p></div>
          </a>
          <div className="flex items-center gap-2">
            <Badge className={`${config.bg} ${config.color} ${config.border} text-xs font-medium px-3 py-1`}>{config.label}</Badge>
            <LanguageSwitcher locale={locale} onLocaleChange={l => changeLocale(l as 'en'|'fr'|'es'|'de')} />
          </div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 pb-16">
        {!isExpired && data && (
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}><config.icon className={`w-4 h-4 ${config.color}`} /></div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {status === 'analyzing' && "We're analyzing your photos"}
                    {status === 'quoted' && 'Your estimate is ready'}
                    {status === 'deposit_paid' && 'Deposit confirmed — booking your appointment'}
                    {status === 'scheduled' && 'Appointment confirmed'}
                    {status === 'completed' && 'Job completed'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {status === 'analyzing' && 'AI is identifying the issue...'}
                    {status === 'quoted' && 'Review the breakdown below and book.'}
                    {status === 'deposit_paid' && 'Your plumber will arrive on time.'}
                    {status === 'scheduled' && 'Check SMS for real-time updates.'}
                    {status === 'completed' && 'Thank you for choosing PlumbCore AI.'}
                  </p>
                </div>
              </CardContent>
            </Card>
            {data.photos?.length > 0 && (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Photos</p>
                  <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2">
                    {data.photos.map((p: string, i: number) => (
                      <button key={i} onClick={() => setPhotoPreview(p)} className="snap-start shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:border-blue-400 transition-all active:scale-95"><img src={p} alt={`Photo ${i+1}`} className="w-full h-full object-cover" /></button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white text-center"><p className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-1">Total Estimated Price</p><p className="text-3xl sm:text-4xl font-extrabold">${data.totalPrice?.toFixed(2) || '0.00'}</p></div>
              <CardContent className="p-5 space-y-4">
                {data.diagnosis && <><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Diagnosis</p><p className="text-sm font-medium text-slate-900">{data.diagnosis}</p></div>{data.confidence && <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium px-2.5 py-0.5 shrink-0">{data.confidence}%</Badge>}</div><Separator className="bg-slate-100" /></>}
                {data.laborCost && <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Labor {data.estimatedHours}h @ ${data.laborRate||120}/hr</span><span className="text-sm font-semibold text-slate-900">${data.laborCost.toFixed(2)}</span></div>}
                {data.parts?.length > 0 && <><Separator className="bg-slate-100" /><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Parts</p>{data.parts.map((p:any,i:number) => <div key={i} className="flex items-center justify-between py-1"><span className="text-sm text-slate-700">{p.qty}x {p.name}</span><span className="text-sm font-semibold text-slate-900">${p.total?.toFixed(2)||'0.00'}</span></div>)}</div></>}
                {data.tax && <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Tax ({(data.taxRate||8.5)*100}%)</span><span className="text-sm font-semibold text-slate-900">${data.tax.toFixed(2)}</span></div>}
                <Separator className="bg-slate-100" /><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-900">Total</span><span className="text-xl font-extrabold text-blue-600">${data.totalPrice?.toFixed(2)||'0.00'}</span></div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm"><CardContent className="p-5"><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Your Plumber</p><div className="flex items-center gap-4"><Avatar className="w-14 h-14"><AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm font-bold">MT</AvatarFallback></Avatar><div className="flex-1"><p className="text-base font-bold text-slate-900">{plumber.name}</p><div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5"><span className="flex items-center gap-0.5"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{plumber.rating}</span><span>&bull;</span><span>{plumber.jobs.toLocaleString()} jobs</span><span>&bull;</span><span>Lic. {plumber.license}</span></div></div><a href="tel:+155****4567" className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 active:scale-90 transition-all"><Phone className="w-5 h-5" /></a></div></CardContent></Card>
            <div className="space-y-3">
              {status === 'quoted' && <button className="w-full h-12 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold shadow-sm transition-all active:scale-[0.97]">Pay $49 Deposit &amp; Book</button>}
              {status === 'deposit_paid' && <button className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm transition-all active:scale-[0.97]"><Check className="w-4 h-4 inline mr-2" />Deposit Confirmed</button>}
              <div className="grid grid-cols-3 gap-2">
                <button className="rounded-xl border border-slate-200 text-slate-600 text-xs py-3 h-11 font-medium active:scale-[0.97] transition-all"><Calendar className="w-4 h-4 inline mr-1.5" />Reschedule</button>
                <button className="rounded-xl border border-slate-200 text-slate-600 text-xs py-3 h-11 font-medium active:scale-[0.97] transition-all"><MessageCircle className="w-4 h-4 inline mr-1.5" />Ask</button>
                <button className="rounded-xl border border-slate-200 text-red-500 text-xs py-3 h-11 font-medium hover:text-red-600 active:scale-[0.97] transition-all"><X className="w-4 h-4 inline mr-1.5" />Cancel</button>
              </div>
            </div>
            <Card className="border-slate-200 shadow-sm"><CardContent className="p-5"><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Progress</p><StatusTimeline currentStatus={status} /></CardContent></Card>
            <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Secured by PlumbCore AI &bull; Your data is encrypted</p>
          </div>
        )}
        {isExpired && (
          <Card className="border-red-200 bg-red-50 shadow-sm"><CardContent className="p-8 text-center"><div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3"><AlertTriangle className="w-6 h-6 text-red-500" /></div><h3 className="text-base font-bold text-slate-900 mb-1">This link has expired</h3><p className="text-sm text-slate-500 mb-5">Quote links are valid for 7 days.</p><button onClick={() => router.push('/quote/plumbcore')} className="h-11 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold transition-all active:scale-[0.97]">Request new quote</button></CardContent></Card>
        )}
        {!isExpired && !data && <p className="text-center text-sm text-slate-500 py-12">No estimate data found for this link.</p>}
      </div>
      {photoPreview && <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer" onClick={() => setPhotoPreview(null)}><img src={photoPreview} alt="Enlarged" className="max-w-full max-h-[90vh] rounded-lg object-contain" /></div>}
    </div>
  );
}
