'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Input,
  StatusBadge,
  TextArea,
  EmptyState,
  ErrorState,
} from '@/pkg/ui-components';

/* ── Types ── */
type CallStatus = 'ringing' | 'in-progress' | 'completed' | 'ended' | 'missed' | 'no-answer';
type CallDirection = 'incoming' | 'outgoing';

interface CallLogEntry {
  id: string;
  dateTime: string;
  caller: string;
  phoneNumber: string;
  duration: string;
  direction: CallDirection;
  status: CallStatus;
  notes: string;
}

/* ── Mock Data ── */
const mockCallLog: CallLogEntry[] = [
  { id: 'CL-001', dateTime: '2024-07-15 08:23', caller: 'James & Sarah Johnson', phoneNumber: '(555) 101-2001', duration: '12:34', direction: 'incoming', status: 'completed', notes: 'Water heater leaking, scheduled service' },
  { id: 'CL-002', dateTime: '2024-07-15 09:05', caller: 'Robert Davis', phoneNumber: '(555) 101-2002', duration: '05:12', direction: 'incoming', status: 'completed', notes: 'Asked about pricing for repipe' },
  { id: 'CL-003', dateTime: '2024-07-15 09:45', caller: 'Maria Wilson', phoneNumber: '(555) 101-2003', duration: '00:00', direction: 'incoming', status: 'missed', notes: '' },
  { id: 'CL-004', dateTime: '2024-07-15 10:15', caller: 'Dispatcher', phoneNumber: '(555) 200-1000', duration: '02:18', direction: 'outgoing', status: 'completed', notes: 'Confirmed TECH-001 availability' },
  { id: 'CL-005', dateTime: '2024-07-14 14:30', caller: 'Michael Brown', phoneNumber: '(555) 101-2006', duration: '08:45', direction: 'incoming', status: 'completed', notes: 'Update on whole house repipe progress' },
  { id: 'CL-006', dateTime: '2024-07-14 11:20', caller: 'Oak Springs Apartments', phoneNumber: '(555) 101-2011', duration: '00:00', direction: 'incoming', status: 'no-answer', notes: '' },
  { id: 'CL-007', dateTime: '2024-07-14 09:00', caller: 'Sunset Retirement Home', phoneNumber: '(555) 101-2015', duration: '15:22', direction: 'incoming', status: 'completed', notes: 'Pipe burst emergency, dispatched team' },
  { id: 'CL-008', dateTime: '2024-07-13 16:45', caller: 'TECH-002 - Mike Torres', phoneNumber: '(555) 200-1002', duration: '03:30', direction: 'outgoing', status: 'completed', notes: 'Checked on JOB-015 progress' },
  { id: 'CL-009', dateTime: '2024-07-13 13:10', caller: 'Lone Star Brewery', phoneNumber: '(555) 101-2021', duration: '06:55', direction: 'incoming', status: 'completed', notes: 'Rescheduled floor drain maintenance' },
  { id: 'CL-010', dateTime: '2024-07-13 10:30', caller: 'Patricia Martinez', phoneNumber: '(555) 101-2007', duration: '00:00', direction: 'incoming', status: 'missed', notes: '' },
  { id: 'CL-011', dateTime: '2024-07-12 15:00', caller: 'TechHub Office Park', phoneNumber: '(555) 101-2019', duration: '04:18', direction: 'outgoing', status: 'completed', notes: 'Follow-up on cooling tower repair' },
  { id: 'CL-012', dateTime: '2024-07-12 11:35', caller: 'Nancy Lee', phoneNumber: '(555) 101-2018', duration: '02:05', direction: 'incoming', status: 'completed', notes: 'Garbage disposal working fine now' },
  { id: 'CL-013', dateTime: '2024-07-12 08:20', caller: 'Carlos Garcia', phoneNumber: '(555) 101-2004', duration: '07:40', direction: 'incoming', status: 'completed', notes: 'Sewer backup emergency, sent TECH-001' },
  { id: 'CL-014', dateTime: '2024-07-11 14:55', caller: 'Ferguson Plumbing', phoneNumber: '(800) 555-0102', duration: '03:22', direction: 'outgoing', status: 'completed', notes: 'Ordered water heater and fixtures' },
  { id: 'CL-015', dateTime: '2024-07-11 09:10', caller: 'SupplyHouse.com', phoneNumber: '(800) 555-0101', duration: '01:45', direction: 'incoming', status: 'completed', notes: 'Delivery ETA for PO-003' },
  { id: 'CL-016', dateTime: '2024-07-10 16:30', caller: 'Emily Thompson', phoneNumber: '(555) 101-2005', duration: '00:00', direction: 'incoming', status: 'missed', notes: '' },
  { id: 'CL-017', dateTime: '2024-07-10 13:00', caller: 'TECH-005 - Sarah Blake', phoneNumber: '(555) 200-1005', duration: '05:10', direction: 'outgoing', status: 'completed', notes: 'Gas line inspection completed' },
];

