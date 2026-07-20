'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Input,
  TextArea,
  Modal,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';

/* ── Types ── */
interface Message {
  id: string;
  content: string;
  timestamp: string;
  sent: boolean; // true = sent by us, false = received
}

interface Conversation {
  id: string;
  contactName: string;
  phoneNumber: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

/* ── Mock Conversations (10+) ── */
const mockConversations: Conversation[] = [
  {
    id: 'CONV-001', contactName: 'James & Sarah Johnson', phoneNumber: '(555) 101-2001',
    lastMessage: 'Great, thank you for the update!', lastTime: '2 min ago', unread: 1,
    messages: [
      { id: 'MSG-001', content: 'Hi James, your water heater installation is scheduled for tomorrow at 9 AM.', timestamp: '10:30 AM', sent: true },
      { id: 'MSG-002', content: 'Perfect, I will be home all morning.', timestamp: '10:32 AM', sent: false },
      { id: 'MSG-003', content: 'Great, thank you for the update!', timestamp: '10:33 AM', sent: false },
    ],
  },
  {
    id: 'CONV-002', contactName: 'Maria Wilson', phoneNumber: '(555) 101-2003',
    lastMessage: 'Can you come earlier?', lastTime: '15 min ago', unread: 2,
    messages: [
      { id: 'MSG-004', content: 'Your appointment is confirmed for Monday at 2 PM.', timestamp: '2:00 PM', sent: true },
      { id: 'MSG-005', content: 'Can you come earlier?', timestamp: '2:15 PM', sent: false },
      { id: 'MSG-006', content: 'I will check with the dispatcher and let you know.', timestamp: '2:16 PM', sent: true },
    ],
  },
  {
    id: 'CONV-003', contactName: 'Robert Davis', phoneNumber: '(555) 101-2002',
    lastMessage: 'Thanks for the estimate', lastTime: '1 hour ago', unread: 0,
    messages: [
      { id: 'MSG-007', content: 'Here is the estimate for the repipe: $6,500 including materials and labor.', timestamp: '11:00 AM', sent: true },
      { id: 'MSG-008', content: 'Thanks for the estimate', timestamp: '11:30 AM', sent: false },
    ],
  },
  {
    id: 'CONV-004', contactName: 'Michael Brown', phoneNumber: '(555) 101-2006',
    lastMessage: 'The team is on their way.', lastTime: '2 hours ago', unread: 3,
    messages: [
      { id: 'MSG-009', content: 'Your technician is on the way! ETA: 30 minutes.', timestamp: '9:00 AM', sent: true },
      { id: 'MSG-010', content: 'Is Mike still coming?', timestamp: '9:15 AM', sent: false },
      { id: 'MSG-011', content: 'The team is on their way.', timestamp: '9:20 AM', sent: false },
    ],
  },
  {
    id: 'CONV-005', contactName: 'Oak Springs Apartments', phoneNumber: '(555) 101-2011',
    lastMessage: 'Please send the invoice to accounting@oaksprings.com', lastTime: '3 hours ago', unread: 0,
    messages: [
      { id: 'MSG-012', content: 'Building B main shutoff valve replacement is complete.', timestamp: '4:00 PM', sent: true },
      { id: 'MSG-013', content: 'Please send the invoice to accounting@oaksprings.com', timestamp: '4:30 PM', sent: false },
    ],
  },
  {
    id: 'CONV-006', contactName: 'Emily Thompson', phoneNumber: '(555) 101-2005',
    lastMessage: 'The new faucet looks great!', lastTime: 'Yesterday', unread: 0,
    messages: [
      { id: 'MSG-014', content: 'Your appointment is confirmed for tomorrow at 10 AM.', timestamp: 'Yesterday', sent: true },
      { id: 'MSG-015', content: 'The new faucet looks great!', timestamp: 'Yesterday', sent: false },
    ],
  },
  {
    id: 'CONV-007', contactName: 'Sunset Retirement Home', phoneNumber: '(555) 101-2015',
    lastMessage: 'Emergency - pipe burst in Building A!', lastTime: 'Yesterday', unread: 1,
    messages: [
      { id: 'MSG-016', content: 'Reminder: You have a quarterly backflow test tomorrow at 8 AM.', timestamp: 'Yesterday', sent: true },
      { id: 'MSG-017', content: 'Emergency - pipe burst in Building A!', timestamp: 'Yesterday', sent: false },
    ],
  },
  {
    id: 'CONV-008', contactName: 'Carlos Garcia', phoneNumber: '(555) 101-2004',
    lastMessage: 'Sewer is backing up! Need help ASAP!', lastTime: 'Yesterday', unread: 2,
    messages: [
      { id: 'MSG-018', content: 'Your sewer line service is scheduled for tomorrow.', timestamp: '2 days ago', sent: true },
      { id: 'MSG-019', content: 'Sewer is backing up! Need help ASAP!', timestamp: 'Yesterday', sent: false },
    ],
  },
  {
    id: 'CONV-009', contactName: 'Lone Star Brewery', phoneNumber: '(555) 101-2021',
    lastMessage: 'Floor drain maintenance confirmed for Friday.', lastTime: '2 days ago', unread: 0,
    messages: [
      { id: 'MSG-020', content: 'Your invoice #PO-2024-003 is ready. View here: https://plumbcore.ai/invoices/po-003', timestamp: '2 days ago', sent: true },
      { id: 'MSG-021', content: 'Floor drain maintenance confirmed for Friday.', timestamp: '2 days ago', sent: false },
    ],
  },
  {
    id: 'CONV-010', contactName: 'Patricia Martinez', phoneNumber: '(555) 101-2007',
    lastMessage: 'Toilet is working perfectly now, thank you!', lastTime: '3 days ago', unread: 0,
    messages: [
      { id: 'MSG-022', content: 'Your appointment is confirmed for [date] at [time].', timestamp: '3 days ago', sent: true },
      { id: 'MSG-023', content: 'Toilet is working perfectly now, thank you!', timestamp: '3 days ago', sent: false },
    ],
  },
  {
    id: 'CONV-011', contactName: 'TechHub Office Park', phoneNumber: '(555) 101-2019',
    lastMessage: 'Cooling tower repair scheduled for next week.', lastTime: '3 days ago', unread: 0,
    messages: [
      { id: 'MSG-024', content: 'Reminder: You have a service appointment tomorrow at 10 AM.', timestamp: '3 days ago', sent: true },
      { id: 'MSG-025', content: 'Cooling tower repair scheduled for next week.', timestamp: '3 days ago', sent: false },
    ],
  },
  {
    id: 'CONV-012', contactName: 'Nancy Lee', phoneNumber: '(555) 101-2018',
    lastMessage: 'Garbage disposal is working now. Thank you!', lastTime: '5 days ago', unread: 0,
    messages: [
      { id: 'MSG-026', content: 'Your technician is on the way! ETA: 20 minutes.', timestamp: '5 days ago', sent: true },
      { id: 'MSG-027', content: 'Garbage disposal is working now. Thank you!', timestamp: '5 days ago', sent: false },
    ],
  },
];

/* ── SMS Templates ── */
const smsTemplates = [
  { label: 'Appointment Confirmation', template: 'Your appointment is confirmed for [date] at [time].' },
  { label: 'Technician ETA', template: 'Your technician is on the way! ETA: [time].' },
  { label: 'Service Reminder', template: 'Reminder: You have a service appointment tomorrow at [time].' },
  { label: 'Invoice Ready', template: 'Your invoice #[number] is ready. View here: [link].' },
  { label: 'Payment Confirmation', template: 'Thank you for your payment of $[amount]. Receipt #[number] is attached.' },
  { label: 'Job Completed', template: 'Your [service] has been completed. Please let us know if you need anything else!' },
];

/* ── Skeleton ── */
function SkeletonPage() {
  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="h-8 w-32 rounded bg-muted animate-pulse" />
      <div className="h-5 w-56 rounded bg-muted animate-pulse" />
      <div className="flex gap-4 h-[calc(100vh-220px)]">
        <div className="w-1/2 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="w-1/2 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function SMSPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [newMessageModalOpen, setNewMessageModalOpen] = useState(false);
  const [newMessageNumber, setNewMessageNumber] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);

