/**
 * Sent.dm webhook handler for PlumbCore
 * Receives delivery status updates (sent, delivered, read, failed)
 */

import { NextRequest, NextResponse } from 'next/server';

// Verify webhook signature
function verifySignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  // Sent signs with HMAC-SHA256 of the raw body
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-sent-signature');
  const secret = process.env.SENT_WEBHOOK_SECRET || '';

  // Verify in production
  if (process.env.VERCEL_ENV === 'production' && secret) {
    if (!verifySignature(body, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  try {
    const event = JSON.parse(body);

    switch (event.type) {
      case 'message.sent':
        console.log(`[Sent] Message ${event.message_id} sent via ${event.channel}`);
        break;
      case 'message.delivered':
        console.log(`[Sent] Message ${event.message_id} delivered ✓`);
        // TODO: Update job/lead status in DB
        break;
      case 'message.read':
        console.log(`[Sent] Message ${event.message_id} read ✓`);
        break;
      case 'message.failed':
        console.error(`[Sent] Message ${event.message_id} failed: ${event.error}`);
        break;
      default:
        console.log(`[Sent] Unknown event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Sent] Webhook parse error:', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
