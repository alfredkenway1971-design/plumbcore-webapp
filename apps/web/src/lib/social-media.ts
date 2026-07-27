/**
 * Social Media Content Factory — Core Library
 *
 * Content generation, image creation, Facebook/Instagram publishing
 * Uses fetch() — no external dependencies needed
 */

// ── Get Meta Token from Vercel env ──
function getMetaToken(): string {
  return process.env.META_USER_TOKEN || '';
}

export interface PostContent {
  text: string;
  imageUrl?: string;
  platforms: string[];
  pageId?: string;
}

export interface PublishResult {
  platform: string;
  success: boolean;
  postId?: string;
  error?: string;
}

export interface PageInfo {
  id: string;
  name: string;
  hasInstagram: boolean;
  igUserId?: string;
}

// ── AI Content Generation ──

export async function generateContent(topic: string): Promise<{ text: string; imagePrompt: string }> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a social media content creator. Generate a short, engaging post.
Return valid JSON only: { "text": "post text max 200 chars", "imagePrompt": "detailed image generation prompt" }`,
        },
        { role: 'user', content: topic },
      ],
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  try {
    const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    return { text: content.text || topic, imagePrompt: content.imagePrompt || topic };
  } catch {
    return { text: topic, imagePrompt: topic };
  }
}

// ── Image Generation (pollinations.ai — free, no key needed) ──

export function generateImageUrl(prompt: string): string {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1080&nologo=true`;
}

// ── Get Facebook Page Access Token ──

async function getPageToken(pageId: string): Promise<string | null> {
  const token = getMetaToken();
  if (!token) return null;
  const res = await fetch(
    `https://graph.facebook.com/v25.0/${pageId}?fields=access_token&access_token=${token}`
  );
  const data = await res.json();
  return data.access_token || null;
}

// ── Publish to Facebook ──

export async function publishToFacebook(pageId: string, text: string, imageUrl?: string): Promise<PublishResult> {
  try {
    const pageToken = await getPageToken(pageId);
    if (!pageToken) return { platform: 'facebook', success: false, error: 'No page token' };

    let postId: string;
    if (imageUrl) {
      const res = await fetch(
        `https://graph.facebook.com/v25.0/${pageId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            url: imageUrl,
            caption: text,
            access_token: pageToken,
          }),
        }
      );
      const data = await res.json();
      postId = data.id;
    } else {
      const res = await fetch(
        `https://graph.facebook.com/v25.0/${pageId}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            message: text,
            access_token: pageToken,
          }),
        }
      );
      const data = await res.json();
      postId = data.id;
    }

    if (!postId) return { platform: 'facebook', success: false, error: 'Post failed' };
    return { platform: 'facebook', success: true, postId };
  } catch (err: any) {
    return { platform: 'facebook', success: false, error: err.message };
  }
}

// ── Publish to Instagram ──

export async function publishToInstagram(pageId: string, igUserId: string, text: string, imageUrl: string): Promise<PublishResult> {
  try {
    const pageToken = await getPageToken(pageId);
    if (!pageToken) return { platform: 'instagram', success: false, error: 'No page token' };

    // Step 1: Create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v25.0/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          image_url: imageUrl,
          caption: text,
          access_token: pageToken,
        }),
      }
    );
    const container = await containerRes.json();
    if (!container.id) return { platform: 'instagram', success: false, error: 'Container creation failed' };

    // Step 2: Publish the container
    const publishRes = await fetch(
      `https://graph.facebook.com/v25.0/${igUserId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          creation_id: container.id,
          access_token: pageToken,
        }),
      }
    );
    const publish = await publishRes.json();

    return { platform: 'instagram', success: !!publish.id, postId: publish.id };
  } catch (err: any) {
    return { platform: 'instagram', success: false, error: err.message };
  }
}

// ── Router Agent — Publish to Multiple Platforms ──

export async function socialMediaRouter(content: PostContent): Promise<PublishResult[]> {
  const results: PublishResult[] = [];
  const pageId = content.pageId || '1341052299081486';

  for (const platform of content.platforms) {
    switch (platform) {
      case 'facebook':
        results.push(await publishToFacebook(pageId, content.text, content.imageUrl));
        break;
      case 'instagram':
        results.push({ platform: 'instagram', success: false, error: 'Instagram requires igUserId — set up Instagram Business account first' });
        break;
      default:
        results.push({ platform, success: false, error: `Platform ${platform} not implemented yet` });
    }
  }

  return results;
}

// ── List Facebook Pages with Instagram status ──

export async function listPages(): Promise<PageInfo[]> {
  const token = getMetaToken();
  if (!token) return [];

  const res = await fetch(
    `https://graph.facebook.com/v25.0/me/accounts?access_token=${token}`
  );
  const data = await res.json();
  const pages: any[] = data.data || [];

  const results: PageInfo[] = [];
  for (const page of pages) {
    const igRes = await fetch(
      `https://graph.facebook.com/v25.0/${page.id}?fields=instagram_business_account{id,username}&access_token=${token}`
    );
    const igData = await igRes.json();
    const igAcct = igData?.instagram_business_account;
    results.push({
      id: page.id,
      name: page.name,
      hasInstagram: !!igAcct,
      igUserId: igAcct?.id,
    });
  }
  return results;
}
