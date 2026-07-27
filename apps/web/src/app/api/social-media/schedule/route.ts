/**
 * POST /api/social-media/schedule — schedule a post for later
 * GET  /api/social-media/schedule — check and publish due posts
 */
import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SCHEDULE_FILE = '/tmp/scheduled_posts.json';

interface ScheduledPost {
  id: string;
  text: string;
  imageUrl: string;
  platforms: string[];
  pageId: string;
  scheduledAt: number; // Unix timestamp
  createdAt: number;
  published: boolean;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

function readSchedules(): ScheduledPost[] {
  try {
    if (fs.existsSync(SCHEDULE_FILE)) {
      return JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));
    }
  } catch {}
  return [];
}

function writeSchedules(schedules: ScheduledPost[]) {
  try {
    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(schedules, null, 2));
  } catch {}
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
      imageUrl: imageUrl || '',
      platforms,
      pageId: pageId || '1341052299081486',
      scheduledAt,
      createdAt: Date.now(),
      published: false,
    };

    const schedules = readSchedules();
    schedules.push(post);
    writeSchedules(schedules);

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
    const schedules = readSchedules();
    const due = schedules.filter(s => !s.published && s.scheduledAt <= now);
    const remaining = schedules.filter(s => s.published || s.scheduledAt > now);

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
              customImageUrl: post.imageUrl || undefined,
              platforms: post.platforms,
              pageId: post.pageId,
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

        results.push({ id: post.id, success: true, results: publishData.results });
      } catch (err: any) {
        results.push({ id: post.id, success: false, error: err.message });
      }
    }

    // Save remaining (remove published ones)
    writeSchedules(remaining);

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
