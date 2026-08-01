/**
 * Social Media Factory — Complete Publishing Engine
 *
 * Facebook ✅ | Instagram 🚧 | LinkedIn 🚧 | Threads 🚧
 */
import { NextResponse } from 'next/server';
import { loadSchema, buildSystemPrompt, DEFAULT_SCHEMA } from '@/lib/content-schema';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

const META_TOKEN = process.env.META_USER_TOKEN || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://plumbcore-ai.vercel.app';

// ── Telegram Notification ──
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TG_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8159594758';

async function sendTelegram(message: string): Promise<void> {
  if (!TG_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: parseInt(TG_CHAT_ID), text: message, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {}
}

// ── Simple SMTP sender via Gmail ──
// Removed — Telegram is the notification channel now

interface PublishResult {
  platform: string;
  success: boolean;
  postId?: string;
  error?: string;
}

// ── Known Instagram Business Account IDs ──
// API detection bug: instagram_business_account may return null even when connected
const KNOWN_IG: Record<string, {id: string, username: string}> = {
  '1341052299081486': {id: '17841442604185356', username: 'plumbcoreai'},
};

// ── Known Threads Business Account IDs ──
const KNOWN_THREADS: Record<string, string> = {
  // Add known Threads user IDs here when connected:
  // '1341052299081486': 'THREADS_USER_ID',
};

async function getPageToken(pageId: string): Promise<string | null> {
  // Try page-level token first (non-expiring)
  const pageTokenEnv = process.env.META_PAGE_TOKEN || '';
  if (pageTokenEnv && pageId === '1341052299081486') {
    return pageTokenEnv;
  }
  // Fallback to user token
  try {
    const res = await fetch(
      `https://graph.facebook.com/v25.0/${pageId}?fields=access_token&access_token=${META_TOKEN}`
    );
    const data = await res.json();
    return data.access_token || null;
  } catch { return null; }
}

// ── AI Content Generation (Schema-Powered) ──
async function generateContent(topic: string, platforms?: string[]) {
  const schemaUrl = process.env.CONTENT_SCHEMA_URL || '';
  const schema = await loadSchema(schemaUrl);
  const systemPrompt = buildSystemPrompt(schema, platforms || ['facebook'], topic);

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: topic },
      ],
      max_tokens: 800,
    }),
  });
  const data = await res.json();
  try {
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    // Extract text from the primary platform, or use the first available
    const posts = parsed.posts || {};
    const primaryPlatform = platforms?.[0] || 'facebook';
    const platformContent = posts[primaryPlatform] || {};
    return {
      text: platformContent.text || parsed.text || topic,
      imagePrompt: platformContent.imagePrompt || parsed.imagePrompt || topic,
      hashtags: parsed.hashtags || [],
      posts, // return all platform-specific posts for multi-platform publishing
    };
  } catch {
    return { text: topic, imagePrompt: topic, hashtags: [], posts: {} };
  }
}

// ── Image Generation (Nano Banana Lite via OpenRouter, uploaded to Supabase Storage) ──
async function generateImage(prompt: string): Promise<string> {
  try {
    const key = process.env.OPENROUTER_API_KEY || '';
    if (!key) return '';

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-lite-image',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
        max_tokens: 2000,
      }),
    });
    const data = await res.json();
    const images = data?.choices?.[0]?.message?.images;
    const url = images?.[0]?.image_url?.url || '';
    if (!url.startsWith('data:')) return url || '';

    // Decode base64 data URL and upload to Supabase Storage
    const match = url.match(/^data:image\/([^;]+);base64,([\s\S]*)$/);
    if (!match) return '';
    const ext = match[1] === 'png' ? 'png' : 'jpg';
    const buffer = Buffer.from(match[2], 'base64');
    const fileName = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const supabaseUrl = process.env.FACTORY_SUPABASE_URL || '';
    const serviceKey = process.env.FACTORY_SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseUrl || !serviceKey) return '';

    const upload = await fetch(`${supabaseUrl}/storage/v1/object/factory-images/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': `image/${ext}`,
      },
      body: buffer,
    });
    if (!upload.ok) return '';
    return `${supabaseUrl}/storage/v1/object/public/factory-images/${fileName}`;
  } catch {
    return '';
  }
}

// Legacy URL builder kept for backward compatibility (custom image URLs only)
function genImageUrl(prompt: string): string {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1080&nologo=true`;
}

