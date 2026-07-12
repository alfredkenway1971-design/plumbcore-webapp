'use client';

import { useState, useMemo } from 'react';
import { Search, Star, MessageSquare, ThumbsUp, Filter, Download, Building2 } from 'lucide-react';
import { downloadCSV } from '@/lib/csv-export';
const reviews = [
  { id: 'rev-001', company: 'Johnson Plumbing Co.', rating: 5, text: 'PlumbCore AI cut our estimate time from 30 minutes to 10 seconds. Our close rate went up 40% in the first month.', author: 'Mike Johnson', date: '2026-07-08', status: 'published', helpful: 24 },
  { id: 'rev-002', company: 'Bluewater Plumbing', rating: 5, text: 'The voice-to-invoice feature alone saves my techs 2 hours a day. Best investment we\'ve made.', author: 'Emily Waters', date: '2026-07-07', status: 'published', helpful: 18 },
  { id: 'rev-003', company: 'Metro Mechanical', rating: 3, text: 'Good platform but the mobile app could use some work. AI estimates are impressive though.', author: 'James Rodriguez', date: '2026-07-06', status: 'published', helpful: 7 },
  { id: 'rev-004', company: 'Apex Pipe & Drain', rating: 4, text: 'Route optimization saved us 12% on fuel costs last month. Scheduling is much smoother now.', author: 'Sarah Chen', date: '2026-07-05', status: 'published', helpful: 15 },
  { id: 'rev-005', company: 'Pinnacle Pipe & Drain', rating: 2, text: 'Still in trial but finding the interface a bit overwhelming. Too many features at once.', author: 'Steve Mitchell', date: '2026-07-04', status: 'flagged', helpful: 3 },
  { id: 'rev-006', company: 'Drain Masters LLC', rating: 5, text: 'Switched from ServiceTitan. Half the cost, twice the AI features. My techs love it.', author: 'Jen Morris', date: '2026-07-03', status: 'published', helpful: 31 },
  { id: 'rev-007', company: 'Flow Right Plumbing', rating: 4, text: 'Inventory tracking is a game changer. No more emergency supply runs.', author: 'Amanda Lee', date: '2026-07-02', status: 'published', helpful: 12 },
  { id: 'rev-008', company: 'Quality Pipe Services', rating: 1, text: 'Trial expired before I could fully test. Support was slow to respond.', author: 'Carlos Ruiz', date: '2026-07-01', status: 'flagged', helpful: 2 },
];

const statusStyles: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700',
  flagged: 'bg-amber-50 text-amber-600',
};


  const handleExport = () => {
    const data: Record<string, any>[] = [];
    downloadCSV(data, 'feedback');
  };

export default function AdminFeedbackReviewsPage() {
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    let data = [...reviews];
    if (search) data = data.filter(r => r.company.toLowerCase().includes(search.toLowerCase()) || r.text.toLowerCase().includes(search.toLowerCase()));
    if (ratingFilter !== 'all') data = data.filter(r => r.rating === ratingFilter);
    if (statusFilter !== 'all') data = data.filter(r => r.status === statusFilter);
    return data;
  }, [search, ratingFilter, statusFilter]);

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Feedback & Reviews</h1>
          <p className="text-sm text-slate-500 mt-1">Customer reviews and feedback management</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-white ring-1 ring-white/5 text-sm font-medium text-slate-700 hover:hover:bg-slate-50 transition-all">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[ { label: 'Total Reviews', value: reviews.length, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' }, { label: 'Avg Rating', value: avgRating + ' ★', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' }, { label: 'Published', value: reviews.filter(r => r.status === 'published').length, icon: ThumbsUp, color: 'text-emerald-500', bg: 'bg-emerald-50' }, { label: 'Flagged', value: reviews.filter(r => r.status === 'flagged').length, icon: Filter, color: 'text-red-500', bg: 'bg-red-50' } ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl ring-1 ring-white/5 p-5 shadow-sm ring-1 ring-black/5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-white/5 shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 hover:bg-slate-50 border-0 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="flex gap-2">
            {['all', 'published', 'flagged'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`h-10 px-3 rounded-xl text-xs font-semibold transition-all capitalize ${statusFilter === s ? 'bg-white/10 text-white' : 'hover:bg-slate-50 text-slate-400 hover:bg-white/[0.04]'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {filtered.map(r => (
            <div key={r.id} className="px-5 py-4 hover:hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="text-sm font-semibold text-slate-900">{r.company}</span>
                    <span className="text-xs text-slate-600">— {r.author}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1.5">
                    {Array.from({length: 5}).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-600' : 'text-slate-900'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{r.text}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[r.status]}`}>{r.status}</span>
                  <span className="text-xs text-slate-600">{r.date}</span>
                  <span className="text-xs text-slate-600">{r.helpful} found helpful</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
