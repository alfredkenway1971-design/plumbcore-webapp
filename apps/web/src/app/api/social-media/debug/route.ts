/**
 * GET /api/social-media/debug — diagnostic endpoint for YouTube credentials
 */
import { NextResponse } from 'next/server';

export async function GET() {
  // Read env vars
  const cid = process.env.YT_CLIENT_ID || '';
  const csec = process.env.YT_CLIENT_SECRET || '';
  const rtok = process.env.YT_REFRESH_TOKEN || '';

  return NextResponse.json({
    YT_CLIENT_ID: {
      length: cid.length,
      prefix: cid.substring(0, 20),
      suffix: cid.substring(cid.length - 10),
    },
    YT_CLIENT_SECRET: {
      length: csec.length,
      prefix: csec.substring(0, 8),
    },
    YT_REFRESH_TOKEN: {
      length: rtok.length,
      prefix: rtok.substring(0, 15),
    },
    // Test the token refresh
    testRefresh: await testToken(cid, csec, rtok),
  });
}

async function testToken(cid: string, csec: string, rtok: string) {
  if (!cid || !csec || !rtok) return { error: 'missing values' };
  
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cid,
        client_secret: csec,
        refresh_token: rtok,
        grant_type: 'refresh_token',
      }),
    });
    const data = await res.json();
    return {
      status: res.status,
      ok: res.ok,
      error: data.error || null,
    };
  } catch (err: any) {
    return { error: err.message };
  }
}