// ── Facebook ──
async function publishFacebook(pageId: string, text: string, imageUrl?: string): Promise<PublishResult> {
  try {
    const token = await getPageToken(pageId);
    if (!token) return { platform: 'facebook', success: false, error: 'No page token' };

    const url = imageUrl
      ? `https://graph.facebook.com/v25.0/${pageId}/photos`
      : `https://graph.facebook.com/v25.0/${pageId}/feed`;

    const body = imageUrl
      ? new URLSearchParams({ url: imageUrl, caption: text, access_token: token })
      : new URLSearchParams({ message: text, access_token: token });

    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    const data = await res.json();
    return data.id
      ? { platform: 'facebook', success: true, postId: data.id }
      : { platform: 'facebook', success: false, error: data.error?.message || 'Unknown error' };
  } catch (err: any) {
    return { platform: 'facebook', success: false, error: err.message };
  }
}

// ── Instagram ──
async function publishInstagram(pageId: string, igUserId: string, text: string, imageUrl: string): Promise<PublishResult> {
  try {
    const token = await getPageToken(pageId);
    if (!token) return { platform: 'instagram', success: false, error: 'No page token' };

    // Step 1: Create container
    const containerRes = await fetch(`https://graph.facebook.com/v25.0/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ image_url: imageUrl, caption: text, access_token: token }),
    });
    const container = await containerRes.json();
    if (!container.id) return { platform: 'instagram', success: false, error: 'Container creation failed' };

    // Step 2: Publish
    const pubRes = await fetch(`https://graph.facebook.com/v25.0/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ creation_id: container.id, access_token: token }),
    });
    const pub = await pubRes.json();
    return pub.id
      ? { platform: 'instagram', success: true, postId: pub.id }
      : { platform: 'instagram', success: false, error: 'Publish failed' };
  } catch (err: any) {
    return { platform: 'instagram', success: false, error: err.message };
  }
}

// ── Threads ──
async function publishThreads(pageId: string, thUserId: string, text: string, imageUrl?: string): Promise<PublishResult> {
  try {
    const token = await getPageToken(pageId);
    if (!token) return { platform: 'threads', success: false, error: 'No page token' };

    // Step 1: Create container (TEXT or IMAGE)
    const body = imageUrl
      ? new URLSearchParams({ media_type: 'IMAGE', image_url: imageUrl, text, access_token: token })
      : new URLSearchParams({ media_type: 'TEXT', text, access_token: token });

    const containerRes = await fetch(`https://graph.facebook.com/v25.0/${thUserId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const container = await containerRes.json();
    if (!container.id) return { platform: 'threads', success: false, error: container.error?.message || 'Container creation failed' };

    // Step 2: Publish
    const pubRes = await fetch(`https://graph.facebook.com/v25.0/${thUserId}/threads_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ creation_id: container.id, access_token: token }),
    });
    const pub = await pubRes.json();
    return pub.id
      ? { platform: 'threads', success: true, postId: pub.id }
      : { platform: 'threads', success: false, error: pub.error?.message || 'Publish failed' };
  } catch (err: any) {
    return { platform: 'threads', success: false, error: err.message };
  }
}

