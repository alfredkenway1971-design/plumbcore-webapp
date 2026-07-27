/**
 * POST /api/social-media/youtube — Upload a YouTube Short
 * 
 * Requires Google OAuth credentials with youtube.upload scope
 */
import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const YT_CLIENT_ID = process.env.YT_CLIENT_ID || '';
const YT_CLIENT_SECRET = process.env.YT_CLIENT_SECRET || '';
const YT_REFRESH_TOKEN = process.env.YT_REFRESH_TOKEN || '';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

// GET: Check if YouTube is configured
export async function GET() {
  const configured = !!(YT_CLIENT_ID && YT_CLIENT_SECRET);
  return NextResponse.json({
    configured,
    message: configured 
      ? 'YouTube API configured. You can upload Shorts.'
      : 'YouTube not configured. Set YT_CLIENT_ID, YT_CLIENT_SECRET, and YT_REFRESH_TOKEN in Vercel env.',
    setupUrl: 'https://console.cloud.google.com/apis/credentials?project=_&api=youtube.googleapis.com',
  }, { headers: CORS });
}

// POST: Upload a Short
export async function POST(req: Request) {
  try {
    const { videoUrl, title, description, tags, privacyStatus } = await req.json();
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'videoUrl is required' }, { status: 400, headers: CORS });
    }
    if (!YT_CLIENT_ID || !YT_CLIENT_SECRET) {
      return NextResponse.json({ 
        error: 'YouTube API not configured',
        setupUrl: 'https://console.cloud.google.com/apis/credentials?project=_&api=youtube.googleapis.com',
        instructions: [
          '1. Go to console.cloud.google.com',
          '2. Create a project & enable YouTube Data API v3',
          '3. Create OAuth 2.0 credentials (Desktop app type)',
          '4. Add https://developers.google.com/oauthplayground to authorized redirect URIs',
          '5. Go to https://developers.google.com/oauthplayground',
          '6. Select "YouTube Data API v3" → "https://www.googleapis.com/auth/youtube.upload"',
          '7. Exchange your auth code for a refresh token',
          '8. Set YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN in Vercel env',
        ],
      }, { status: 400, headers: CORS });
    }

    // Get access token from refresh token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: YT_CLIENT_ID,
        client_secret: YT_CLIENT_SECRET,
        refresh_token: YT_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return NextResponse.json({ error: 'Token refresh failed: ' + (tokenData.error || 'unknown') }, { status: 400, headers: CORS });
    }
    const accessToken = tokenData.access_token;

    // Download the video
    const videoRes = await fetch(videoUrl);
    const videoBuffer = await videoRes.arrayBuffer();

    // Upload to YouTube
    // First: create the metadata
    const metadata = {
      snippet: {
        title: title?.substring(0, 100) || 'Factory Short',
        description: description?.substring(0, 5000) || '',
        tags: tags || [],
        categoryId: '22', // People & Blogs
      },
      status: {
        privacyStatus: privacyStatus || 'unlisted',
        selfDeclaredMadeForKids: false,
      },
    };

    // Multipart upload
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2);
    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      `--${boundary}`,
      'Content-Type: video/mp4',
      'Content-Transfer-Encoding: binary',
      '',
      Buffer.from(videoBuffer).toString('binary'),
      `--${boundary}--`,
    ].join('\r\n');

    const uploadRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      return NextResponse.json({ error: 'Upload failed: ' + JSON.stringify(uploadData) }, { status: 400, headers: CORS });
    }

    return NextResponse.json({
      success: true,
      videoId: uploadData.id,
      url: `https://youtube.com/shorts/${uploadData.id}`,
    }, { headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}

export const config = { runtime: 'nodejs' };
