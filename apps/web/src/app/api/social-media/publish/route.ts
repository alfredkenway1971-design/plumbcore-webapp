/**
 * POST /api/social-media/publish
 * Social Media Router Agent — orchestrates content creation & publishing
 */
import { NextResponse } from 'next/server';
import { generateContent, generateImageUrl, socialMediaRouter, listPages } from '@/lib/social-media';

export async function POST(req: Request) {
  try {
    const { topic, platforms, pageId, customText, customImageUrl } = await req.json();

    if (!topic && !customText) {
      return NextResponse.json({ error: 'Provide topic or customText' }, { status: 400 });
    }

    // Step 1: Generate content
    let text = customText || '';
    let imageUrl = customImageUrl || '';
    let imagePrompt = '';

    if (!customText) {
      const content = await generateContent(topic);
      text = content.text;
      imagePrompt = content.imagePrompt;
    }

    // Step 2: Generate image if not provided
    if (!imageUrl) {
      imageUrl = generateImageUrl(imagePrompt || topic);
    }

    // Step 3: Publish to selected platforms
    const results = await socialMediaRouter({
      text,
      imageUrl,
      platforms: platforms || ['facebook'],
      pageId,
    });

    return NextResponse.json({
      success: true,
      content: { text, imageUrl, imagePrompt },
      results,
    });

  } catch (err: any) {
    console.error('[SocialMedia] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  // GET /api/social-media/publish — list pages
  try {
    const pages = await listPages();
    return NextResponse.json({ pages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