// ── Router Agent ──
export async function POST(req: Request) {
  try {
    const { topic, platforms, pageId, customText, customImageUrl, approval, schemaUrl } = await req.json();

    // ── Report mode: send via Telegram ──
    if (platforms === 'report' || platforms?.[0] === 'report') {
      const msg = customText || topic || '';
      if (msg) {
        await sendTelegram(msg);
        return NextResponse.json({ success: true, ok: true }, { headers: CORS });
      }
      return NextResponse.json({ error: 'No message' }, { status: 400, headers: CORS });
    }

    if (!topic && !customText) {
      return NextResponse.json({ error: 'Provide topic or customText' }, { status: 400, headers: CORS });
    }

    // Set schema URL from request if provided (overrides env var)
    if (schemaUrl) {
      process.env.CONTENT_SCHEMA_URL = schemaUrl;
    }

    // Generate content (schema-powered, platform-aware)
    let text = customText || '';
    let imageUrl = customImageUrl || '';
    let imagePrompt = '';
    let hashtags: string[] = [];
    let platformPosts: Record<string, any> = {};

    if (!customText) {
      const content = await generateContent(topic, platforms);
      text = content.text || topic;
      imagePrompt = content.imagePrompt || topic;
      hashtags = content.hashtags || [];
      platformPosts = content.posts || {};
      
      // Use platform-specific text when available
      if (platforms && platforms.length > 1) {
        // For each platform, publish its specific text if available
        // (otherwise falls back to the primary text)
      }
    }
    if (!imageUrl) {
      // Generate image via Nano Banana Lite (OpenRouter) → Supabase Storage URL
      imageUrl = await generateImage(imagePrompt || topic);
      // Fallback to legacy generator if OpenRouter image gen failed
      if (!imageUrl) imageUrl = genImageUrl(imagePrompt || topic);
    }

    // ── Approval flow ──
    if (approval) {
      const token = Array.from({length:16},()=>Math.floor(Math.random()*16).toString(16)).join('');
      // Store pending approval
      const { storePending } = await import('../approve/route');
      storePending(token, { text, imageUrl, platforms: platforms || ['facebook'], pageId });

      const approveUrl = `${APP_URL}/api/social-media/approve?token=${token}&action=approve`;
      const declineUrl = `${APP_URL}/api/social-media/approve?token=${token}&action=decline`;

      const html = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="font-size:20px;margin:0 0 16px;color:#0c1222">📝 Post Approval Request</h2>
          <div style="background:#f4f6f9;border-radius:8px;padding:16px;margin-bottom:16px;font-size:14px;line-height:1.6;color:#475569">
            ${text.replace(/\n/g, '<br>')}
          </div>
          ${imageUrl ? `<img src="${imageUrl}" style="width:100%;max-height:300px;object-fit:cover;border-radius:8px;margin-bottom:16px" alt="Post image">` : ''}
          <div style="margin-bottom:16px;font-size:12px;color:#94a3b8">
            Platforms: ${(platforms || ['facebook']).join(', ')}
          </div>
          <div style="display:flex;gap:12px">
            <a href="${approveUrl}" style="flex:1;display:block;padding:12px;border-radius:8px;background:#059669;color:#fff;text-decoration:none;font-weight:600;text-align:center;font-size:14px">✅ Approve &amp; Publish</a>
            <a href="${declineUrl}" style="flex:1;display:block;padding:12px;border-radius:8px;background:#f4f6f9;color:#475569;text-decoration:none;font-weight:600;text-align:center;font-size:14px;border:1px solid #e2e8f0">✋ Decline</a>
          </div>
        </div>
      `;

      // Send approval request via Telegram
      await sendTelegram(`📝 <b>Post Approval Needed</b>\n\n${text.substring(0,200)}${text.length>200?'...':''}\n\n✅ <a href="${approveUrl}">Approve &amp; Publish</a>\n✋ <a href="${declineUrl}">Decline</a>`).catch(() => {});

      return NextResponse.json({
        success: true,
        status: 'pending_approval',
        content: { text, imageUrl, imagePrompt },
        message: 'Approval email sent. Check your inbox.',
      }, { headers: CORS });
    }

    // Collect page info for Instagram & Threads
    let igUserId = '';
    if (platforms?.includes('instagram')) {
      try {
        const igRes = await fetch(
          `https://graph.facebook.com/v25.0/${pageId}?fields=instagram_business_account{id}&access_token=${META_TOKEN}`
        );
        const igData = await igRes.json();
        igUserId = igData?.instagram_business_account?.id || '';
      } catch {}
      if (!igUserId) {
        const known = KNOWN_IG[pageId];
        if (known) igUserId = known.id;
      }
    }

    // Collect page info for Threads
    let thUserId = '';
    if (platforms?.includes('threads')) {
      // Check for Threads business account via API
      try {
        const thRes = await fetch(
          `https://graph.facebook.com/v25.0/${pageId}?fields=threads_business_account{id}&access_token=${META_TOKEN}`
        );
        const thData = await thRes.json();
        thUserId = thData?.threads_business_account?.id || '';
      } catch {}
      // Fallback: known Threads IDs
      if (!thUserId) {
        thUserId = KNOWN_THREADS[pageId] || '';
      }
    }

    // Publish to each platform (with platform-specific text from schema)
    const results: PublishResult[] = [];
    for (const platform of platforms || ['facebook']) {
      // Use platform-specific text if available, otherwise fall back to generated text
      const platformText = platformPosts[platform]?.text || text;
      const platformImagePrompt = platformPosts[platform]?.imagePrompt || imagePrompt;
      const platformImageUrl = imageUrl || genImageUrl(platformImagePrompt);
      
      switch (platform) {
        case 'facebook':
          results.push(await publishFacebook(pageId, platformText, platformImageUrl));
          break;
        case 'instagram':
          if (!igUserId) {
            results.push({ platform: 'instagram', success: false,
              error: 'No Instagram Business account linked. Go to business.facebook.com/settings to link Instagram to this page.' });
          } else {
            results.push(await publishInstagram(pageId, igUserId, platformText, platformImageUrl));
          }
          break;
        case 'linkedin':
          results.push({ platform: 'linkedin', success: false, error: 'LinkedIn API token needed. Create a LinkedIn app at developer.linkedin.com to get started.' });
          break;
        case 'threads':
          if (!thUserId) {
            results.push({ platform: 'threads', success: false,
              error: 'No Threads account linked. Go to business.facebook.com/settings to link a Threads account, or I can hardcode the ID.' });
          } else {
            results.push(await publishThreads(pageId, thUserId, platformText, platformImageUrl));
          }
          break;
        case 'youtube':
          // YouTube Shorts handled by Factory API directly
          break;
        default:
          results.push({ platform, success: false, error: 'Unknown platform' });
      }
    }

    // Send Telegram notification
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const msg = `📤 <b>Post Published</b>\n${text.substring(0,100)}${text.length>100?'...':''}\n\n✅ ${successCount} success · ❌ ${failCount} failed\nPlatforms: ${(platforms||['facebook']).join(', ')}`;
    sendTelegram(msg).catch(()=>{});

    return NextResponse.json({
      success: true, content: { text, imageUrl, imagePrompt }, results,
    }, { headers: CORS });

  } catch (err: any) {
    console.error('[SocialMedia] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}

export async function GET() {
  try {
    const pageToken = process.env.META_PAGE_TOKEN || '';
    let pages: any[] = [];

    // Try user token first (lists all pages)
    if (META_TOKEN) {
      try {
        const res = await fetch(`https://graph.facebook.com/v25.0/me/accounts?access_token=${META_TOKEN}`);
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          pages = data.data;
        }
      } catch {}
    }

    // Fallback: use page token to query known pages directly
    if (pages.length === 0 && pageToken) {
      // Known page IDs for Amer
      const knownPageIds = ['1341052299081486'];
      for (const pid of knownPageIds) {
        try {
          const res = await fetch(
            `https://graph.facebook.com/v25.0/${pid}?fields=name&access_token=${pageToken}`
          );
          const data = await res.json();
          if (data.id) {
            pages.push(data);
          }
        } catch {}
      }
    }

    const result = [];
    for (const page of pages) {
      let hasInstagram = false;
      let igUserId = '';
      
      // Check known IG IDs first (API detection bug workaround)
      const known = KNOWN_IG[page.id];
      if (known) {
        hasInstagram = true;
        igUserId = known.id;
      } else {
        // Try API lookup for other pages
        const token = META_TOKEN || pageToken;
        if (token) {
          try {
            const igRes = await fetch(
              `https://graph.facebook.com/v25.0/${page.id}?fields=instagram_business_account{id,username}&access_token=${token}`
            );
            const igData = await igRes.json();
            hasInstagram = !!igData?.instagram_business_account?.id;
            igUserId = igData?.instagram_business_account?.id || '';
          } catch {}
        }
      }
      
      result.push({
        id: page.id,
        name: page.name,
        hasInstagram,
        igUserId,
      });
    }
    return NextResponse.json({ pages: result }, { headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
