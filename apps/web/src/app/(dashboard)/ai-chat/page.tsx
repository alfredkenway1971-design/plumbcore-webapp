'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Card, Input, TextArea } from '@/pkg/ui-components';

/* ── Message Types ── */
interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  image?: string;
}

/* ── Preset Colors ── */
const PRESET_COLORS = [
  { name: 'Electric Blue', value: '#00bfff' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Cyan', value: '#06b6d4' },
];

/* ── Skeleton Loading for Chat ── */
function ChatSkeleton() {
  return (
    <div className="space-y-3 animate-pulse p-3">
      <div className="flex items-start gap-2">
        <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
      </div>
      <div className="flex items-start gap-2 justify-end">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-blue-tint ml-auto" />
          <div className="h-4 w-1/3 rounded bg-blue-tint ml-auto" />
        </div>
      </div>
    </div>
  );
}

/* ── Typing Indicator ── */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 px-3 py-2">
      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
        AI
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AIChatPage() {
  /* ── Settings State ── */
  const [widgetName, setWidgetName] = useState('PlumbCore AI Assistant');
  const [greeting, setGreeting] = useState("Hi! I'm PlumbCore AI. Describe your plumbing issue and I'll give you a free estimate.");
  const [primaryColor, setPrimaryColor] = useState('#00bfff');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ── Chat State ── */
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'ai',
      text: greeting,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Simulate Initial Load ── */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  /* ── Update greeting on settings change ── */
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m, i) => (i === 0 ? { ...m, text: greeting } : m))
    );
  }, [greeting]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ── Handle Send ── */
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text && !uploadedImage) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      image: uploadedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful plumbing assistant for PlumbCore Plumbing. Provide friendly, accurate information about plumbing issues, estimates, and scheduling. Keep responses concise and helpful.' },
            { role: 'user', content: text },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`API error (${res.status})`);
      }

      const data = await res.json();
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'ai',
        text: data.reply,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'ai',
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
      setUploadedImage(null);
    }
  }, [inputText, uploadedImage]);

  /* ── Handle Key Down ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Handle Photo Upload ── */
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      // Strip data:image/...;base64, prefix
      const base64Data = base64.split(',')[1] || base64;

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        text: 'I took a photo of the issue.',
        image: base64,
      };
      setMessages((prev) => [...prev, userMessage]);
      setUploadedImage(null);
      setIsTyping(true);

      try {
        const res = await fetch('/api/ai/analyze-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data }),
        });

        if (!res.ok) throw new Error(`API error (${res.status})`);

        const data = await res.json();
        const aiMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          role: 'ai',
          text: `Thanks for uploading the photo! I can see the issue clearly now.\n\n**Issue Detected:** ${data.detectedIssue}\n**Severity:** ${data.severity}\n**Estimated Parts:** ${data.estimatedParts}\n**Labor Range:** ${data.estimatedLaborMin}–${data.estimatedLaborMax} min\n\n${data.description}`,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch {
        const aiMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          role: 'ai',
          text: "I received your photo but I'm having trouble analyzing it right now. Please try again or describe the issue in detail.",
        };
        setMessages((prev) => [...prev, aiMessage]);
      } finally {
        setIsTyping(false);
      }
    };
    reader.readAsDataURL(file);
  };

  /* ── Save Settings ── */
  const handleSaveSettings = () => {
    setSavingSettings(true);
    setSettingsSaved(false);
    setTimeout(() => {
      setSavingSettings(false);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    }, 800);
  };

  /* ── Copy Embed Code ── */
  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(
      `<iframe src="https://app.plumbcore.ai/embed/chat" width="400" height="600" frameborder="0" style="border: none; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.15);"></iframe>`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="h-5 w-64 rounded bg-muted mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <div className="h-[520px] rounded-2xl ring-1 ring-black/5 bg-white animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-6 w-24 rounded bg-muted animate-pulse" />
            <div className="h-32 rounded-xl bg-muted animate-pulse" />
            <div className="h-10 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">AI Chat Widget</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preview and configure the AI chat widget that captures leads from your website.
        </p>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── LEFT: Chat Widget Preview (2/3) ── */}
        <div className="lg:col-span-2">
          <Card variant="default" padding="lg" className="flex flex-col items-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Widget Preview</p>
            {/* Phone Frame */}
            <div className="w-full max-w-sm mx-auto rounded-3xl border-2 border-white/10 bg-muted shadow-2xl shadow-black/40 overflow-hidden">
              {/* Phone Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white/80">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-tint flex items-center justify-center text-[10px] font-bold" style={{ color: primaryColor }}>
                    P
                  </div>
                  <span className="text-xs font-semibold text-foreground">{widgetName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted-foreground">Online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-3 space-y-3 bg-muted">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    {msg.role === 'ai' ? (
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0" style={{ color: primaryColor }}>
                        AI
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-foreground" style={{ backgroundColor: primaryColor }}>
                        U
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === 'ai'
                          ? 'bg-muted text-foreground rounded-tl-sm'
                          : 'text-foreground rounded-tr-sm'
                      }`}
                      style={msg.role === 'user' ? { backgroundColor: primaryColor } : {}}
                    >
                      {msg.text}
                      {msg.image && (
                        <img src={msg.image} alt="Uploaded" className="mt-2 rounded-xl max-w-full h-28 object-cover" />
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && <TypingIndicator />}

                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-3 bg-white/50">
                <div className="flex items-center gap-2">
                  {/* Photo Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 rounded-xl p-2 text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21z" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />

                  {/* Text Input */}
                  <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your plumbing issue..."
                    className="flex-1 rounded-xl border border-white/10 bg-muted px-3 py-2 text-sm text-foreground placeholder-steel/50 outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
                  />

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() && !uploadedImage}
                    className="shrink-0 rounded-xl p-2 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── RIGHT: Settings (1/3) ── */}
        <div className="space-y-4">
          <Card variant="default" padding="md">
            <h3 className="text-sm font-semibold text-foreground mb-4">Widget Settings</h3>
            <div className="space-y-4">
              {/* Widget Name */}
              <Input
                label="Widget Name"
                placeholder="PlumbCore AI Assistant"
                value={widgetName}
                onChange={(e) => setWidgetName(e.target.value)}
              />

              {/* Greeting Message */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground/80 mb-1.5">Greeting Message</label>
                <textarea
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-muted px-4 py-2.5 text-sm text-foreground placeholder-steel/50 outline-none transition-all focus:border-electric/50 focus:ring-1 focus:ring-electric/20 resize-none"
                />
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground/80 mb-1.5">Primary Color</label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-8 w-8 rounded-xl ring-1 ring-black/5 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-muted-foreground/80">{primaryColor}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setPrimaryColor(color.value)}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${
                        primaryColor === color.value ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <Button
                variant="primary"
                size="md"
                fullWidth
                loading={savingSettings}
                onClick={handleSaveSettings}
              >
                {settingsSaved ? 'Saved!' : 'Save Settings'}
              </Button>
              {settingsSaved && (
                <p className="text-xs text-green-600 text-center">Settings saved successfully!</p>
              )}
            </div>
          </Card>

          {/* Embed Code */}
          <Card variant="default" padding="md">
            <h3 className="text-sm font-semibold text-foreground mb-3">Embed Code</h3>
            <div className="rounded-xl bg-muted ring-1 ring-black/5 p-3 text-[11px] font-mono text-muted-foreground/80 break-all leading-relaxed">
              {`<iframe src="https://app.plumbcore.ai/embed/chat" width="400" height="600" frameborder="0" style="border: none; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.15);"></iframe>`}
            </div>
            <div className="mt-3">
              <Button variant="secondary" size="sm" fullWidth onClick={handleCopyEmbed}>
                {copied ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    Copy Embed Code
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
