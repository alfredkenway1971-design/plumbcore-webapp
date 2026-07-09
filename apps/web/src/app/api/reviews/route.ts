import { NextRequest, NextResponse } from 'next/server';

/* ── In-memory fallback data for API routes (server-side) ── */

const REVIEW_REQUESTS = [
  {
    id: 'REV-001', jobId: 'JOB-003', jobTitle: 'Pipe Replacement',
    customerName: 'Maria Wilson', techName: 'James Wilson',
    message: 'Hi Maria! Thank you for choosing PlumbCore for your pipe replacement.',
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'submitted', reviewLinkClicked: true, reviewSubmitted: true,
    rating: 5, reviewText: 'James was professional and fixed the issue quickly.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'REV-002', jobId: 'JOB-007', jobTitle: 'Water Main Repair',
    customerName: 'Sunset Retirement Home', techName: 'James Wilson',
    message: 'Dear Sunset Team, thank you for trusting us with your emergency water main repair.',
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'clicked', reviewLinkClicked: true, reviewSubmitted: false,
    rating: null, reviewText: null,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'REV-003', jobId: 'JOB-008', jobTitle: 'Gas Line Test',
    customerName: 'Robert Davis', techName: 'Sarah Blake',
    message: 'Hi Robert! Thank you for your business. We\'d appreciate a quick review.',
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'submitted', reviewLinkClicked: true, reviewSubmitted: true,
    rating: 4, reviewText: 'Sarah was thorough and explained everything clearly.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'REV-004', jobId: 'JOB-003', jobTitle: 'Pipe Replacement',
    customerName: 'Maria Wilson', techName: 'Mike Torres',
    message: 'Hi Maria! We hope you\'re satisfied with the pipe replacement work Mike did.',
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'submitted', reviewLinkClicked: true, reviewSubmitted: true,
    rating: 4, reviewText: 'Mike was friendly and did good work.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const TEAM_MEMBERS = [
  { id: 'TECH-001', name: 'James Wilson', rating: 4.9 },
  { id: 'TECH-002', name: 'Mike Torres', rating: 4.8 },
  { id: 'TECH-005', name: 'Sarah Blake', rating: 4.9 },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';

    switch (type) {
      case 'stats': {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

        const thisMonth = REVIEW_REQUESTS.filter(r => r.createdAt >= monthStart);
        const lastMonth = REVIEW_REQUESTS.filter(r => r.createdAt >= lastMonthStart && r.createdAt < monthStart);

        const submittedThis = thisMonth.filter(r => r.reviewSubmitted);
        const submittedLast = lastMonth.filter(r => r.reviewSubmitted);

        const avgRating = submittedThis.length > 0
          ? submittedThis.reduce((s, r) => s + (r.rating || 0), 0) / submittedThis.length
          : 0;
        const lastMonthAvg = submittedLast.length > 0
          ? submittedLast.reduce((s, r) => s + (r.rating || 0), 0) / submittedLast.length
          : 0;

        return NextResponse.json({
          count: thisMonth.length,
          avgRating: Math.round(avgRating * 10) / 10,
          lastMonthCount: lastMonth.length,
          lastMonthRating: Math.round(lastMonthAvg * 10) / 10,
        });
      }

      case 'leaderboard': {
        const techMap = new Map<string, { total: number; submitted: number; ratingSum: number; responses: number }>();
        TEAM_MEMBERS.forEach(t => techMap.set(t.id, { total: 0, submitted: 0, ratingSum: 0, responses: 0 }));
        REVIEW_REQUESTS.forEach(r => {
          const tech = TEAM_MEMBERS.find(t => r.techName === t.name);
          if (!tech) return;
          const entry = techMap.get(tech.id);
          if (!entry) return;
          entry.total++;
          if (r.reviewSubmitted) {
            entry.submitted++;
            if (r.rating) entry.ratingSum += r.rating;
          }
          if (r.reviewLinkClicked || r.reviewSubmitted) entry.responses++;
        });

        const leaderboard = Array.from(techMap.entries()).map(([techId, data]) => {
          const tech = TEAM_MEMBERS.find(t => t.id === techId);
          return {
            id: techId,
            techId,
            techName: tech?.name || 'Unknown',
            avgRating: data.submitted > 0 ? Math.round((data.ratingSum / data.submitted) * 10) / 10 : 0,
            totalReviews: data.submitted,
            responseRate: data.total > 0 ? Math.round((data.responses / data.total) * 100) : 0,
          };
        }).sort((a, b) => b.avgRating - a.avgRating || b.totalReviews - a.totalReviews);

        return NextResponse.json(leaderboard);
      }

      case 'pending-jobs': {
        const reviewedJobIds = new Set(REVIEW_REQUESTS.map(r => r.jobId));
        // Return mock completed jobs not yet reviewed
        const pending = [
          { id: 'JOB-003', title: 'Pipe Replacement', clientName: 'Maria Wilson', techName: 'James Wilson', completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'JOB-007', title: 'Water Main Repair', clientName: 'Sunset Retirement Home', techName: 'James Wilson', completedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'JOB-008', title: 'Gas Line Test', clientName: 'Robert Davis', techName: 'Sarah Blake', completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        ].filter(j => !reviewedJobIds.has(j.id));
        return NextResponse.json(pending);
      }

      default: {
        const sorted = [...REVIEW_REQUESTS].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return NextResponse.json(sorted);
      }
    }
  } catch (error: any) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews data' },
      { status: 500 }
    );
  }
}