  const handleRetry = () => {
    setError(null);
    setLoading(false);
  };

  // Filter conversations
  const filteredConvs = conversations.filter((c: any) =>
    c.contactName.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneNumber.includes(search)
  );

  const selectedConversation = conversations.find(c => c.id === selectedConv);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: `MSG-${Date.now()}`,
      content: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConv
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: newMsg.content,
              lastTime: 'Just now',
              unread: 0,
            }
          : c
      )
    );
    setMessageInput('');
  };

  const handleTemplateSelect = (template: string) => {
    setMessageInput(template);
    setTemplateModalOpen(false);
  };

  const handleNewConversation = () => {
    if (!newMessageNumber.trim()) return;

    const newConv: Conversation = {
      id: `CONV-${Date.now()}`,
      contactName: newMessageNumber,
      phoneNumber: newMessageNumber,
      lastMessage: 'New conversation',
      lastTime: 'Just now',
      unread: 0,
      messages: [],
    };

    setConversations(prev => [newConv, ...prev]);
    setSelectedConv(newConv.id);
    setNewMessageNumber('');
    setNewMessageModalOpen(false);
  };

  /* ── Error state ── */
  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Failed to load SMS" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  /* ── Loading state ── */
  if (loading) {
    return <SkeletonPage />;
  }

  return (
    <div className="p-4 sm:p-6 h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">SMS Messaging</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Send and receive SMS messages</p>
        </div>
        <Button size="sm" onClick={() => setNewMessageModalOpen(true)} className="h-7 px-2.5 text-xs gap-1">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Message
        </Button>
      </div>

      {/* Split View */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Left Panel - Conversation List */}
        <div className="w-full lg:w-1/2 flex flex-col rounded-xl ring-1 ring-black/5 bg-white overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredConvs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <EmptyState
                  title="No conversations"
                  description="Start a new conversation by clicking 'New Message'."
                />
              </div>
            ) : (
              filteredConvs.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv.id)}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted ${
                    selectedConv === conv.id ? 'bg-blue-tint border-l-2 border-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {conv.contactName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{conv.phoneNumber}</p>
                      <p className="text-xs text-muted-foreground/80 mt-1 truncate">{conv.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                      <span className="text-[10px] text-muted-foreground/80 whitespace-nowrap">{conv.lastTime}</span>
                      {conv.unread > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Conversation Detail */}
        <div className="w-full lg:w-1/2 flex flex-col rounded-xl ring-1 ring-black/5 bg-white overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="px-4 py-3 border-b border-border bg-muted/50 shrink-0">
                <p className="text-sm font-semibold text-foreground">{selectedConversation.contactName}</p>
                <p className="text-xs text-muted-foreground">{selectedConversation.phoneNumber}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedConversation.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground/80">No messages yet. Send a message to start the conversation.</p>
                  </div>
                ) : (
                  selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.sent
                            ? 'bg-primary text-white rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.sent ? 'text-primary/30' : 'text-muted-foreground/80'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="shrink-0 border-t border-border p-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <TextArea
                      placeholder="Type a message..."
                      rows={2}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    {/* Emoji picker placeholder */}
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground/80 hover:text-muted-foreground hover:bg-muted transition-colors"
                      title="Emoji picker (coming soon)"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setTemplateModalOpen(true)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground/80 hover:text-muted-foreground hover:bg-muted transition-colors"
                      title="Send template"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                      </svg>
                    </button>
                    <Button
                      size="sm"
                      className="h-9"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState
                title="Select a conversation"
                description="Choose a conversation from the left panel to view messages, or start a new one."
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Template Picker Modal ── */}
      <Modal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title="SMS Templates"
        description="Choose a pre-written template for common plumbing communications."
        size="md"
      >
        <div className="space-y-2">
          {smsTemplates.map((t, i) => (
            <button
              key={i}
              onClick={() => handleTemplateSelect(t.template)}
              className="w-full text-left rounded-xl ring-1 ring-black/5 p-3 hover:border-primary/30 hover:bg-blue-tint transition-colors"
            >
              <p className="text-sm font-medium text-foreground">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.template}</p>
            </button>
          ))}
        </div>
      </Modal>

      {/* ── New Message Modal ── */}
      <Modal
        open={newMessageModalOpen}
        onClose={() => setNewMessageModalOpen(false)}
        title="New Message"
        description="Enter a phone number to start a new conversation."
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setNewMessageModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleNewConversation}
              disabled={!newMessageNumber.trim()}
            >
              Start Conversation
            </Button>
          </>
        }
      >
        <Input
          placeholder="+1 (555) 000-0000"
          value={newMessageNumber}
          onChange={(e) => setNewMessageNumber(e.target.value)}
        />
      </Modal>
    </div>
  );
}
