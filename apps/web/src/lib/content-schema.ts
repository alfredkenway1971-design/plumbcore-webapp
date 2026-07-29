/**
 * Social Media Content Schema
 * 
 * Edit this in Google Docs for easy collaboration.
 * Copy this content to a shared Google Doc and paste the link in the Factory.
 */

export const DEFAULT_SCHEMA = `# Social Media Factory — Content Schema

## Brand Voice
- Professional but warm — like an expert helping a friend
- Active voice, clear language, no jargon
- Focus on value: what does the reader gain?
- Never use hype words ("game-changing," "revolutionary," "insane")

## Platform Formats

### Facebook
- 2-3 short paragraphs (150-250 chars total)
- Hook → Value → CTA (question or "Learn more")
- Emojis: 1-2 max, used deliberately
- Image recommended: product shot or infographic

### Instagram
- Short caption (50-120 chars) + line break + 5-8 hashtags
- Conversational tone
- First line is the hook
- Image required (1080x1080)
- Hashtags: mix of broad (5K+) and niche (500-5K)

### LinkedIn
- Professional, insight-driven
- 3-5 paragraphs with bullet points where relevant
- Lead with a stat, insight, or question
- Close with a discussion prompt
- No emojis, no hashtags in body

### Threads
- Short-form, conversational (50-150 chars)
- One idea per post
- Optional: thread multiple posts for longer topics
- Casual tone, can be more experimental

### YouTube Shorts
- Hook in first 3 seconds
- 15-30 second video
- Description: 1-2 lines + 3-5 hashtags
- Title: keyword-rich, under 60 chars

## Content Structure (all platforms)
1. Hook: Stop them scrolling (question, stat, bold statement)
2. Value: What's in it for them (tip, insight, solution)
3. CTA: What to do next (comment, visit, try)

## Hashtag Rules
- 5-8 for Instagram, 0 for LinkedIn, 0-3 for Facebook
- Mix: 2 broad (50K+), 2 medium (5K-50K), 2 niche (<5K)
- Platform-specific when relevant (#SmallBusiness for FB, #MarketingTips for LI)

## Image Guidelines
- Clean background, single subject
- Text overlay: max 20% of image
- Brand colors preferred (#059669 emerald)
- No stock photo clichés (handshakes, laptops in cafes)
`;

export async function loadSchema(schemaUrl?: string): Promise<string> {
  if (!schemaUrl) return DEFAULT_SCHEMA;
  
  try {
    // Extract Google Doc ID from URL
    const match = schemaUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) return DEFAULT_SCHEMA;
    
    const docId = match[1];
    const res = await fetch(`https://docs.google.com/document/d/${docId}/export?format=txt`);
    if (!res.ok) return DEFAULT_SCHEMA;
    
    const text = await res.text();
    return text.trim() || DEFAULT_SCHEMA;
  } catch {
    return DEFAULT_SCHEMA;
  }
}

export function buildSystemPrompt(schema: string, platforms: string[], topic: string): string {
  return `You are a professional social media content creator. Follow this schema exactly:

${schema}

Today's topic: ${topic}
Target platforms: ${platforms.join(', ')}

Return ONLY valid JSON with this structure:
{
  "posts": {
    "facebook": { "text": "post text", "imagePrompt": "image description" },
    "instagram": { "text": "caption with hashtags", "imagePrompt": "image description" },
    "linkedin": { "text": "post text with paragraphs" },
    "threads": { "text": "short post text" }
  },
  "imagePrompt": "generic image prompt for any platform that needs one (describe the scene, style, and mood)",
  "hashtags": ["tag1", "tag2", "tag3"]
}

ONLY include platforms that are in the target platforms list. Ensure each platform's text follows its format rules from the schema.
Keep all text under the platform's length limit. Return ONLY valid JSON, nothing else.`;
}
