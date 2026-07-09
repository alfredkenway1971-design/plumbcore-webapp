/* ──────────────────────────────────────────────
   PlumbCore AI — Review Automation Database Layer
   ────────────────────────────────────────────── */

import { supabase } from '@/lib/supabase';
import { jobs, teamMembers, clients } from '@/lib/mock-data';
import type { ReviewRequestDb, TechReviewScoreDb } from '@/lib/supabase';

/* ── Mock / In-Memory Data ── */
export interface ReviewRequest {
  id: string;
  jobId: string;
  jobTitle: string;
  customerId: string;
  customerName: string;
  techId: string;
  techName: string;
  message: string;
  sentAt: string | null;
  status: 'pending' | 'sent' | 'clicked' | 'submitted';
  reviewLinkClicked: boolean;
  reviewSubmitted: boolean;
  rating: number | null;
  reviewText: string | null;
  createdAt: string;
}

export interface TechReviewScore {
  id: string;
  techId: string;
  techName: string;
  avgRating: number;
  totalReviews: number;
  responseRate: number;
}

let reviewRequests: ReviewRequest[] = [
  {
    id: 'REV-001',
    jobId: 'JOB-003',
    jobTitle: 'Pipe Replacement',
    customerId: 'CLT-003',
    customerName: 'Maria Wilson',
    techId: 'TECH-001',
    techName: 'James Wilson',
    message: 'Hi Maria! Thank you for choosing PlumbCore for your pipe replacement. We\'d love to hear about your experience!',
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'submitted',
    reviewLinkClicked: true,
    reviewSubmitted: true,
    rating: 5,
    reviewText: 'James was professional and fixed the issue quickly. Highly recommend!',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'REV-002',
    jobId: 'JOB-007',
    jobTitle: 'Water Main Repair',
    customerId: 'CLT-015',
    customerName: 'Sunset Retirement Home',
    techId: 'TECH-001',
    techName: 'James Wilson',
    message: 'Dear Sunset Team, thank you for trusting us with your emergency water main repair. Your feedback helps us improve!',
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'clicked',
    reviewLinkClicked: true,
    reviewSubmitted: false,
    rating: null,
    reviewText: null,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'REV-003',
    jobId: 'JOB-008',
    jobTitle: 'Gas Line Test',
    customerId: 'CLT-002',
    customerName: 'Robert Davis',
    techId: 'TECH-005',
    techName: 'Sarah Blake',
    message: 'Hi Robert! Thank you for your business. We\'d appreciate a quick review of your gas line testing experience.',
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'submitted',
    reviewLinkClicked: true,
    reviewSubmitted: true,
    rating: 4,
    reviewText: 'Sarah was thorough and explained everything clearly. Great service.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'REV-004',
    jobId: 'JOB-003',
    jobTitle: 'Pipe Replacement',
    customerId: 'CLT-003',
    customerName: 'Maria Wilson',
    techId: 'TECH-002',
    techName: 'Mike Torres',
    message: 'Hi Maria! We hope you\'re satisfied with the pipe replacement work Mike did. Share your experience!',
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'submitted',
    reviewLinkClicked: true,
    reviewSubmitted: true,
    rating: 4,
    reviewText: 'Mike was friendly and did good work. Would recommend.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/* ── Load from Supabase ── */
export async function loadReviewRequests(companyId?: string) {
  if (!companyId) return;

  const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('plumbcore-auth') : null;
  if (!storedAuth) return;

  try {
    const { data: dbRequests } = await supabase
      .from('review_requests')
      .select('*')
      .eq('company_id', companyId);

    if (dbRequests && dbRequests.length > 0) {
      reviewRequests.length = 0;
      dbRequests.forEach((r: ReviewRequestDb) => {
        const job = jobs.find(j => j.id === r.job_id);
        const tech = teamMembers.find(t => t.id === r.tech_id);
        const client = clients.find(c => c.id === r.customer_id);
        reviewRequests.push({
          id: r.id,
          jobId: r.job_id,
          jobTitle: job?.title || 'Unknown Job',
          customerId: r.customer_id,
          customerName: client?.name || 'Unknown Client',
          techId: r.tech_id,
          techName: tech?.name || 'Unknown Tech',
          message: r.message,
          sentAt: r.sent_at || null,
          status: r.status,
          reviewLinkClicked: r.review_link_clicked,
          reviewSubmitted: r.review_submitted,
          rating: r.rating || null,
          reviewText: r.review_text || null,
          createdAt: r.created_at,
        });
      });
    }
    console.log(`[Reviews] Loaded ${reviewRequests.length} review requests`);
  } catch (e) {
    console.warn('[Reviews] Using fallback review data:', e);
  }
}

/* ── Queries ── */

export function getReviewRequests(): ReviewRequest[] {
  return [...reviewRequests].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getReviewsThisMonth(): { count: number; avgRating: number; lastMonthCount: number; lastMonthRating: number } {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  const thisMonth = reviewRequests.filter(r => r.createdAt >= monthStart);
  const lastMonth = reviewRequests.filter(r => r.createdAt >= lastMonthStart && r.createdAt < monthStart);

  const submittedThis = thisMonth.filter(r => r.reviewSubmitted);
  const submittedLast = lastMonth.filter(r => r.reviewSubmitted);

  const avgRating = submittedThis.length > 0
    ? submittedThis.reduce((s, r) => s + (r.rating || 0), 0) / submittedThis.length
    : 0;

  const lastMonthAvg = submittedLast.length > 0
    ? submittedLast.reduce((s, r) => s + (r.rating || 0), 0) / submittedLast.length
    : 0;

  return {
    count: thisMonth.length,
    avgRating: Math.round(avgRating * 10) / 10,
    lastMonthCount: lastMonth.length,
    lastMonthRating: Math.round(lastMonthAvg * 10) / 10,
  };
}

export function getTechLeaderboard(): TechReviewScore[] {
  const techMap = new Map<string, { total: number; submitted: number; ratingSum: number; responses: number }>();

  teamMembers.forEach(t => {
    techMap.set(t.id, { total: 0, submitted: 0, ratingSum: 0, responses: 0 });
  });

  reviewRequests.forEach(r => {
    const entry = techMap.get(r.techId);
    if (!entry) return;
    entry.total++;
    if (r.reviewSubmitted) {
      entry.submitted++;
      if (r.rating) entry.ratingSum += r.rating;
    }
    if (r.reviewLinkClicked || r.reviewSubmitted) {
      entry.responses++;
    }
  });

  return Array.from(techMap.entries())
    .map(([techId, data]) => {
      const tech = teamMembers.find(t => t.id === techId);
      return {
        id: techId,
        techId,
        techName: tech?.name || 'Unknown Tech',
        avgRating: data.submitted > 0 ? Math.round((data.ratingSum / data.submitted) * 10) / 10 : 0,
        totalReviews: data.submitted,
        responseRate: data.total > 0 ? Math.round((data.responses / data.total) * 100) : 0,
      };
    })
    .sort((a, b) => b.avgRating - a.avgRating || b.totalReviews - a.totalReviews);
}

export function getCompletedJobsWithoutReview(): { id: string; title: string; clientName: string; techId: string; techName: string; completedDate: string }[] {
  const reviewedJobIds = new Set(reviewRequests.map(r => r.jobId));

  return jobs
    .filter(j => j.status === 'completed' && !reviewedJobIds.has(j.id))
    .map(j => {
      const techId = j.assignedTo[0] || '';
      const tech = teamMembers.find(t => t.id === techId);
      return {
        id: j.id,
        title: j.title,
        clientName: j.clientName,
        techId,
        techName: tech?.name || 'Unknown Tech',
        completedDate: j.completedDate || j.createdAt,
      };
    });
}

/* ── Mutations ── */

export async function createReviewRequest(
  jobId: string,
  clientId: string,
  techId: string,
  message: string,
  companyId?: string
): Promise<ReviewRequest> {
  const job = jobs.find(j => j.id === jobId);
  const tech = teamMembers.find(t => t.id === techId);
  const client = clients.find(c => c.id === clientId);

  const newRequest: ReviewRequest = {
    id: `REV-${String(reviewRequests.length + 1).padStart(3, '0')}`,
    jobId,
    jobTitle: job?.title || 'Unknown Job',
    customerId: clientId,
    customerName: client?.name || 'Unknown Client',
    techId,
    techName: tech?.name || 'Unknown Tech',
    message,
    sentAt: new Date().toISOString(),
    status: 'sent',
    reviewLinkClicked: false,
    reviewSubmitted: false,
    rating: null,
    reviewText: null,
    createdAt: new Date().toISOString(),
  };

  reviewRequests.unshift(newRequest);

  // Try to persist to Supabase
  if (companyId) {
    try {
      await supabase.from('review_requests').insert({
        company_id: companyId,
        job_id: jobId,
        customer_id: clientId,
        tech_id: techId,
        message,
        sent_at: newRequest.sentAt,
        status: 'sent',
        review_link_clicked: false,
        review_submitted: false,
      });
    } catch (e) {
      console.warn('[Reviews] Could not persist to Supabase:', e);
    }
  }

  return newRequest;
}

export function generateReviewMessage(jobTitle: string, customerName: string, techName: string): string {
  const templates = [
    `Hi ${customerName}! Thank you for choosing PlumbCore for your ${jobTitle.toLowerCase()}. We'd love to hear about your experience with ${techName}!`,
    `Dear ${customerName}, we hope you're enjoying your ${jobTitle.toLowerCase()} service from ${techName}. Your feedback helps us serve you better!`,
    `Hi ${customerName}! ${techName} enjoyed working on your ${jobTitle.toLowerCase()}. Could you take a moment to share your experience?`,
    `Thank you ${customerName} for trusting PlumbCore with your ${jobTitle.toLowerCase()}. We'd appreciate a quick review of ${techName}'s work!`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

export function invalidateReviewsCache() {
  // For future cache invalidation
}
