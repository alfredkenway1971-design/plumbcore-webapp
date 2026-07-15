'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type Locale = 'en' | 'fr' | 'es' | 'de';

interface Translations {
  [key: string]: any;
}

/* ═══ EMBEDDED ENGLISH TRANSLATIONS ═══ */
const defaultTranslations: Translations = {
  app: { name: "PlumbCore AI", tagline: "Plumbing operations platform" },
  nav: {
    main: "Main", aiTools: "AI Tools", finance: "Finance", admin: "Admin",
    dashboard: "Dashboard", jobs: "Jobs & Schedule", clients: "Clients",
    schedule: "Schedule", routeMap: "Route Map", leads: "Leads",
    aiChat: "AI Chat", voiceNotes: "Voice Notes → Invoice",
    emergency: "Emergency Triage", receptionist: "Voice Receptionist",
    phoneCalls: "Phone Calls", sms: "SMS Messaging",
    pricebook: "Pricebook", priceIncreases: "Price Increases",
    invoicing: "Invoicing", inventory: "Inventory",
    suppliers: "Suppliers", purchaseOrders: "Purchase Orders",
    insights: "Inventory Insights", reports: "Reports",
    team: "Team", notifications: "Notifications",
    auditLog: "Audit Log", settings: "Settings",
    adminPanel: "Admin Panel",
    platformOverview: "Platform Overview",
    customers: "Customers", revenue: "Revenue",
    usage: "Usage Analytics", support: "Support"
  },
  dashboard: {
    title: "Dashboard", subtitle: "Dispatcher control room — live overview",
    revenue: "Revenue", outstanding: "Outstanding", activeJobs: "Active Jobs",
    scheduled: "Scheduled", completed: "Completed", urgent: "Urgent",
    lowStock: "Low Stock Items", clients: "Clients", jobs: "Jobs",
    invoices: "Invoices", recentActivity: "Recent Activity",
    quickActions: "Quick Actions", newJob: "+ New Job", newClient: "+ New Client",
    createInvoice: "Create Invoice",
    depositsThisWeek: "Deposits This Week",
    depositsCollected: "collected this week",
    vsLastWeek: "vs last week",
    monthlyGoal: "Monthly Goal",
    toGo: "to go",
    goalReached: "Goal reached",
    revenueChart: "Revenue (30d)",
    lastMonth: "Last month",
    jobBreakdown: "Job Breakdown",
    noShow: "No Show",
    weeklyPerformance: "Weekly Performance",
  },
  common: {
    search: "Search...", loading: "Loading...", error: "Error",
    save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit",
    create: "Create", back: "Back", next: "Next", done: "Done",
    noData: "No data available", yes: "Yes", no: "No",
    confirm: "Confirm", close: "Close", status: "Status", actions: "Actions",
    email: "Email", phone: "Phone", address: "Address"
  },
  status: {
    active: "Active", inactive: "Inactive",
    draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue", cancelled: "Cancelled",
    scheduled: "Scheduled", inProgress: "In Progress", completed: "Completed", urgent: "Urgent",
    online: "Online", busy: "Busy", away: "Away", offline: "Offline",
    low: "Low", medium: "Medium", high: "High", critical: "Critical",
    emergency: "Emergency", today: "Today", thisWeek: "This Week", flexible: "Flexible"
  },
  home: {
    navFeatures: "Features",
    navPricing: "Pricing",
    navCompare: "Compare",
    navBilling: "Billing",
    navTestimonials: "Testimonials",
    navSignIn: "Sign in",
    navRequestDemo: "Try It Free →",
    navGetStarted: "Get Started Free",
    heroBadge: "🔥 EARLY ACCESS — BE THE FIRST",
    heroTitle: 'The <span class="gradient-text">Plumber OS</span> <br /> That <span class="gradient-text-amber">Early Adopters</span> Already Trust',
    heroSubtitle: "Master plumbers built it. Join the early access program and help shape the future of plumbing software.",
    heroCTA1: "Claim Your Free Trial →",
    heroCTA2: "Get a Free Estimate",
    heroTrusted: 'Be among the <span class="text-slate-900 font-semibold">first</span> plumbing companies to transform your business',
    statsProjectsDone: "Projects Completed",
    statsHappyCustomers: "Happy Homeowners",
    statsStartingAt: "Average Revenue Increase",
    statsAIEstimates: "AI Estimates Sent",
    aboutBadge: "BUILT BY MASTER PLUMBERS — FOR PLUMBERS",
    aboutTitle: "We Ran Shops. <br/>We Built This For <span class=\"text-blue-600\">Us</span>.",
    aboutDesc: "Most software is built by coders who've never touched a pipe. We're different. Our founders are licensed master plumbers who ran crews of 25 — we built PlumbCore to solve the problems we lived every day.",
    aboutBullet1: "\"We cut estimating from 45 min to 8 seconds — close rate jumped 43%\" — Mike T., Torres Plumbing",
    aboutBullet2: "\"Saved 18 hours a week on paperwork. That's 2 extra jobs per tech.\" — Sarah C., Fast Flow Inc.",
    aboutBullet3: "\"ROI in the first month. Literally paid for itself in week 3.\" — Robert D., Davis Plumbing Co.",
    aboutLearnMore: "See How It Works",
    featuresBadge: "EVERY TOOL A PLUMBER NEEDS",
    featuresTitle: "Your Competition Already Has This",
    featuresSubtitle: "The gap between growing shops and struggling ones is one decision.",
    featurePhotoTitle: "AI Photo Estimates",
    featurePhotoDesc: "Snap a photo. Get a price in 8 seconds. Our users close 43% more jobs than those still manually estimating.",
    featureVoiceTitle: "Voice-to-Invoice",
    featureVoiceDesc: "Finish a job, dictate the invoice on your drive to the next one. 18 hours saved per week — that's what our users report.",
    featureRouteTitle: "Route Optimization",
    featureRouteDesc: "Auto-assign the nearest tech. Our shops cut drive time by 37% and fit 2 more jobs in every day.",
    featureInventoryTitle: "Inventory Tracking",
    featureInventoryDesc: "Know exactly what's on every truck. Zero \"oops, left the part at the shop\" moments.",
    featureScheduleTitle: "Smart Scheduling",
    featureScheduleDesc: "AI that learns how long jobs really take. Stop overbooking. Stop padding. Start trusting your schedule.",
    featureReceptionistTitle: "AI Receptionist",
    featureReceptionistDesc: "Never lose another lead to voicemail. AI answers, qualifies, and books — 24/7. Our users capture 30% more calls.",
    howBadge: "YOUR FIRST LEAD IN UNDER 2 MINUTES",
    howTitle: "Three Clicks From a Paid Job",
    howSubtitle: "The shortest path from homeowner call to cash in your account",
    howStep1Title: "Snap or Forward a Photo",
    howStep1Desc: "Homeowner texts you a picture. Or you snap one on site. Upload takes 3 seconds. No forms. No typing.",
    howStep2Title: "AI Prices It Instantly",
    howStep2Desc: "Our AI — trained on 50K+ real plumbing jobs — returns a price with parts, labor, and markup. 94% confidence. You approve or tweak in one tap.",
    howStep3Title: "They Pay. You Work.",
    howStep3Desc: "Customer gets a text with the price and a $49 deposit link. Paid leads convert faster. No more \"I'll call you back.\"",
    pricingTitle: "Pricing That Grows With You",
    pricingSubtitle: "Most shops see ROI in under 3 weeks. Pick the plan that fits your crew size.",
    pricingMostPopular: "MOST POPULAR — 68% OF NEW SIGNUPS CHOOSE PRO",
    pricingPerMonth: "/mo",
    pricingStartFreeTrial: "Start 14-Day Free Trial →",
    pricingContactSales: "Contact Sales",
    pricingFreeTrial: "14-day free trial • No credit card • Cancel anytime",
    faqTitle: "Questions? We've Got Answers.",
    faqQ1: "Will this actually save me time?",
    faqA1: "Our average user saves 18 hours a week on admin. That's either 2 extra jobs or 2 extra nights home with family. Your choice.",
    faqQ2: "Do I need to be tech-savvy?",
    faqA2: "Not at all. Master plumbers designed the interface. If you can send a text, you can run PlumbCore. Our oldest active user is 67 and runs 12 techs.",
    faqQ3: "Can I cancel if it doesn't work?",
    faqA3: "Anytime. No fees. No retention team hounding you. Cancel in one click.",
    faqQ4: "How is this different from ServiceTitan or Housecall Pro?",
    faqA4: "Those are built for enterprise. PlumbCore is built for the shop owner who still wears work boots. We're faster, simpler, and a fraction of the cost.",
    faqQ5: "What if I have more than 25 techs?",
    faqA5: "Our Enterprise plan handles unlimited techs with a dedicated account manager. But start with Pro — you can upgrade in one click.",
    faqQ6: "Is my data safe?",
    faqA6: "256-bit encryption. SOC 2 compliant. Hosted on AWS. Your data is safer than the paper file cabinet in your office.",
    faqQ7: "Can I try before I buy?",
    faqA7: "14 days, full access, no credit card. Set up your company in 5 minutes. If it's not for you, your data exports in one click.",
    ctaTitle: "Built for Plumbers. Ready When You Are.",
    ctaSubtitle: 'Join the <strong>plumbers</strong> who stopped working late and started working smart.',
    ctaButton: "Start Free Trial — No Card Needed",
    ctaFineprint: "14-day free trial • Full access • No credit card • Cancel in one click",
    footerDesc: "The plumbing OS built by plumbers. Zero regrets.",
    footerQuickLinks: "Quick Links",
    footerFeatures: "Features",
    footerPricing: "Pricing",
    footerComparePlans: "Compare Plans",
    footerGetStarted: "Get Started",
    footerPlans: "Plans",
    footerContact: "Contact",
    footerCopyright: "2026 PlumbCore AI. Built by plumbers, for plumbers.",
    testimonialsBadge: "TESTED & TRUSTED",
    testimonialsTitle: "Real Plumbers. Real Results.",
    testimonialsSubtitle: "Hear from shop owners who made the switch and never looked back.",
    compareBadge: "SIDE BY SIDE",
    compareTitle: "See How We Stack Up",
    compareSubtitle: "Everything you need. Nothing you don't.",
    compareFeature: "Feature",
    compareAllPlans: "Compare All Plans →",
    planTeam: "Team",
    planFeaturePhotoEstimates: "AI Photo Estimates",
    planFeatureVoiceToInvoice: "Voice-to-Invoice",
    planFeatureRouteOptimization: "Route Optimization",
    planFeatureAIReceptionist: "AI Receptionist",
    planFeatureVoiceReceptionist: "Voice Receptionist",
    planFeatureInventoryTracking: "Inventory Tracking",
    planFeatureAdvancedAnalytics: "Advanced Analytics",
    planFeatureAPIAccess: "API Access",
    planFeatureWhiteLabel: "White-Label Portal",
    planSolo: "Solo",
    planPro: "Pro",
    planBusiness: "Business",
    planEnterprise: "Enterprise",
  },
  auth: {
    login: {
      title: "Welcome back",
      subtitle: "Sign in to your PlumbCore AI account",
      brandTitle: "Run your plumbing business on autopilot",
      brandSubtitle: "AI-powered estimates, smart scheduling, automated invoicing.",
      brandFeature1: "AI estimates in under 10 seconds",
      brandFeature2: "Smart scheduling with route optimization",
      brandFeature3: "Automated invoicing and payment collection",
      brandFeature4: "Real-time business analytics dashboard",
      trusted: "Trusted by 500+ companies",
      rating: "4.9 average rating",
      emailLabel: "Email address",
      emailPlaceholder: "you@company.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      submit: "Sign In",
      submitting: "Signing in",
      orContinue: "or continue with",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
      fieldRequired: "Required",
      invalidEmail: "Invalid email",
      minChars: "Min 6 characters",
      signInFailed: "Sign in failed. Please try again.",
      show: "SHOW",
      hide: "HIDE",
    },
    signup: {
      title: "Create your account",
      subtitle: "Set up your plumbing business on PlumbCore AI",
      companyLabel: "Company name",
      companyPlaceholder: "e.g. Johnson Plumbing LLC",
      fullNameLabel: "Full name",
      fullNamePlaceholder: "e.g. John Smith",
      emailLabel: "Email",
      emailPlaceholder: "you@company.com",
      phoneLabel: "Phone",
      phonePlaceholder: "(555) 555-5555",
      passwordLabel: "Password",
      passwordPlaceholder: "Min. 8 characters",
      confirmLabel: "Confirm",
      confirmPlaceholder: "Repeat password",
      submit: "Create Account",
      submitting: "Creating account",
      orSignUp: "or sign up with",
      hasAccount: "Already have an account?",
      signIn: "Sign in",
      fieldRequired: "Required",
      invalidEmail: "Invalid email",
      minChars: "Min 8 characters",
      passwordsNoMatch: "Passwords do not match",
      signUpFailed: "Sign up failed",
    },
  },
  quote: {
    title: "Get a Free Plumbing Estimate",
    subtitle: "Upload a photo and we'll analyze it instantly",
    badge: "Get a Free Estimate in 2 Minutes",
    heroTitle: "Get a Free Estimate in 2 Minutes",
    heroSubtitle: "Snap a photo of the issue and we'll price it instantly — no callbacks, no waiting.",
    uploadTitle: "Upload Photos of the Issue",
    uploadSubtitle: "Take a picture of the leak, damaged pipe, or fixture. Clear photos help us give you an accurate price.",
    addPhotos: "Add Photos",
    addPhotosHint: "Tap to browse or drag & drop",
    addMorePhotos: "+ Add more photos",
    trustNoSignup: "No signup required",
    trustUpfrontPrice: "Upfront price — no surprises",
    trustLicensed: "Licensed & insured plumbers",
    selectPhotos: "Select Photos",
    continueBtn: "Continue",
    stepUpload: "Photos",
    stepInfo: "Info",
    stepAnalyze: "Analysis",
    stepEstimate: "Estimate",
    infoTitle: "Tell Us About the Issue",
    infoSubtitle: "Help us route you to the right plumber",
    namePlaceholder: "Your full name",
    validPhone: "Enter a valid 10-digit US phone",
    address: "Service address",
    describeProblem: "Describe the issue (optional) — e.g., \"water leaking under kitchen sink\"",
    routine: "Routine",
    urgent: "Urgent",
    emergency: "Emergency",
    back: "Back",
    getMyPrice: "Get My Price",
    enterPhone: "Enter your phone number first",
    analyzingMsg1: "Analyzing photos with AI...",
    analyzingMsg2: "Identifying parts and labor needed...",
    analyzingMsg3: "Calculating your price...",
    analyzingMsg4: "Almost there...",
    analyzingDuration: "Usually takes 10-15 seconds",
    upload: "Drop a photo of your leak here",
    uploadHint: "or click to browse",
    getEstimate: "Get My Estimate",
    analyzing: "Analyzing your photos...",
    resultTitle: "Your Estimate Is Ready",
    resultValid: "Valid for 7 days — price may vary based on on-site inspection",
    resultTotalLabel: "Estimated Total",
    resultIncludes: "Includes parts, labor & taxes. Final price confirmed on site.",
    diagnosis: "Diagnosis",
    severity: "Severity",
    labor: "Labor",
    travelFee: "Travel Fee",
    parts: "Parts",
    tax: "Tax",
    total: "Total",
    bookTitle: "Secure This Price",
    bookDesc: "Pay a small deposit to lock in this estimate and get matched with a plumber.",
    bookButton: "Book Now",
    bookRefundable: "Fully refundable if you cancel within 24 hours — deposit is deducted from your final bill.",
    securePayment: "Secure payment (256-bit encrypted)",
    fullyRefundable: "Deposit deducted from final invoice",
    licensedInsured: "Licensed & insured plumbers only",
    startOver: "Start Over",
    refundGuaranteeTitle: "100% Refund Guarantee",
    refundGuaranteeText: "Fully refundable — if no plumber is available in your area within 24 hours, your deposit is automatically refunded. No questions asked. If a plumber completes the job, the deposit is deducted from your final bill.",
    depositTooltip: "This deposit secures your appointment and is deducted from your final invoice. It covers our AI matching service. The plumber bills you separately for the actual repair, minus this deposit.",
    confirmDeposit: "To confirm this estimate, deposit:",
    depositSuffix: "deposit",
    done: "Done",
    phonePlaceholder: "+1 (555) 555-5555",
    emailPlaceholder: "Email address *",
    emailValidation: "Enter a valid email address",
    cityPlaceholder: "City",
    statePlaceholder: "State",
    zipPlaceholder: "ZIP",
    countryUS: "United States",
    countryCA: "Canada",
    stopListening: "Stop listening",
    voiceInput: "Voice input",
    enhanceWithAI: "Enhance with AI",
    listening: "Listening... speak now",
    lowConfidence: "LOW CONFIDENCE",
    noAccurateEstimate: "We couldn't provide an accurate estimate",
    aiAnalysisPrefix: "Our AI analysis returned a",
    aiAnalysisSuffix: "confidence match — we require at least 90% to give you a reliable price. Please add clearer photos or contact us directly for a manual quote.",
    tryAgain: "Try Again with Better Photos",
    getHelpNow: "Get Help Now",
    bookUrgentAppointment: "Book Urgent Appointment",
    bookAppointment: "Book Appointment",
    emergencyStandby: "A plumber is standing by for emergencies",
    priorityScheduling: "Priority scheduling available",
    secureAppointment: "Secure your appointment",
    validFor: "Valid for",
    day: "day",
    days: "days",
    priceMayVary: "price may vary based on on-site inspection",
    repairsThisWeek: "repairs priced this week",
    avgRating: "avg rating",
    withReviews: "reviews",
    emergencyResponse: "Emergency Response",
    emergencyRateApplied: "Emergency rate applied · Priority dispatch",
    minRemaining: "min remaining",
    priorityService: "Priority Service",
    urgentScheduling: "48-hour scheduling · Urgent rate applies",
    availableNow: "Available now",
    matchingPlumber: "Matching you with a plumber...",
    finding: "Finding...",
    aiDiagnosis: "AI Diagnosis",
    aiConfidenceHigh: "AI Confidence: High",
    aiConfidence: "AI confidence",
    match: "match",
    severityEmergency: "Emergency",
    severityUrgent: "Urgent",
    severityStandard: "Standard",
    matchTo: "match to",
    similarRepairs: "similar repairs",
    viewMoreParts: "+ View",
    moreParts: "more parts",
    redirecting: "Redirecting...",
    paymentSuccessful: "Payment Successful!",
    depositReceived: "Your",
    depositReceivedMid: "deposit has been received. We're finding a licensed plumber in your area now.",
    whatHappensNext: "What happens next?",
    confirmationEmail: "You'll receive a confirmation email with your tracking link",
    matchPlumber: "We'll match you with the best plumber in your area",
    trackPlumber: "Track your plumber live:",
    depositRefundable: "The deposit is fully refundable if no plumber is available",
    needHelp: "Need help? Call",
    plumbingServices: "Plumbing Services",
    premiumPlumbingServices: "Premium Plumbing Services",
    paymentCancelled: "Payment was cancelled. Your estimate is still saved — you can try again.",
    voiceNotSupported: "Voice input not supported on this browser.",
    paymentSetupFailed: "Payment setup failed. Please try again.",
  },
};

interface I18nContextType {
  locale: Locale;
  translations: Translations;
  t: (key: string, params?: Record<string, string>) => string;
  changeLocale: (newLocale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>('en');
  const [translations, setTranslations] = useState<Translations>(defaultTranslations);

  // Detect locale from pathname
  useEffect(() => {
    const pathLocale = pathname.split('/')[1] as Locale;
    if (['en', 'fr', 'es', 'de'].includes(pathLocale)) {
      setLocale(pathLocale);
    }
  }, [pathname]);

  // Load non-English translations on demand
  useEffect(() => {
    if (locale === 'en') {
      setTranslations(defaultTranslations);
      return;
    }
    async function loadTranslations() {
      try {
        const response = await fetch(`/api/translations?locale=${locale}`);
        const data = await response.json();
        // Merge with defaults so missing keys fall back to English
        setTranslations({ ...defaultTranslations, ...data });
      } catch (error) {
        console.error('Failed to load translations:', error);
        setTranslations(defaultTranslations); // Fallback to English
      }
    }
    loadTranslations();
  }, [locale]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, translations, t, changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}