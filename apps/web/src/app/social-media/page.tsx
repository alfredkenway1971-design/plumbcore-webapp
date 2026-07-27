'use client';

import { useState, useEffect } from 'react';

export default function SocialMediaDashboard() {
  const [pages, setPages] = useState<any[]>([]);
  const [topic, setTopic] = useState('');
  const [customText, setCustomText] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['facebook']);
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/social-media/publish')
      .then(r => r.json())
      .then(d => {
        setPages(d.pages || []);
        if (d.pages?.length) setSelectedPage(d.pages[0].id);
      })
      .catch(() => setError('Failed to load pages'));
  }, []);

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const publish = async () => {
    if (!topic && !customText) { setError('Enter a topic or custom text'); return; }
    setPublishing(true);
    setError('');
    setResults(null);

    try {
      const res = await fetch('/api/social-media/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || undefined,
          customText: customText || undefined,
          platforms,
          pageId: selectedPage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    }
    setPublishing(false);
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: 700, margin: '0 auto', padding: 24, background: '#0f172a',
      color: '#fff', minHeight: '100vh',
    }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>📱 Social Media Content Factory</h1>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>AI-powered content creation & publishing</p>

      {/* Pages Status */}
      <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>YOUR PAGES</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pages.map(p => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
              cursor: 'pointer', padding: '8px 12px', borderRadius: 8,
              background: selectedPage === p.id ? '#334155' : 'transparent',
            }} onClick={() => setSelectedPage(p.id)}>
              <span style={{ fontSize: 16 }}>{p.hasInstagram ? '📘📸' : '📘'}</span>
              <span style={{ flex: 1 }}>{p.name}</span>
              {p.hasInstagram
                ? <span style={{ color: '#34d399', fontSize: 11 }}>✅ FB + IG</span>
                : <span style={{ color: '#f87171', fontSize: 11 }}>FB only</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Content Input */}
      <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>CREATE POST</h2>
        <input
          placeholder="Topic (AI generates the post)"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #334155',
            background: '#0f172a', color: '#fff', fontSize: 13, outline: 'none',
            marginBottom: 8, boxSizing: 'border-box' }}
        />
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginBottom: 8 }}>— OR —</div>
        <textarea
          placeholder="Write your own post text"
          value={customText}
          onChange={e => setCustomText(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #334155',
            background: '#0f172a', color: '#fff', fontSize: 13, outline: 'none',
            boxSizing: 'border-box', resize: 'vertical' }}
        />
      </div>

      {/* Platform Selector */}
      <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>PUBLISH TO</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['facebook', 'instagram', 'linkedin', 'threads'].map(p => (
            <button key={p} onClick={() => togglePlatform(p)} style={{
              padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: platforms.includes(p) ? '#3b82f6' : '#334155',
              color: platforms.includes(p) ? '#fff' : '#94a3b8',
              opacity: p === 'instagram' && !pages.find(pg => pg.id === selectedPage)?.hasInstagram ? 0.4 : 1,
            }}>
              {p === 'facebook' ? '📘 Facebook' :
               p === 'instagram' ? '📸 Instagram' :
               p === 'linkedin' ? '💼 LinkedIn' : '🧵 Threads'}
            </button>
          ))}
        </div>
      </div>

      {/* Publish Button */}
      <button onClick={publish} disabled={publishing} style={{
        width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: publishing ? 'wait' : 'pointer',
        fontSize: 15, fontWeight: 700, marginBottom: 16,
        background: publishing ? '#475569' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        color: '#fff',
      }}>
        {publishing ? '🚀 Publishing...' : '🚀 Publish Now'}
      </button>

      {error && <div style={{ color: '#f87171', fontSize: 13, padding: 12, background: '#1e293b', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {/* Results */}
      {results && (
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>RESULTS</h2>
          <div style={{ fontSize: 13, marginBottom: 12, color: '#cbd5e1' }}>
            <strong>Posted:</strong> {results.content.text.substring(0, 100)}...
          </div>
          {results.results?.map((r: any, i: number) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              borderRadius: 8, marginBottom: 4,
              background: r.success ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
              color: r.success ? '#34d399' : '#f87171', fontSize: 13,
            }}>
              <span>{r.success ? '✅' : '❌'}</span>
              <span style={{ textTransform: 'capitalize' }}>{r.platform}</span>
              <span style={{ flex: 1 }}>{r.success ? `ID: ${r.postId}` : r.error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
