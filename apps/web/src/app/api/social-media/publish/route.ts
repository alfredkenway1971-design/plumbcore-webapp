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

interface PublishResult {
  platform: string;
  success: boolean;
  postId?: string;
  error?: string;
}

// ── Page Token Helper ──
async function getPageToken(pageId: string): Promise<string | null> {
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
    const { topic, platforms, pageId, customText, customImageUrl } = await req.json();

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
      const igRes = await fetch(
        `https://graph.facebook.com/v25.0/${page.id}?fields=instagram_business_account{id,username}&access_token=${META_TOKEN}`
      );
      const igData = await igRes.json();
      result.push({
        id: page.id,
        name: page.name,
        hasInstagram: !!igData?.instagram_business_account?.id,
        igUserId: igData?.instagram_business_account?.id || '',
      });
    }
    return NextResponse.json({ pages: result }, { headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