/* ── Skeleton ── */
function SkeletonPage() {
  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      <div className="h-5 w-64 rounded bg-muted animate-pulse" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-28 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      <Card variant="default" padding="md">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-muted animate-pulse" />
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ── Main Page ── */
export default function PhoneCallsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'log' | 'settings'>('active');
  const [callLogFilter, setCallLogFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dialInput, setDialInput] = useState('');

  // Settings state
  const [twilioConnected, setTwilioConnected] = useState(false);
  const [callRecording, setCallRecording] = useState(false);
  const [voicemailGreeting, setVoicemailGreeting] = useState('Thank you for calling PlumbCore. We are currently unavailable. Please leave a message and we will return your call as soon as possible.');
  const [forwardingNumber, setForwardingNumber] = useState('');
  const [businessHours, setBusinessHours] = useState('Mon-Fri 7:00 AM - 6:00 PM, Sat 8:00 AM - 2:00 PM');

  // Current call state
  const [currentCall, setCurrentCall] = useState<{
    caller: string;
    phoneNumber: string;
    duration: string;
    status: CallStatus;
  } | null>(null);

  const handleRetry = () => {
    setError(null);
    setLoading(false);
  };

  const handleDial = () => {
    if (!dialInput.trim()) return;
    setCurrentCall({
      caller: 'Manual Dial',
      phoneNumber: dialInput,
      duration: '00:00',
      status: 'ringing',
    });
    setDialInput('');
  };

  const handleAnswerCall = () => {
    if (currentCall) {
      setCurrentCall({ ...currentCall, status: 'in-progress' });
    }
  };

  const handleEndCall = () => {
    if (currentCall) {
      setCurrentCall({ ...currentCall, status: 'ended' });
      setTimeout(() => setCurrentCall(null), 2000);
    }
  };

  const handleKeypadPress = (digit: string) => {
    setDialInput(prev => prev + digit);
  };

  const handleClearDial = () => {
    setDialInput('');
  };

  const handleConnectTwilio = () => {
    setTwilioConnected(true);
  };

  // Filter call log
  const filteredCallLog = mockCallLog.filter(entry => {
    const matchesSearch = !callLogFilter ||
      entry.caller.toLowerCase().includes(callLogFilter.toLowerCase()) ||
      entry.phoneNumber.includes(callLogFilter);
    const matchesDateFrom = !dateFrom || entry.dateTime >= dateFrom;
    const matchesDateTo = !dateTo || entry.dateTime <= dateTo;
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const tabs = [
    { key: 'active', label: 'Active Calls' },
    { key: 'log', label: 'Call Log' },
    { key: 'settings', label: 'Settings' },
  ] as const;

  /* ── Error state ── */
  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Failed to load phone calls" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  /* ── Loading state ── */
  if (loading) {
    return <SkeletonPage />;
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Phone Calls</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage calls and Twilio integration</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Active Calls ── */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Call Card */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Current Call</h2>
            {currentCall ? (
              <Card variant="bordered" padding="lg">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                    currentCall.status === 'ringing' ? 'bg-green-100 animate-pulse' :
                    currentCall.status === 'in-progress' ? 'bg-blue-100' :
                    'bg-muted'
                  }`}>
                    <svg className={`h-8 w-8 ${
                      currentCall.status === 'ringing' ? 'text-green-600' :
                      currentCall.status === 'in-progress' ? 'text-primary' :
                      'text-muted-foreground/80'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{currentCall.caller}</p>
                    <p className="text-sm text-muted-foreground">{currentCall.phoneNumber}</p>
                  </div>
                  <StatusBadge status={currentCall.status} size="md" />
                  <p className="text-sm text-muted-foreground/80">{currentCall.duration}</p>

                  <div className="flex gap-3">
                    {currentCall.status === 'ringing' && (
                      <Button size="md" onClick={handleAnswerCall} className="bg-green-600 hover:bg-green-700">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        Answer Call
                      </Button>
                    )}
                    {currentCall.status !== 'ended' && (
                      <Button variant="destructive" size="md" onClick={handleEndCall}>
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5.25 5.25 0 010-7.07m6.072 0a5.25 5.25 0 010 7.07M10 12h4" />
                        </svg>
                        End Call
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card variant="bordered" padding="lg">
                <EmptyState
                  title="No active calls"
                  description="There are no active calls right now. Use the keypad to place a call."
                />
              </Card>
            )}
          </div>

          {/* Dial Pad */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Dial Pad</h2>
            <Card variant="bordered" padding="md">
              <div className="flex flex-col items-center space-y-4">
                {/* Dial Input */}
                <div className="w-full">
                  <Input
                    placeholder="Enter phone number..."
                    value={dialInput}
                    onChange={(e) => setDialInput(e.target.value)}
                    className="text-center text-lg font-mono"
                  />
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(digit => (
                    <button
                      key={digit}
                      onClick={() => handleKeypadPress(digit)}
                      className="flex h-14 w-full items-center justify-center rounded-xl bg-muted text-lg font-semibold text-foreground hover:bg-muted active:bg-gray-300 transition-colors"
                    >
                      {digit}
                    </button>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 w-full max-w-[240px]">
                  <Button variant="outline" size="sm" fullWidth onClick={handleClearDial}>
                    Clear
                  </Button>
                  <Button
                    size="md"
                    fullWidth
                    onClick={handleDial}
                    disabled={!dialInput.trim()}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-sm shadow-green-200 h-12 text-base font-semibold tracking-wide"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    Call
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Tab: Call Log ── */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search by caller or number..."
                value={callLogFilter}
                onChange={(e) => setCallLogFilter(e.target.value)}
              />
            </div>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="max-w-[160px]"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="max-w-[160px]"
            />
          </div>

          {/* Table */}
          {filteredCallLog.length === 0 ? (
            <Card variant="bordered" padding="lg">
              <EmptyState
                title="No calls found"
                description="Try adjusting your search or date range filters."
              />
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl ring-1 ring-black/5 bg-white">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date/Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Caller</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Direction</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCallLog.map((entry) => (
                    <tr key={entry.id} className="transition-colors hover:bg-muted">
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{entry.dateTime}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">{entry.caller}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground text-center whitespace-nowrap">{entry.duration}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          entry.direction === 'incoming'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}>
                          {entry.direction === 'incoming' ? 'Incoming' : 'Outgoing'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <StatusBadge status={entry.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground/80 max-w-[200px] truncate">
                        {entry.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
                Showing {filteredCallLog.length} of {mockCallLog.length} calls
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Settings ── */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-5">
          {/* Twilio Connection */}
          <Card variant="bordered" padding="lg">
            <h3 className="text-base font-semibold text-foreground mb-4">Twilio Integration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Twilio Phone Number</p>
                  <p className="text-xs text-muted-foreground/80">
                    {twilioConnected ? '+1 (555) 123-4567' : 'Not connected'}
                  </p>
                </div>
                {!twilioConnected ? (
                  <Button size="sm" onClick={handleConnectTwilio}>
                    Connect Twilio
                  </Button>
                ) : (
                  <StatusBadge status="connected" size="md" />
                )}
              </div>
              {twilioConnected && (
                <p className="text-xs text-muted-foreground/80">
                  Your Twilio account is linked. Phone number +1 (555) 123-4567 is active.
                </p>
              )}
            </div>
          </Card>

          {/* Call Settings */}
          <Card variant="bordered" padding="lg">
            <h3 className="text-base font-semibold text-foreground mb-4">Call Settings</h3>
            <div className="space-y-4">
              {/* Call Recording Toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-foreground">Call Recording</p>
                  <p className="text-xs text-muted-foreground/80">Record all inbound and outbound calls</p>
                </div>
                <button
                  onClick={() => setCallRecording(!callRecording)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    callRecording ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    callRecording ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </label>

              {/* Voicemail Greeting */}
              <div>
                <TextArea
                  label="Voicemail Greeting"
                  placeholder="Enter your voicemail greeting..."
                  rows={3}
                  value={voicemailGreeting}
                  onChange={(e) => setVoicemailGreeting(e.target.value)}
                />
              </div>

              {/* Forwarding Number */}
              <Input
                label="Forwarding Number"
                placeholder="+1 (555) 000-0000"
                value={forwardingNumber}
                onChange={(e) => setForwardingNumber(e.target.value)}
                hint="Calls will be forwarded to this number when unanswered"
              />

              {/* Business Hours */}
              <div>
                <Input
                  label="Business Hours"
                  placeholder="Mon-Fri 7:00 AM - 6:00 PM"
                  value={businessHours}
                  onChange={(e) => setBusinessHours(e.target.value)}
                  hint="Define hours for call routing"
                />
                <p className="mt-2 text-xs text-muted-foreground/80">
                  Calls received outside business hours will be sent to voicemail.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button size="sm">Save Settings</Button>
          </div>
        </div>
      )}
    </div>
  );
}
