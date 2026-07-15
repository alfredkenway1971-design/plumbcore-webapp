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
    navBilling: "Billing",
    navTestimonials: "Testimonials",
    navSignIn: "Sign In",
    navRequestDemo: "Try It Free →",
    navGetStarted: "Get Started Free",
    navMenu: "Menu",
    startFreeTrial: "Start Free Trial",
    // ─── Hero ───
    heroTrustedBadge: "Trusted by 500+ plumbing businesses",
    heroHeadline1: "The Plumbing OS That",
    heroHeadlineHighlight: "Early Adopters",
    heroHeadline2: " Already Trust",
    heroSubheadline: "Stop paying per lead. Get pre-paid customers who already verified their job photos, paid a deposit, and are ready to book — all included in your monthly subscription.",
    heroJoinPlumbers: "Join <strong>500+</strong> plumbers",
    heroJobsCompleted: "<strong>12,000+</strong> jobs completed",
    heroAvgRating: "<strong>4.8★</strong> average rating",
    heroGetEstimate: "Get a Free Estimate",
    heroSeeHow: "See How It Works",
    heroForBusinesses: "For plumbing businesses",
    heroGetLead: "Get Your First Pre-Paid Lead This Week",
    heroImgAlt: "Plumber working on sink installation",
    heroAIAnalyzing: "AI Analyzing...",
    heroAppImgAlt: "PlumbCore AI app interface preview",
    heroHowItWorksCaption: "Tap. Snap. Get paid. — See how it works",
    // ─── How It Works / How PlumbCore Makes You Money ───
    howBadge: "How You Win",
    howTitle: "How PlumbCore Makes You Money",
    howSubtitle: "While HomeAdvisor charges you <strong>$75 per lead</strong>, PlumbCore gives you unlimited pre-paid leads for <strong>$349/month</strong>. The math is simple.",
    howStep1Title: "Customer Uploads Photo",
    howStep1Desc: "Customer snaps a photo of the issue through our AI-powered intake. No phone tag, no truck roll to quote.",
    howStep2Title: "Customer Pays $49 Deposit",
    howStep2Desc: "The customer pays a refundable $49–$199 deposit upfront. This filters looky-loos and confirms they're serious.",
    howStep3Title: "You Get Pre-Paid Lead",
    howStep3Desc: "You receive the verified lead with photo, deposit credited to your invoice, and AI estimate. Show up and get paid.",
    roiText: "<strong>Average plumber:</strong> 8 jobs/month × $400 = <strong>$3,200 revenue</strong>. Your cost: <strong>$349</strong>.",
    roiLabel: "That's a 9:1 ROI",
    comparisonVS: "PlumbCore vs. The Old Way",
    compFeatureHeader: "Feature",
    compPlumbcoreHeader: "PlumbCore",
    compHomeadvisorHeader: "HomeAdvisor",
    compServicetitanHeader: "ServiceTitan",
    compMonthlyCost: "Monthly Cost",
    compPlumbcore349: "$349",
    compHomeadvisor75: "$75/lead",
    compServicetitan398: "$398+",
    compLeadsIncluded: "Leads Included",
    compUnlimited: "Unlimited",
    compPayPerLead: "Pay per lead",
    compNone: "None",
    compCustomerPrePays: "Customer Pre-Pays",
    compYes: "✓ Yes",
    compNo: "✗ No",
    compDepositIsYours: "Deposit Is Yours",
    compCredited: "✓ Credited",
    compKeptByThem: "✗ Kept by them",
    compAIEstimates: "AI Estimates",
    compIncluded: "✓ Included",
    comp200Addon: "$200 add-on",
    // ─── Features ───
    featuresBadge: "Features",
    featuresTitle: "Everything You Need to Grow",
    featuresSubtitle: "Each feature is built to put more money in your pocket. Not buzzwords — outcomes.",
    featureCloseRateTitle: "Close 43% More Jobs",
    featureCloseRateDesc: "AI Photo Estimates — customers snap a photo, get an instant AI estimate. Speed wins trust and closes deals faster than waiting for a manual quote.",
    featureNeverMissTitle: "Never Miss a $400 Call",
    featureNeverMissDesc: "AI Receptionist — answers every call 24/7, books appointments, and qualifies leads. No more missed calls that turn into lost revenue.",
    featureFitExtraTitle: "Fit 2 Extra Jobs Per Day",
    featureFitExtraDesc: "Route Optimization — AI plans the most efficient routes between calls, cutting drive time and letting you fit more revenue into every day.",
    featureSaveHoursTitle: "Save 18 Hours Per Week",
    featureSaveHoursDesc: "Voice-to-Invoice — dictate job notes on-site and AI generates an invoice instantly. No back-office data entry, no end-of-day paperwork.",
    featureZeroPartsTitle: "Zero \"Left the Part at the Shop\"",
    featureZeroPartsDesc: "Inventory Tracking — know exactly what's on each truck and in the warehouse. AI predicts what parts you'll need before every job.",
    featureStopOverbookTitle: "Stop Overbooking. Start Earning.",
    featureStopOverbookDesc: "Smart Scheduling — auto-balances your calendar based on job duration, drive time, and skill match. Maximize every hour of daylight.",
    featureImgEstimateAlt: "AI Photo Estimate preview",
    featureImgRouteAlt: "Route Optimization preview",
    // ─── Pricing ───
    pricingBadge: "Pricing",
    pricingTitle: "One Flat Price. Unlimited Pre-Paid Leads.",
    pricingSubtitle: "No surprise fees. No per-lead charges. Every plan includes deposits from customers that are credited to your invoice.",
    pricingMostPopular: "Most Popular",
    pricingPerMonth: "/mo",
    pricingLeadsLabel: "leads",
    pricingAILabel: "AI",
    planSolo: "Solo",
    planPro: "Pro",
    planBusiness: "Business",
    planEnterprise: "Enterprise",
    planSoloTechs: "1 tech",
    planProTechs: "2–10 techs",
    planBusinessTechs: "11–25 techs",
    planEnterpriseTechs: "25+ techs",
    planSoloLeads: "10/mo",
    planProLeads: "Unlimited",
    planBusinessLeads: "Unlimited",
    planEnterpriseLeads: "Unlimited",
    planSoloAI: "15 hrs",
    planProAI: "60 hrs",
    planBusinessAI: "150 hrs",
    planEnterpriseAI: "Unlimited",
    planSoloFeature1: "Unlimited AI estimates",
    planSoloFeature2: "Scheduling & invoicing",
    planSoloFeature3: "Lead intake with deposits",
    planSoloFeature4: "Email support",
    planProFeature1: "Everything in Solo",
    planProFeature2: "Route optimization",
    planProFeature3: "Inventory tracking",
    planProFeature4: "Maintenance plans",
    planProFeature5: "Review automation",
    planProFeature6: "AI receptionist",
    planBusinessFeature1: "Everything in Pro",
    planBusinessFeature2: "Customer financing",
    planBusinessFeature3: "Truck GPS + alerts",
    planBusinessFeature4: "Priority support",
    planEnterpriseFeature1: "Everything in Business",
    planEnterpriseFeature2: "Predictive maintenance",
    planEnterpriseFeature3: "White-label portal",
    planEnterpriseFeature4: "Dedicated manager",
    planEnterpriseFeature5: "Custom integrations",
    contactUs: "Contact Us",
    startFreeTrialArrow: "Start Free Trial →",
    startFreeTrialNoCard: "Start Free Trial — No Card Needed",
    redirecting: "Redirecting...",
    depositNote: "Every lead comes with a customer deposit ($49–$199) credited to your invoice.",
    guaranteeTitle: "30-Day Money-Back Guarantee",
    guaranteeText: "If you don't get at least 2 qualified leads in your first 30 days, we'll refund your first month. No questions asked.",
    freeTrialSub: "14-day free trial · Full access · Cancel in one click",
    // ─── Competition ───
    compHeadline: "The Gap Between Growing Shops and Struggling Ones Is One Decision",
    compSubheadline: "Your competitors are already using AI to book more jobs, work fewer hours, and earn more. The question isn't if you should — it's how long you can afford to wait.",
    compLeadVolume: "Lead Volume",
    compHoursSaved: "Saved / Week",
    compCloseRate: "Close Rate Increase",
    // ─── Testimonials ───
    testimonialsBadge: "Testimonials",
    testimonialTitle: "Real Plumbers. Real Results.",
    testimonialAggregate1: "<strong>500+</strong> plumbers",
    testimonialAggregate2: "<strong>12,000+</strong> jobs",
    testimonialAggregate3: "<strong>$4.8M</strong> in customer deposits processed",
    testimonial1Name: "Mike Torres",
    testimonial1Company: "Owner, Torres Plumbing",
    testimonial1Text: "PlumbCore AI cut our estimate time from 30 minutes to 10 seconds. Our close rate went up 40% in the first month.",
    testimonial2Name: "Sarah Chen",
    testimonial2Company: "Operations Manager, Fast Flow Inc.",
    testimonial2Text: "The voice-to-invoice feature alone saves my techs 2 hours a day. Best investment we've made.",
    testimonial3Name: "Robert Davis",
    testimonial3Company: "CEO, Davis Plumbing Co.",
    testimonial3Text: "We doubled our service area with route optimization. AI scheduling is a game-changer for multi-tech shops.",
    // ─── FAQ ───
    faqBadge: "FAQ",
    faqTitle: "Questions? We've Got Answers.",
    faqDepositQ: "How do deposits work?",
    faqDepositA: "When a customer submits a job through PlumbCore, they pay a refundable deposit ($49–$199 depending on job scope). This deposit is credited directly to your invoice when you complete the job. If the customer cancels, the deposit is refunded to them. You never have to chase payments — the money is already collected.",
    faqLeadCostQ: "Do I pay extra for leads?",
    faqLeadCostA: "No. Unlike HomeAdvisor or Angi, PlumbCore does not charge per lead. Every lead generated through our platform is included in your monthly subscription. Whether you get 5 or 50 leads in a month, the price stays the same. The deposit from the customer is separate and goes toward your invoice.",
    faqProPriorityQ: "What if a Pro plumber is near my lead?",
    faqProPriorityA: "We use geo-matching to assign leads to the nearest qualified pro. If another PlumbCore plumber is closer to a lead than you are, they get priority. This ensures customers get the fastest service possible and you only get leads that make sense for your service area. You can set your coverage radius in settings.",
    faqNoLeadsQ: "What if I don't get leads?",
    faqNoLeadsA: "We guarantee you'll receive at least 2 qualified leads in your first 30 days. If you don't, we'll refund your first month — no questions asked. After that, lead volume grows with your reputation and rating on the platform. Top-rated plumbers in high-demand areas typically receive 15–25+ leads per week.",
    faqUpgradeQ: "Can I upgrade mid-month?",
    faqUpgradeA: "Absolutely. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately with a prorated charge for the remainder of the month. Downgrades take effect at the next billing cycle. There are no long-term contracts — you can cancel anytime.",
    // ─── CTA ───
    ctaTitle: "Get Your First Pre-Paid Lead This Week",
    ctaScarcity: "Only 50 spots per city. <strong>12 left in Austin.</strong>",
    ctaButton: "Start Free Trial — No Card Needed",
    ctaSubtext: "14-day free trial · Full access · Cancel in one click",
    // ─── Footer ───
    footerTagline: "The plumbing OS built by plumbers. Zero regrets.",
    footerQuickLinks: "Quick Links",
    footerPlans: "Plans",
    footerContact: "Contact",
    footerGetStarted: "Get Started",
    footerPlanSolo: "Solo — $349/mo",
    footerPlanPro: "Pro — $799/mo",
    footerPlanBusiness: "Business — $1,499/mo",
    footerPlanEnterprise: "Enterprise — Contact Us",
    footerAddress: "123 Main St, Austin, TX",
    footerRights: "© 2026 PlumbCore AI. All rights reserved.",
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