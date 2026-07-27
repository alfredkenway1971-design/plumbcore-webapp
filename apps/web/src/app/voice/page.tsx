'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export default function VoiceChatPage() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'assistant'; text: string}[]>([]);
  const [error, setError] = useState('');
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [pendingReply, setPendingReply] = useState('');
  const [showPlayButton, setShowPlayButton] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Detect in-app browser
  useEffect(() => {
    if (typeof window === 'undefined') return;
    synthRef.current = window.speechSynthesis;
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('whatsapp') || ua.includes('fb_iab') || ua.includes('instagram')) {
      setInAppBrowser(true);
    }
  }, []);

  // Show play button instead of auto-speaking (bypasses autoplay blocks)
  const speak = useCallback((text: string) => {
    setPendingReply(text);
    setShowPlayButton(true);
  }, []);

  // User taps "Hear response" — triggered by direct user gesture, TTS works
  const playReply = useCallback(() => {
    if (!pendingReply || !synthRef.current) return;
    setShowPlayButton(false);
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(pendingReply);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.lang = 'en-US';
    synthRef.current.speak(utter);
  }, [pendingReply]);

  const getAIResponse = useCallback(async (transcript: string) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'AI failed');

      const reply = data.response;
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      speak(reply);
    } catch (err: any) {
      setError(err.message);
    }
    setProcessing(false);
  }, [speak]);

  const startListening = useCallback(() => {
    setError('');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not available on this browser. Try Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setMessages(prev => [...prev, { role: 'user', text }]);
      getAIResponse(text);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted') {
        setError('Microphone busy. Tap the mic button and wait 1 second before speaking.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone blocked. Go to Settings > Safari > toggle mic on.');
      } else {
        setError(`Error: ${event.error}. Tap mic again.`);
      }
      setRecording(false);
    };

    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    setTimeout(() => {
      try { recognition.start(); setRecording(true); } catch {
        setError('Could not start. Tap mic again.');
      }
    }, 300);
  }, [getAIResponse]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setRecording(false);
  }, []);

  // In-app browser overlay
  if (inAppBrowser) {
    return (
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100dvh', maxWidth: 400, margin: '0 auto', background: '#1a1a2e', color: '#fff',
        padding: 32, textAlign: 'center', gap: 24,
      }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>A</div>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Open in Safari</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
          Voice chat doesn&apos;t work inside WhatsApp. Tap the <strong>•••</strong> button below and select Open in Safari.
        </p>
        <a href="https://plumbcore-ai.vercel.app/voice" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>Open in Browser</a>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 480,
      margin: '0 auto', background: '#1a1a2e', color: '#fff',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>A</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Alfred</div>
          <div style={{ fontSize: 12, color: recording ? '#ef4444' : processing ? '#fbbf24' : '#34d399' }}>
            {recording ? 'listening...' : processing ? 'thinking...' : 'online'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: '40%', fontSize: 14 }}>
            Tap the mic button and speak<br />
            <span style={{ fontSize: 12, marginTop: 4, display: 'block', color: 'rgba(255,255,255,0.2)' }}>
              Powered by Z.AI (GLM 5.2)
            </span>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%', padding: '10px 14px',
            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: msg.role === 'user' ? '#667eea' : 'rgba(255,255,255,0.1)',
            fontSize: 14, lineHeight: 1.5,
          }}>
            {msg.text}
          </div>
        ))}
        {error && <div style={{ textAlign: 'center', color: '#f87171', fontSize: 13, padding: 8 }}>{error}</div>}
        {showPlayButton && pendingReply && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
            <button
              onClick={playReply}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none', borderRadius: 20, padding: '10px 24px',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Hear response
            </button>
          </div>
        )}
      </div>

      {/* Mic Button */}
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <button
          onTouchStart={(e) => { e.preventDefault(); startListening(); }}
          onTouchEnd={(e) => { e.preventDefault(); stopListening(); }}
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onMouseLeave={stopListening}
          style={{
            width: 80, height: 80, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: recording
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : processing
                ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                : 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: recording
              ? '0 0 50px rgba(239,68,68,0.6)'
              : '0 4px 24px rgba(102,126,234,0.4)',
            transition: 'all 0.2s',
            transform: recording ? 'scale(1.15)' : 'scale(1)',
            pointerEvents: processing ? 'none' : 'auto',
            animation: recording ? 'pulse 1s infinite' : 'none',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', paddingBottom: 16 }}>
        {recording ? 'Listening — speak now' : processing ? 'Getting response...' : 'Tap mic to talk'}
      </div>

      <style>{`@keyframes pulse { 0%,100% { box-shadow: 0 0 20px rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 70px rgba(239,68,68,0.8); } }`}</style>
    </div>
  );
}
