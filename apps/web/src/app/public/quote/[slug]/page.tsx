'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Card, Input, TextArea, Modal } from '@/pkg/ui-components';

/* ── Mock data ── */
const PLUMBING_SCENARIOS: Record<string, {
  issue: string;
  laborRange: string;
  partsRange: string;
  totalRange: string;
  suggestedParts: string[];
  companyLogo: string;
  companyName: string;
}> = {
  'leaky-faucet': {
    issue: 'Worn-out faucet cartridge / O-ring failure',
    laborRange: '$65–120',
    partsRange: '$15–40',
    totalRange: '$80–160',
    suggestedParts: ['Faucet cartridge kit', 'O-ring assortment', 'Plumber\'s grease'],
    companyLogo: '🔧',
    companyName: 'PlumbCore Plumbing',
  },
  'clogged-drain': {
    issue: 'Grease and debris buildup in kitchen drain line',
    laborRange: '$95–180',
    partsRange: '$10–30',
    totalRange: '$105–210',
    suggestedParts: ['Drain snake', 'Bio-clean drain cleaner', 'PVC pipe section'],
    companyLogo: '🔧',
    companyName: 'PlumbCore Plumbing',
  },
  'running-toilet': {
    issue: 'Faulty flapper valve / fill valve malfunction',
    laborRange: '$55–100',
    partsRange: '$10–25',
    totalRange: '$65–125',
    suggestedParts: ['Universal flapper', 'Fluidmaster fill valve', 'Wax ring'],
    companyLogo: '🔧',
    companyName: 'PlumbCore Plumbing',
  },
  'water-heater': {
    issue: 'Sediment buildup / heating element failure in water heater',
    laborRange: '$120–250',
    partsRange: '$30–80',
    totalRange: '$150–330',
    suggestedParts: ['Heating element', 'Anode rod', 'Sediment flush kit'],
    companyLogo: '🔧',
    companyName: 'PlumbCore Plumbing',
  },
  'pipe-leak': {
    issue: 'Leaking pipe joint under sink / in wall cavity',
    laborRange: '$85–165',
    partsRange: '$15–45',
    totalRange: '$100–210',
    suggestedParts: ['PVC coupling', 'Pipe repair clamp', 'Epoxy putty', 'Teflon tape'],
    companyLogo: '🔧',
    companyName: 'PlumbCore Plumbing',
  },
};

const PLUMBING_TIPS = [
  'Turn off the water supply at the nearest shut-off valve to prevent further damage.',
  'Place a bucket under the leak to catch dripping water.',
  'Take clear photos of the issue — it helps our technicians prepare the right tools.',
];

