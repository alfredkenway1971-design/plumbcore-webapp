'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export default function VoiceChatPage() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'assistant'; text: string}[]>([]);
  const [error, setError] = useState('');
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [pendingAudio, setPendingAudio] = useState('');
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    synthRef.current = window.speechSynthesis;
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('whatsapp') || ua.includes('fb_iab') || ua.includes('instagram')) {
      setInAppBrowser(true);
    }
  }, []);

  // Play OmniVoice audio (natural voice) or fallback to best browser voice
  const playReply = useCallback(() => {
    setShowPlayButton(false);

    // Try OmniVoice audio first
    if (pendingAudio && audioRef.current) {
      try {
        const binary = atob(pendingAudio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        audioRef.current.src = url;
        audioRef.current.play();
        return;
      } catch {}
    }

    // Fallback: best browser voice (e.g. Samantha/Alex on iOS)
    if (synthRef.current) {
      synthRef.current.cancel();
      // Get the best available English voice
      const voices = synthRef.current.getVoices();
      const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Alex') || v.name.includes('Premium'));
      const utter = new SpeechSynthesisUtterance(pendingReply || '');
      if (preferred) utter.voice = preferred;
      utter.rate = 1.0;
      utter.pitch = 1.0;
      utter.lang = 'en-US';
      synthRef.current.speak(utter);
    }
  }, [pendingAudio, pendingReply]);

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
      setPendingAudio(data.audio || '');
      setShowPlayButton(true);
    } catch (err: any) {
      setError(err.message);
    }
    setProcessing(false);
  }, []);

  const startListening = useCallback(() => {
    setError('');
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError('Speech recognition not supported'); return; }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setMessages(prev => [...prev, { role: 'user', text }]);
      getAIResponse(text);
    };
    recognition.onerror = (e: any) => {
      setError(e.error === 'aborted' ? 'Tap mic and wait 1 sec before speaking' : `Error: ${e.error}`);
      setRecording(false);
    };
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    setTimeout(() => {
      try { recognition.start(); setRecording(true); } catch { setError('Could not start'); }
    }, 300);
  }, [getAIResponse]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    setRecording(false);
  }, []);

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
          Voice chat doesn&apos;t work inside WhatsApp. Tap <strong>•••</strong> {'>'} Open in Safari.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 480,
      margin: '0 auto', background: '#1a1a2e', color: '#fff',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>A</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Alfred</div>
          <div style={{ fontSize: 12, color: recording ? '#ef4444' : processing ? '#fbbf24' : '#34d399' }}>
            {recording ? 'listening...' : processing ? 'thinking...' : 'online'}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: '40%', fontSize: 14 }}>
            Tap the mic button and speak<br />
            <span style={{ fontSize: 12, marginTop: 4, display: 'block', color: 'rgba(255,255,255,0.2)' }}>
              Powered by Z.AI (GLM 5.2) + OmniVoice natural TTS
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
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />

      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        {showPlayButton ? (
          <button onClick={playReply} style={{
            width: 80, height: 80, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(16,185,129,0.4)',
            animation: 'pulse-green 1.5s infinite',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          </button>
        ) : (
          <button
            onTouchStart={(e) => { e.preventDefault(); startListening(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopListening(); }}
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onMouseLeave={stopListening}
            style={{
              width: 80, height: 80, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: recording ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : processing ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: recording ? '0 0 50px rgba(239,68,68,0.6)' : '0 4px 24px rgba(102,126,234,0.4)',
              transform: recording ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.2s',
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
        )}
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', paddingBottom: 16 }}>
        {showPlayButton ? 'Tap to hear natural voice response' : recording ? 'Listening — speak now' : processing ? 'Getting response...' : 'Tap mic to talk'}
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { box-shadow: 0 0 20px rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 70px rgba(239,68,68,0.8); } }
        @keyframes pulse-green { 0%,100% { box-shadow: 0 0 20px rgba(16,185,129,0.3); } 50% { box-shadow: 0 0 70px rgba(16,185,129,0.7); } }
      `}</style>
    </div>
  );
}
