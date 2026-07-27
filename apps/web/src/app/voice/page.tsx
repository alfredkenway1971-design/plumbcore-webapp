'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export default function VoiceChatPage() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'assistant'; text: string}[]>([]);
  const [error, setError] = useState('');
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  // Detect in-app browser
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('whatsapp') || ua.includes('fb_iab') || ua.includes('instagram')) {
      setInAppBrowser(true);
    }
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

  // ── Record Audio ──

  const startRecording = useCallback(async () => {
    try {
      setError('');
      chunks.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        await processAudio(blob);
      };

      mediaRecorder.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError('Microphone access denied. Go to Settings > Safari > toggle mic permission.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    setRecording(false);
  }, []);

  // ── Process Audio ──

  const processAudio = async (blob: Blob) => {
    setProcessing(true);

    try {
      // Step 1: Send audio to VPS Whisper for transcription
      const form = new FormData();
      form.append('file', blob, 'recording.webm');

      const whisperRes = await fetch('http://144.91.106.188:8082/inference', {
        method: 'POST',
        headers: { 'x-api-key': 'whisper_key2026' },
        body: form,
        signal: AbortSignal.timeout(30000),
      });

      if (!whisperRes.ok) {
        throw new Error(`Whisper error: ${whisperRes.status}`);
      }

      const whisperData = await whisperRes.json();
      const text = whisperData.text || whisperData.transcription || '';

      if (!text.trim()) {
        throw new Error('No speech detected');
      }

      // Step 2: Send transcribed text to AI for response
      const aiRes = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const aiData = await aiRes.json();

      if (!aiRes.ok || !aiData.success) {
        throw new Error(aiData.error || 'AI failed');
      }

      const reply = aiData.response;

      setMessages(prev => [
        ...prev,
        { role: 'user', text },
        { role: 'assistant', text: reply },
      ]);

      // Step 3: Speak the response using browser TTS
      if (synthRef.current) {
        synthRef.current.cancel();
        const utter = new SpeechSynthesisUtterance(reply);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        utter.lang = 'en-US';
        synthRef.current.speak(utter);
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.');
    }

    setProcessing(false);
  };

  // ── UI ──

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
          <div style={{ fontSize: 12, color: processing ? '#fbbf24' : '#34d399' }}>{processing ? 'thinking...' : 'online'}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: '40%', fontSize: 14 }}>
            Hold the mic button and speak<br />
            <span style={{ fontSize: 12, marginTop: 4, display: 'block' }}>I&apos;ll respond with voice</span>
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

      {/* Mic Button */}
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          onMouseLeave={stopRecording}
          style={{
            width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: recording
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : processing
                ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                : 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: recording
              ? '0 0 40px rgba(239,68,68,0.5)'
              : '0 4px 20px rgba(102,126,234,0.4)',
            transition: 'all 0.2s',
            transform: recording ? 'scale(1.1)' : 'scale(1)',
            pointerEvents: processing ? 'none' : 'auto',
            animation: recording ? 'pulse 1s infinite' : 'none',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', paddingBottom: 16 }}>
        {recording ? 'Release to send' : processing ? 'Processing...' : 'Hold to talk'}
      </div>

      <style>{`@keyframes pulse { 0%,100% { box-shadow: 0 0 20px rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 60px rgba(239,68,68,0.7); } }`}</style>
    </div>
  );
}
