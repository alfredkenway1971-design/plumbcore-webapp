'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageCircle,
  X,
  Send,
  Camera,
  ChevronDown,
} from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

const quickReplies = [
  { label: 'Leak', query: 'I have a water leak' },
  { label: 'Clog', query: 'My drain is clogged' },
  { label: 'No hot water', query: 'I have no hot water' },
  { label: 'Pricing', query: 'How much does it cost?' },
];

const aiWelcome = {
  id: 'welcome',
  role: 'ai' as const,
  text: "Hi! 👋 I'm your PlumbCore AI assistant. I can help you get a free estimate, check on an existing quote, or answer questions. What's the issue?",
  timestamp: new Date(),
};

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 max-w-[85%]">
      <Avatar className="w-7 h-7 mt-0.5">
        <AvatarFallback className="bg-gradient-to-br from-primary to-blue-bright text-white text-[10px] font-bold">AI</AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([aiWelcome]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (in production, call /api/ai/chat)
    setTimeout(() => {
      const responses: Record<string, string> = {
        leak: "Got it! A water leak can range from a simple pipe joint repair ($85–$150) to a more involved fix depending on location.\n\n**To get an exact price, could you:** \n1️⃣ Upload a photo of the leak\n2️⃣ Tell me where it is (under sink, ceiling, wall)\n3️⃣ Is it actively dripping or just stained?",
        clog: "Clogs are one of our most common fixes! 🔧\n\n**Typical pricing:**\n• Sink clog: $95–$145\n• Toilet clog: $85–$135\n• Main drain clog: $195–$395\n\nWant to upload a photo for an AI estimate? I can tell you exactly what's needed.",
        hot: "No hot water is usually a water heater issue. 🚿\n\n**Common causes:**\n• Pilot light out (gas) — $85–$125\n• Heating element failed (electric) — $145–$225\n• Thermostat issue — $95–$175\n\nWe can have a plumber out today if it's urgent!",
        pricing: "Great question! Here's our pricing model:\n\n**Plans start at $79/mo** for up to 3 techs.\n\nEach plan includes:\n✅ AI photo estimates\n✅ Smart scheduling\n✅ Automated invoicing\n✅ Client portal\n\nWant to see a full breakdown? Check our [pricing page](/#pricing)!",
      };

      let reply = '';
      const lower = text.toLowerCase();
      if (lower.includes('leak') || lower.includes('drip') || lower.includes('water')) {
        reply = responses.leak;
      } else if (lower.includes('clog') || lower.includes('drain') || lower.includes('toilet')) {
        reply = responses.clog;
      } else if (lower.includes('hot water') || lower.includes('heater')) {
        reply = responses.hot;
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('pricing') || lower.includes('plan')) {
        reply = responses.pricing;
      } else {
        reply = "Thanks for reaching out! To give you the best answer, could you tell me a bit more?\n\n**I can help with:**\n• Free AI estimates for plumbing issues\n• Pricing & plans\n• Checking existing quote status\n• Scheduling an appointment\n\nJust describe what you need!";
      }

      setIsTyping(false);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1500 + Math.random() * 1000);
  };

  const handleQuickReply = (query: string) => {
    sendMessage(query);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary hover:bg-primary text-white shadow-lg hover:shadow-xl active:scale-90 transition-all flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat widget */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 border-2 border-white/30">
                <AvatarFallback className="bg-white/20 text-white text-xs font-bold">AI</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-white">PlumbCore AI</p>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online — replies instantly
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-90"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  {msg.role === 'ai' && (
                    <Avatar className="w-7 h-7 mt-0.5 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-blue-bright text-white text-[10px] font-bold">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-white text-foreground border border-border/50 shadow-sm rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                    <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-primary/30' : 'text-muted-foreground/80'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0 border-t border-border/50">
              {quickReplies.map((qr) => (
                <button
                  key={qr.label}
                  onClick={() => handleQuickReply(qr.query)}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-muted hover:bg-muted text-xs font-medium text-muted-foreground active:scale-95 transition-all border border-border"
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border/50 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-muted hover:bg-muted flex items-center justify-center text-muted-foreground active:scale-90 transition-all shrink-0"
                aria-label="Attach photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-full border-border bg-muted h-10 text-sm px-4 focus:border-primary/50"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 rounded-full bg-primary hover:bg-primary disabled:bg-muted disabled:cursor-not-allowed flex items-center justify-center text-white active:scale-90 transition-all shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