/* ── Helpers ── */
function generateConfirmationNumber() {
  return 'PC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/* ── Step Indicator ── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                isDone
                  ? 'bg-electric text-[#0a0e2a]'
                  : isActive
                  ? 'bg-blue-tint text-primary border-2 border-electric'
                  : 'bg-muted text-muted-foreground/80'
              }`}
            >
              {isDone ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < total && (
              <div className={`h-0.5 w-8 sm:w-12 rounded-full ${isDone ? 'bg-electric' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Drag & Drop Upload ── */
function PhotoUpload({ photos, onAddPhotos, onRemove }: {
  photos: string[];
  onAddPhotos: (files: FileList) => void;
  onRemove: (index: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files?.length) {
      onAddPhotos(e.dataTransfer.files);
    }
  }, [onAddPhotos]);

  return (
    <div
      ref={dropRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all ${
        dragging
          ? 'border-electric bg-electric/5'
          : 'border-border hover:border-white/20'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onAddPhotos(e.target.files)}
      />

      {photos.length === 0 ? (
        <div className="space-y-2">
          <svg className="mx-auto h-10 w-10 text-muted-foreground-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21z" />
          </svg>
          <p className="text-sm text-muted-foreground/80">
            <span className="text-primary cursor-pointer">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">Photos help us diagnose faster — JPG, PNG up to 10MB</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          {photos.map((src, i) => (
            <div key={i} className="relative group shrink-0">
              <img
                src={src}
                alt={`Upload ${i + 1}`}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl object-cover ring-1 ring-black/5"
              />
              <button
                onClick={() => onRemove(i)}
                className="absolute -top-2 -right-2 rounded-full bg-white ring-1 ring-black/5 p-1 text-muted-foreground/80 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground/80 hover:border-electric/50 hover:text-primary transition-all"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Payment Card Input (visual only) ── */
function CardInput({ onComplete }: { onComplete: () => void }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  return (
    <div className="space-y-4">
      <Input
        label="Cardholder Name"
        placeholder="John Smith"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div>
        <label className="block text-sm font-medium text-muted-foreground/80 mb-1.5">Card Number</label>
        <div className="relative">
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="4242 4242 4242 4242"
            className="w-full rounded-xl border border-white/10 bg-whiteer px-4 py-2.5 pl-11 text-sm text-foreground placeholder-steel/50 outline-none transition-all focus:border-electric/50 focus:ring-1 focus:ring-electric/20"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Expiry"
          placeholder="MM/YY"
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
        />
        <Input
          label="CVC"
          placeholder="123"
          value={cvc}
          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
        />
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function PublicQuotePage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const scenario = PLUMBING_SCENARIOS[slug] || PLUMBING_SCENARIOS['pipe-leak'];

  /* ── State ── */
  const [step, setStep] = useState(1);
  const [issueDescription, setIssueDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [apiAnalysisResult, setApiAnalysisResult] = useState<{
    detectedIssue: string;
    severity: string;
    estimatedParts: string;
    estimatedLaborMin: number;
    estimatedLaborMax: number;
    description: string;
  } | null>(null);

  /* Schedule Modal */
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const [schedulePhone, setSchedulePhone] = useState('');
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleAddress, setScheduleAddress] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduling, setScheduling] = useState(false);

  /* Payment */
  const [paymentStage, setPaymentStage] = useState<'idle' | 'paying' | 'done'>('idle');
  const [paymentLoading, setPaymentLoading] = useState(false);

  /* Success */
  const [confirmation, setConfirmation] = useState<{
    number: string;
    date: string;
    time: string;
    address: string;
  } | null>(null);

  /* ── Handlers ── */
  const handleAddPhotos = useCallback((files: FileList) => {
    const newPhotos: string[] = [];
    const colors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6'];
    Array.from(files).forEach((file, i) => {
      const color = colors[(photos.length + i) % colors.length];
      newPhotos.push(`https://placehold.co/400x300/${color}/ffffff?text=Photo`);
    });
    setPhotos((prev) => [...prev, ...newPhotos]);
  }, [photos.length]);

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!issueDescription.trim()) return;
    setAnalyzing(true);
    setAnalysisDone(false);

    try {
      // Convert first photo to base64 if available
      let imageBase64 = '';
      if (photos.length > 0) {
        // We'd need to re-fetch the image to get base64, but since we store
        // placeholder URLs, we'll send the description as context
        imageBase64 = '';
      }

      const res = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64 || 'placeholder',
          description: issueDescription,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error (${res.status})`);
      }

      const data = await res.json();
      // Store the API result so it can be shown
      setApiAnalysisResult(data);
      setAnalysisDone(true);
    } catch {
      // Fall back to scenario-based display if API is unavailable
      setAnalysisDone(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSchedule = () => {
    if (!scheduleName.trim() || !schedulePhone.trim() || !scheduleEmail.trim() || !scheduleAddress.trim() || !scheduleDate) return;
    setScheduling(true);
    setTimeout(() => {
      setScheduling(false);
      setShowScheduleModal(false);
      setPaymentStage('paying');
      setStep(4);
    }, 800);
  };

  const handlePayDeposit = () => {
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setPaymentStage('done');
      setConfirmation({
        number: generateConfirmationNumber(),
        date: formatDate(new Date(Date.now() + 86400000 * 3)),
        time: formatTime(new Date(Date.now() + 86400000 * 3 + 3600000 * 9)),
        address: scheduleAddress || '123 Main St, Austin, TX',
      });
    }, 2000);
  };

  const canAnalyze = issueDescription.trim().length > 0;

  return (
    <div className="min-h-screen bg-muted">
      {/* ── Loading State ── */}
      {false && null}

      {/* ── Content ── */}
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-tint text-2xl mb-3">
            {scenario.companyLogo}
          </div>
          <h1 className="text-lg font-semibold text-foreground">{scenario.companyName}</h1>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-foreground">Get a Free Estimate</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tell us about your plumbing issue and we&apos;ll provide an AI-powered estimate instantly.</p>
        </div>

        <Card variant="elevated" padding="lg" className="space-y-6">
          {/* Step Indicator */}
          <StepIndicator current={step} total={4} />

          {/* ── STEP 1: Describe Issue ── */}
          {step === 1 && (
            <div className="space-y-4">
              <TextArea
                label="Describe your plumbing issue"
                placeholder="e.g. My kitchen sink is leaking under the cabinet. Water pools when I run the faucet..."
                rows={5}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!canAnalyze}
                  onClick={() => setStep(2)}
                >
                  Next — Add Photos
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Upload Photos ── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground/80 font-medium">Upload photos of the issue (optional but recommended)</p>
              <PhotoUpload
                photos={photos}
                onAddPhotos={handleAddPhotos}
                onRemove={handleRemovePhoto}
              />
              <div className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button variant="primary" size="md" onClick={() => { setStep(3); handleAnalyze(); }}>
                  Analyze with AI
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: AI Analysis ── */}
          {step === 3 && (
            <div className="space-y-4">
              {analyzing && (
                <div className="flex flex-col items-center py-8 space-y-3">
                  <div className="relative h-14 w-14">
                    <div className="absolute inset-0 rounded-full border-2 border-border" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-electric animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-primary">AI is analyzing your issue...</p>
                  <p className="text-xs text-muted-foreground">Our AI is reviewing your description and photos to provide an accurate estimate.</p>
                </div>
              )}

              {analysisDone && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Analysis Results */}
                  <div className="rounded-xl bg-electric/5 border border-electric/20 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-tint text-primary">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-primary">AI Analysis Complete</h3>
                        <div className="mt-3 space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Issue Detected</p>
                            <p className="text-sm text-foreground">{apiAnalysisResult?.detectedIssue || scenario.issue}</p>
                          </div>
                          {apiAnalysisResult && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Severity</p>
                              <p className="text-sm text-foreground capitalize">{apiAnalysisResult.severity}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-whiteer p-3">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Labor</p>
                              <p className="text-lg font-bold text-foreground">
                                {apiAnalysisResult
                                  ? `$${apiAnalysisResult.estimatedLaborMin}–${apiAnalysisResult.estimatedLaborMax}`
                                  : scenario.laborRange}
                              </p>
                            </div>
                            <div className="rounded-xl bg-whiteer p-3">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Parts / Estimate</p>
                              <p className="text-lg font-bold text-foreground">
                                {apiAnalysisResult ? apiAnalysisResult.estimatedParts : scenario.partsRange}
                              </p>
                            </div>
                          </div>
                          {apiAnalysisResult && (
                            <div className="rounded-xl bg-blue-tint p-3 border border-electric/20">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">AI Description</p>
                              <p className="text-sm text-foreground mt-1">{apiAnalysisResult.description}</p>
                            </div>
                          )}
                          {!apiAnalysisResult && (
                            <div className="rounded-xl bg-blue-tint p-3 border border-electric/20">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Estimate Range</p>
                              <p className="text-2xl font-bold text-primary">{scenario.totalRange}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="rounded-xl bg-accent-amber/5 border border-accent-amber/20 p-3">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Pro Tip</p>
                    <p className="text-sm text-foreground/80">{PLUMBING_TIPS[0]}</p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="md"
                      fullWidth
                      onClick={() => setShowScheduleModal(true)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule Service
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => { setPaymentStage('paying'); setStep(4); }}
                    >
                      Book Now — Pay $49 Deposit
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">Your $49 deposit goes toward the final bill. No hidden fees.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Payment / Success ── */}
          {step === 4 && (
            <div className="space-y-5">
              {paymentStage === 'paying' && (
                <>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground">Complete Your Booking</h3>
                    <p className="text-sm text-muted-foreground mt-1">Pay a $49 deposit to secure your appointment.</p>
                  </div>

                  <div className="rounded-xl bg-whiteer ring-1 ring-black/5 p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Deposit Amount</p>
                    <p className="text-3xl font-bold text-foreground mt-1">$49.00</p>
                    <p className="text-xs text-muted-foreground mt-1">Applied to final bill</p>
                  </div>

                  <CardInput onComplete={() => {}} />

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={paymentLoading}
                    onClick={handlePayDeposit}
                  >
                    Pay Deposit & Book
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Your card will be charged $49. Full payment is due at service completion.
                  </p>
                </>
              )}

              {paymentStage === 'done' && confirmation && (
                <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Your appointment is confirmed!</h3>
                    <p className="text-sm text-muted-foreground mt-1">We&apos;ll send a reminder before we arrive.</p>
                  </div>

                  <div className="rounded-xl bg-whiteer ring-1 ring-black/5 p-4 space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Confirmation</span>
                      <span className="text-sm font-semibold text-primary">{confirmation.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Date</span>
                      <span className="text-sm text-foreground">{confirmation.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Time</span>
                      <span className="text-sm text-foreground">{confirmation.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Address</span>
                      <span className="text-sm text-foreground text-right max-w-[200px]">{confirmation.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Deposit Paid</span>
                      <span className="text-sm font-semibold text-green-600">$49.00</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-accent-amber/5 border border-accent-amber/20 p-3 text-left">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">What to Expect</p>
                    <ul className="text-xs text-foreground/80 space-y-1">
                      <li>• A licensed plumber will arrive during the appointment window</li>
                      <li>• Free diagnostic included with your deposit</li>
                      <li>• Final payment due after work is completed to your satisfaction</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by PlumbCore AI — © {new Date().getFullYear()} PlumbCore Plumbing. All rights reserved.
        </p>
      </div>

      {/* ── Schedule Modal ── */}
      <Modal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Service"
        description="Fill in your details and we'll confirm your appointment."
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={scheduling} onClick={handleSchedule}>
              Confirm & Continue
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Smith"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
          />
          <Input
            label="Phone"
            placeholder="(555) 123-4567"
            type="tel"
            value={schedulePhone}
            onChange={(e) => setSchedulePhone(e.target.value)}
          />
          <Input
            label="Email"
            placeholder="john@email.com"
            type="email"
            value={scheduleEmail}
            onChange={(e) => setScheduleEmail(e.target.value)}
          />
          <Input
            label="Service Address"
            placeholder="123 Main St, Austin, TX"
            value={scheduleAddress}
            onChange={(e) => setScheduleAddress(e.target.value)}
          />
          <Input
            label="Preferred Date"
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
