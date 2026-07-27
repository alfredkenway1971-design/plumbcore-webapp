/**
 * Social Media Factory — Complete Publishing Engine
 *
 * Facebook ✅ | Instagram 🚧 | LinkedIn 🚧 | Threads 🚧
 */
import { NextResponse } from 'next/server';

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

// ── Page Token Helper ──
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

// ── AI Content Generation ──
async function generateContent(topic: string) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: `You are a social media content creator. Return ONLY valid JSON:
{ "text": "post text under 200 chars", "imagePrompt": "detailed image generation prompt" }` },
        { role: 'user', content: topic },
      ],
      max_tokens: 300,
    }),
  });
  const data = await res.json();
  try { return JSON.parse(data.choices?.[0]?.message?.content || '{}'); }
  catch { return { text: topic, imagePrompt: topic }; }
}

// ── Image Generation ──
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

// ── Router Agent ──
export async function POST(req: Request) {
  try {
    const { topic, platforms, pageId, customText, customImageUrl, approval } = await req.json();

    if (!topic && !customText) {
      return NextResponse.json({ error: 'Provide topic or customText' }, { status: 400, headers: CORS });
    }

    // Generate content
    let text = customText || '';
    let imageUrl = customImageUrl || '';
    let imagePrompt = '';

    if (!customText) {
      const content = await generateContent(topic);
      text = content.text || topic;
      imagePrompt = content.imagePrompt || topic;
    }
    if (!imageUrl) imageUrl = genImageUrl(imagePrompt || topic);

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

    // Collect page info for Instagram
    let igUserId = '';
    if (platforms?.includes('instagram')) {
      try {
        const igRes = await fetch(
          `https://graph.facebook.com/v25.0/${pageId}?fields=instagram_business_account{id}&access_token=${META_TOKEN}`
        );
        const igData = await igRes.json();
        igUserId = igData?.instagram_business_account?.id || '';
      } catch {}
    }

    // Publish to each platform
    const results: PublishResult[] = [];
    for (const platform of platforms || ['facebook']) {
      switch (platform) {
        case 'facebook':
          results.push(await publishFacebook(pageId, text, imageUrl));
          break;
        case 'instagram':
          if (!igUserId) {
            results.push({ platform: 'instagram', success: false,
              error: 'No Instagram Business account linked. Go to business.facebook.com/settings to link Instagram to this page.' });
          } else {
            results.push(await publishInstagram(pageId, igUserId, text, imageUrl));
          }
          break;
        case 'linkedin':
          results.push({ platform: 'linkedin', success: false, error: 'LinkedIn API token needed. Create a LinkedIn app at developer.linkedin.com to get started.' });
          break;
        case 'threads':
          results.push({ platform: 'threads', success: false, error: 'Threads API setup needed. Add "Access the Threads API" use case in Meta Developer Portal.' });
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
    const res = await fetch(`https://graph.facebook.com/v25.0/me/accounts?access_token=${META_TOKEN}`);
    const data = await res.json();
    const pages: any[] = data.data || [];

    const result = [];
    for (const page of pages) {
      let hasInstagram = false;
      let igUserId = '';
      
      // Hardcode known Instagram connections
      if (page.id === '1341052299081486') {
        hasInstagram = true;
        igUserId = '17841448677455592';
      } else {
        // Try API lookup for other pages
        try {
          const igRes = await fetch(
            `https://graph.facebook.com/v25.0/${page.id}?fields=instagram_business_account{id,username}&access_token=${META_TOKEN}`
          );
          const igData = await igRes.json();
          hasInstagram = !!igData?.instagram_business_account?.id;
          igUserId = igData?.instagram_business_account?.id || '';
        } catch {}
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
