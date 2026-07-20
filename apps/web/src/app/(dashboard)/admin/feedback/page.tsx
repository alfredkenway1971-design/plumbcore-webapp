'use client';

import { useState, useMemo } from 'react';
import { Search, Star, MessageSquare, ThumbsUp, Filter, Download } from 'lucide-react';
import { downloadCSV } from '@/lib/csv-export';

const reviews: any[] = [];

const statusStyles: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700',
  flagged: 'bg-amber-50 text-amber-600',
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

  const handleExport = () => {
    downloadCSV([], "export");
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Feedback & Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Customer reviews and feedback management</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-white ring-1 ring-border text-sm font-medium text-foreground hover:bg-muted transition-all">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Reviews', value: 0, icon: MessageSquare, color: 'text-primary', bg: 'bg-blue-tint' },
          { label: 'Avg Rating', value: '—', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Published', value: 0, icon: ThumbsUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Flagged', value: 0, icon: Filter, color: 'text-red-500', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl ring-1 ring-border p-5 shadow-sm ring-1 ring-black/5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-border shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 border-b border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input readOnly placeholder="Search reviews..." className="w-full h-10 pl-10 pr-4 hover:bg-muted border-0 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex gap-2">
            {['all', 'published', 'flagged'].map((s: any) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`h-10 px-3 rounded-xl text-xs font-semibold transition-all capitalize ${statusFilter === s ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="px-5 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Star className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No reviews yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            When plumbers submit feedback and reviews about the platform, they'll appear here for moderation and management.
          </p>
        </div>
      </div>
    </div>
  );
}
