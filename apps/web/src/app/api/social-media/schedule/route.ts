/**
 * POST /api/social-media/schedule — schedule a post for later
 * GET  /api/social-media/schedule — check and publish due posts
 *
 * Scheduled posts are stored in Supabase (table: scheduled_posts).
 * NOTE: Previously stored in /tmp which Vercel wipes on cold start —
 * that's why scheduled posts never published. Supabase persists them.
 */
import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

interface ScheduledPost {
  id: string;
  text: string;
  image_url: string;
  platforms: string[];
  page_id: string;
  scheduled_at: number; // Unix timestamp
  created_at: number;
  published: boolean;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

function supabaseFetch(path: string, init?: RequestInit) {
  const url = process.env.FACTORY_SUPABASE_URL || '';
  const key = process.env.FACTORY_SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(init?.headers || {}),
    },
  });
}

async function readSchedules(): Promise<ScheduledPost[]> {
  try {
    const res = await supabaseFetch('scheduled_posts?select=*&order=scheduled_at.asc');
    if (!res) return [];
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map((r: any) => ({
      id: r.id,
      text: r.text,
      image_url: r.image_url || '',
      platforms: Array.isArray(r.platforms) ? r.platforms : ['facebook'],
      page_id: r.page_id || '1341052299081486',
      scheduled_at: r.scheduled_at,
      created_at: r.created_at,
      published: r.published,
    }));
  } catch {
    return [];
  }
}

// POST: Schedule a post
export async function POST(req: Request) {
  try {
    const { text, imageUrl, platforms, pageId, scheduledAt } = await req.json();
    
    if (!text || !scheduledAt || !platforms?.length) {
      return NextResponse.json({ error: 'Missing text, platforms, or scheduledAt' }, { status: 400, headers: CORS });
    }

    const post: ScheduledPost = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text,
      image_url: imageUrl || '',
      platforms,
      page_id: pageId || '1341052299081486',
      scheduled_at: scheduledAt,
      created_at: Date.now(),
      published: false,
    };

    const res = await supabaseFetch('scheduled_posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });

    if (!res) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500, headers: CORS });
    }
    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Failed to save schedule: ${errText.slice(0, 200)}` }, { status: 500, headers: CORS });
    }

    return NextResponse.json({
      success: true,
      post,
      message: `Scheduled for ${new Date(scheduledAt).toLocaleString()}`,
    }, { headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}

// GET: Check for due posts and publish them
export async function GET(req: Request) {
  try {
    const now = Date.now();
    const schedules = await readSchedules();
    const due = schedules.filter(s => !s.published && s.scheduled_at <= now);
    const remainingIds = schedules
      .filter(s => s.published || s.scheduled_at > now)
      .map(s => s.id);

    const results: any[] = [];

    for (const post of due) {
      try {
        // Call the publish API
        const publishRes = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'https://plumbcore-ai.vercel.app'}/api/social-media/publish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customText: post.text,
              customImageUrl: post.image_url || undefined,
              platforms: post.platforms,
              pageId: post.page_id,
            }),
          }
        );
        const publishData = await publishRes.json();
        
        // Send Telegram notification
        const successCount = (publishData.results || []).filter((r: any) => r.success).length;
        const msg = `⏰ <b>Scheduled Post Published</b>\n${post.text.substring(0,100)}${post.text.length>100?'...':''}\n\n✅ Published to ${successCount} platform(s)`;
        try {
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: 8159594758, text: msg, parse_mode: 'HTML' }),
            signal: AbortSignal.timeout(5000),
          });
        } catch {}

        // Mark as published in Supabase
        try {
          await supabaseFetch(`scheduled_posts?id=eq.${post.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ published: true }),
          });
        } catch {}

        results.push({ id: post.id, success: true, results: publishData.results });
      } catch (err: any) {
        results.push({ id: post.id, success: false, error: err.message });
      }
    }

    // Clean up published posts older than 7 days (keep history light)
    try {
      const weekAgo = now - 7 * 24 * 3600 * 1000;
      const stale = schedules.filter(s => s.published && s.created_at < weekAgo).map(s => s.id);
      for (const id of stale) {
        const delRes = await supabaseFetch(`scheduled_posts?id=eq.${id}`, { method: 'DELETE' });
        if (delRes) { try { await delRes; } catch {} }
      }
    } catch {}

    return NextResponse.json({
      checked: schedules.length,
      published: results.length,
      results,
    }, { headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}

export const config = { runtime: 'nodejs' };
