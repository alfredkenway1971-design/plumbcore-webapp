/**
 * POST /api/social-media/approve
 * Handles approval/rejection callbacks from email links
 */
import { NextResponse } from 'next/server';
import { generateContent, generateImageUrl, socialMediaRouter } from '@/lib/social-media';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

// Simple in-memory store for pending approvals
// { token: { text, platforms, pageId, imageUrl } }
const pendingApprovals = new Map<string, any>();

// Export for use by the publish API
export function storePending(token: string, data: any) {
  pendingApprovals.set(token, data);
  // Auto-expire after 1 hour
  setTimeout(() => pendingApprovals.delete(token), 60 * 60 * 1000);
}

export function getPending(token: string) {
  return pendingApprovals.get(token);
}

export function removePending(token: string) {
  pendingApprovals.delete(token);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const action = url.searchParams.get('action');

  if (!token || !action) {
    return new Response('Missing token or action', { status: 400, headers: CORS });
  }

  const pending = getPending(token);
  if (!pending) {
    return new Response(htmlPage(
      'Expired or Invalid',
      'This approval link has expired or is invalid. Please create a new post and try again.',
      '#dc2626'
    ), { status: 200, headers: { ...CORS, 'Content-Type': 'text/html' } });
  }

  if (action === 'approve') {
    // Publish the content
    try {
      const results = await socialMediaRouter({
        text: pending.text,
        imageUrl: pending.imageUrl,
        platforms: pending.platforms,
        pageId: pending.pageId,
      });

      removePending(token);

      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;

      return new Response(htmlPage(
        '✅ Published!',
        `Your post was published to ${successCount}/${totalCount} platforms successfully.`,
        '#059669',
        results
      ), { status: 200, headers: { ...CORS, 'Content-Type': 'text/html' } });
    } catch (err: any) {
      return new Response(htmlPage(
        '❌ Publish Failed',
        err.message || 'Something went wrong while publishing.',
        '#dc2626'
      ), { status: 200, headers: { ...CORS, 'Content-Type': 'text/html' } });
    }
  }

  if (action === 'decline') {
    removePending(token);
    return new Response(htmlPage(
      'Declined',
      'The post was declined and will not be published. You can create a new post from the dashboard.',
      '#d97706'
    ), { status: 200, headers: { ...CORS, 'Content-Type': 'text/html' } });
  }

  return new Response('Invalid action', { status: 400, headers: CORS });
}

function htmlPage(title: string, message: string, color: string, results?: any[]) {
  const resultHtml = results ? results.map(r => `
    <div style="margin-top:8px;padding:8px 12px;border-radius:6px;font-size:14px;
      background:${r.success ? '#ecfdf5' : '#fef2f2'};color:${r.success ? '#059669' : '#dc2626'}">
      <strong style="text-transform:capitalize">${r.platform}</strong>:
      ${r.success ? '✅ Published' : '❌ ' + r.error}
    </div>
  `).join('') : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Factory</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f4f6f9;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px}
.card{background:#fff;border-radius:12px;padding:32px;max-width:480px;width:100%;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,0.06)}
.icon{font-size:48px;margin-bottom:12px}
h1{font-size:20px;font-weight:700;color:#0c1222;margin:0 0 8px}
p{font-size:14px;color:#475569;line-height:1.6;margin:0}
.results{margin-top:16px}
.btn{display:inline-block;margin-top:20px;padding:10px 24px;border-radius:8px;background:#059669;color:#fff;text-decoration:none;font-size:14px;font-weight:600}
</style>
</head>
<body>
<div class="card">
  <div class="icon">${results ? '✅' : title.includes('Declined') ? '✋' : '❌'}</div>
  <h1 style="color:${color}">${title}</h1>
  <p>${message}</p>
  <div class="results">${resultHtml}</div>
  <a href="https://social-media-factory-pi.vercel.app" class="btn">Open Factory</a>
</div>
</body>
</html>`;
}

export const config = {
  runtime: 'nodejs',
};
