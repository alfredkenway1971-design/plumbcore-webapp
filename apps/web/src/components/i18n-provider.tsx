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
    // ─── Nav ───
    navFeatures: "Features",
    navPricing: "Pricing",
    navCompare: "Compare",
    navTestimonials: "Testimonials",
    navSignIn: "Sign In",
    navMenu: "Menu",
    startFreeTrial: "Start Free Trial",
    heroBadge: "Built for the trade",
    heroLine1: "Stop Chasing",
    heroLineHighlight: "Dead-Broke",
    heroLine2: "Leads.",
    heroSub: "PlumbCore pre-qualifies every homeowner with a refundable deposit before you ever roll a truck. No more no-shows. No more tire-kickers.",
    heroCta: "Start Free Trial",
    heroDemo: "Watch 90-Sec Demo",
    heroShops: "1,240+",
    heroShopsLabel: "plumbing shops running on PlumbCore",
    trustLabel: "As trusted by shops in",
    trustRegion1: "TEXAS",
    trustRegion2: "OHIO",
    trustRegion3: "FLORIDA",
    howBadge: "How It Works",
    howTitle: "How PlumbCore Makes You Money",
    step1Title: "Upload your photo",
    step1Desc: "Customer snaps a photo of the leak, clog, or install. Our AI reads it in seconds.",
    step2Title: "Deposit locks the job",
    step2Desc: "Customer pays a refundable deposit sized to the estimated job — before you dispatch anyone.",
    step3Title: "You show up to real work",
    step3Desc: "Average deposit runs $49–$199. Real budget, real intent, zero wasted trips.",
    statAmount: "$3,000+",
    statLabel: "Average Monthly Savings Per Shop",
    compBadge: "The Old Way vs. PlumbCore",
    compTitle: "Every Wasted Trip Is Money Down The Drain",
    compMetric: "Metric",
    compOldHeader: "Old Way",
    compNewHeader: "PlumbCore",
    compMonthlyCost: "Monthly cost",
    compOldCost: "$399+",
    compNewCost: "$349",
    compLeadsIncluded: "Leads included",
    compOldLeads: "Pay per lead",
    compNewLeads: "Up to 10/mo",
    compDeposit: "Customer deposit",
    compOldDeposit: "None",
    compNewDeposit: "$49–$199",
    compSetup: "Setup time",
    compOldSetup: "Weeks",
    compNewSetup: "1 day",
    pricingBadge: "Subscription Tiers",
    pricingTitle: "One Flat Price. Zero Surprise Fees.",
    pricingBadgeFeatured: "Most Shops Pick This",
    planSolo: "Solo",
    planPro: "Pro",
    planBusiness: "Business",
    planEnterprise: "Enterprise",
    planScarcity: "Founding pricing — 6 slots left this month",
    planSoloFeature1: "1 technician",
    planSoloFeature2: "Unlimited AI photo estimates",
    planSoloFeature3: "15 hrs AI receptionist",
    planSoloFeature4: "Up to 10 leads/mo",
    planSoloFeature5: "Standard queue priority",
    planProFeature1: "2–10 technicians",
    planProFeature2: "Unlimited AI photo estimates",
    planProFeature3: "60 hrs AI receptionist",
    planProFeature4: "Up to 25 leads/mo",
    planProFeature5: "Priority queue (+15 score boost)",
    planBusFeature1: "11–25 technicians",
    planBusFeature2: "Unlimited AI photo estimates",
    planBusFeature3: "150 hrs AI receptionist",
    planBusFeature4: "Unlimited leads",
    planBusFeature5: "First dibs on $2K+ jobs (+30 score boost)",
    planEntFeature1: "25+ technicians",
    planEntFeature2: "Unlimited AI photo estimates",
    planEntFeature3: "Unlimited AI receptionist",
    planEntFeature4: "Unlimited leads + dedicated territory",
    planEntFeature5: "Exclusive zone rights",
    depositBadge: "Customer Deposit Tiers",
    depositTitle: "Every Deposit Goes Toward The Final Bill",
    depositSub: "Deposits are credited to the plumber's invoice and deducted from the final bill — homeowners aren't paying extra, they're locking in the job.",
    depositColJobValue: "Est. Job Value",
    depositColDeposit: "Deposit",
    depositColYouKeep: "You Keep",
    depositUnder1000: "Under $1,000",
    deposit1000to1499: "$1,000 – $1,499",
    deposit1500to1999: "$1,500 – $1,999",
    deposit2000plus: "$2,000+",
    priorityBadge: "How Lead Priority Works",
    priorityTitle: "Higher Tier, First Notified",
    prioritySub: "Bigger jobs go to the shops that invested in priority — smaller jobs stay open to everyone.",
    priorityColJobValue: "Job Value",
    priorityColWhoGets: "Notified First",
    priorityUnder500: "Under $500",
    priorityUnder500Desc: "Everyone — highest score wins",
    priority500to1999: "$500 – $1,999",
    priority500to1999Desc: "Pro & Business first, Solo after 15 min",
    priority2000plus: "$2,000+",
    priority2000plusDesc: "Business (10 min) → Pro (10 min) → Solo (20 min)",
    scoreTitle: "Score Formula",
    scoreDistance: "Distance",
    scoreAvailability: "Availability",
    scoreTier: "Plan tier bonus",
    scoreTierVal: "Solo +0 / Pro +15 / Business +30",
    scoreRating: "Rating",
    scoreResponse: "Response speed",
    testiBadge: "Real Shops, Real Numbers",
    testiTitle: "What Owners Are Saying",
    testi1Name: "Jake M.",
    testi1Role: "Owner, 4-truck shop — Dallas, TX",
    testi1Quote: "Cut our no-show rate to almost nothing. The deposit alone paid for the software in week one.",
    testi2Name: "Sarah R.",
    testi2Role: "Dispatcher — Columbus, OH",
    testi2Quote: "Techs stopped wasting mornings on quotes that go nowhere. Booked jobs only now.",
    faqBadge: "Questions",
    faqTitle: "Before You Get Started",
    faqDepositQ: "How do deposits work?",
    faqDepositA: "AI estimates the job from the photo and description, then sets a refundable deposit sized to that range.",
    faqCancelQ: "Can I cancel any time?",
    faqCancelA: "Yes — no contracts, no lock-in. Cancel from your dashboard in two clicks.",
    faqHardwareQ: "Do I need new hardware?",
    faqHardwareA: "No. PlumbCore runs on the phone your techs already carry.",
    estimateBadge: "Homeowners — Get a Free Estimate",
    estimateTitle: "Snap a Photo, Get a Price in Seconds",
    estimateSub: "No need to call or wait. Upload a photo of the issue and our AI gives you an instant price. No callbacks, no waiting.",
    estimateCta: "Get a Free Estimate",
    ctaBadge: "Limited Founding Slots",
    ctaTitle: "Get Your First Pre-Paid Lead This Week",
    ctaButton: "Start Free Trial",
    ctaSub: "30-day money-back guarantee",
    footerText: "© 2026 PlumbCore AI. Built for plumbers, by people who hate cold trucks.",
    pricingPerMonth: "/mo",
    contactUs: "Contact Us",
    // ─── Dashboard translations ───
    dashboardSet: "Set",
    dashboardEdit: "Edit",
    dashboardThisMonth: "This Month",
    dashboardCustomer: "Customer",
    dashboardAddress: "Address",
    dashboardStatus: "Status",
    dashboardActions: "Actions",
    dashboardViewAll: "View All",
    dashboardToday: "today",
    dashboardStartFreeTrial: "Start Your Free Trial!",
    dashboardUnlockFeatures: "Unlock AI photo estimates, voice receptionist, and advanced analytics.",
    dashboardViewPlans: "View Plans",
    dashboardCustomPricing: "Custom pricing",
    dashboardBilling: "Billing",
    dashboardManagePlan: "Manage Plan",
    dashboardAlerts: "Alerts",
    dashboardQuickActions: "Quick Actions",
    dashboardUpgrade: "Upgrade",
    dashboardManageBilling: "Manage Billing",
    dashboardUpcomingJobs: "Upcoming Jobs",
    dashboardTechStatus: "Tech Status",
    dashboardNoJobs: "No upcoming jobs",
    dashboardNoTechs: "No techs online",
    dashboardLoading: "Loading...",
    dashboardNoData: "No data available",
    // ─── Profile translations ───
    profileTitle: "Profile",
    profileOverview: "Overview",
    profileFinancial: "Financial",
    profilePerformance: "Performance",
    profileCompliance: "Compliance",
    profileReceptionist: "Receptionist",
    profileServiceArea: "Service Area",
    profileSpecialties: "Specialties",
    profileJobsCompleted: "Jobs Completed",
    profileRating: "Rating",
    profileResponseTime: "Response Time",
    profileAcceptance: "Acceptance",
    profilePlanPricing: "Plan & Pricing",
    profilePlanTier: "Plan Tier",
    profileLeadFee: "Lead Fee (per job)",
    profileMonthlyLeadLimit: "Monthly Lead Limit",
    profileCurrentMonthLeads: "Current Month Leads",
    profilePayoutSchedule: "Payout Schedule",
    profilePayoutThreshold: "Payout Threshold",
    profileBankAccount: "Bank Account (Stripe Connect)",
    profileConnected: "Connected",
    profileLinkBank: "Link Bank Account",
    profileThisMonthLeadRevenue: "This Month Lead Revenue",
    profileProcessingFee: "PlumbCore Processing Fee",
    profileSave: "Save",
    profileSaving: "Saving...",
    profileFailedToLoad: "Failed to load",
    profileNoProfile: "No profile found",
    profileCreateFirst: "Create a profile first",
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
    urgencyLabel: "How urgent is this?",
    routineSub: "Schedule a visit — next 3-7 days",
    urgentSub: "Within 24 hours — priority rate applies",
    emergencySub: "Immediate response — emergency rate applies",
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
    aiAnalysisSuffix: "confidence match — we require at least 80% to give you a reliable price. Please add clearer photos or contact us directly for a manual quote.",
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

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
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
        // Deep merge so missing keys fall back to English defaults
        setTranslations(deepMerge(defaultTranslations, data));
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