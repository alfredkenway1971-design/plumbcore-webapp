import { NextRequest, NextResponse } from 'next/server';

/* ── In-memory store for server-side review requests ── */
let serverReviewRequests: any[] = [
  {
    id: 'REV-001', jobId: 'JOB-003', jobTitle: 'Pipe Replacement',
    customerName: 'Maria Wilson', techName: 'James Wilson',
    message: 'Hi Maria! Thank you for choosing PlumbCore for your pipe replacement.',
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'submitted', reviewLinkClicked: true, reviewSubmitted: true,
    rating: 5, reviewText: 'James was professional.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MESSAGE_TEMPLATES = [
  (name: string, job: string, tech: string) =>
    `Hi ${name}! Thank you for choosing PlumbCore for your ${job.toLowerCase()}. We'd love to hear about your experience with ${tech}!`,
  (name: string, job: string, tech: string) =>
    `Dear ${name}, we hope you're enjoying your ${job.toLowerCase()} service from ${tech}. Your feedback helps us serve you better!`,
  (name: string, job: string, tech: string) =>
    `Hi ${name}! ${tech} enjoyed working on your ${job.toLowerCase()}. Could you take a moment to share your experience?`,
  (name: string, job: string, tech: string) =>
    `Thank you ${name} for trusting PlumbCore with your ${job.toLowerCase()}. We'd appreciate a quick review of ${tech}'s work!`,
];

function generateMessage(jobTitle: string, customerName: string, techName: string): string {
  const template = MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)];
  return template(customerName, jobTitle, techName);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, jobTitle, customerName, techName } = body;

    if (!jobId || !customerName || !techName) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, customerName, techName' },
        { status: 400 }
      );
    }

    const message = generateMessage(jobTitle || 'service', customerName, techName);

    const newRequest = {
      id: `REV-${String(serverReviewRequests.length + 1).padStart(3, '0')}`,
      jobId,
      jobTitle: jobTitle || 'Service',
      customerName,
      techName,
      message,
      sentAt: new Date().toISOString(),
      status: 'sent',
      reviewLinkClicked: false,
      reviewSubmitted: false,
      rating: null,
      reviewText: null,
      createdAt: new Date().toISOString(),
    };

    serverReviewRequests.unshift(newRequest);

    return NextResponse.json({
      success: true,
      review: newRequest,
    });
  } catch (error: any) {
    console.error('Review send API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send review request' },
      { status: 500 }
    );
  }
}
