/**
 * Email relay — sends emails via AgentMail (configured on PlumbCore)
 * Called by the Factory frontend or backup API.
 */
import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const AGENTMAIL_API_KEY = process.env.AGENTMAIL_API_KEY || '';
const AGENTMAIL_FROM = process.env.AGENTMAIL_FROM_INBOX || '';
const APPROVAL_EMAIL = process.env.APPROVAL_EMAIL || '';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

export async function GET() {
  const configured = !!(AGENTMAIL_API_KEY && AGENTMAIL_FROM && APPROVAL_EMAIL);
  return NextResponse.json({ configured, email: APPROVAL_EMAIL }, { headers: CORS });
}

export async function POST(req: Request) {
  try {
    const { subject, htmlBody, to } = await req.json();
    if (!subject || !htmlBody) {
      return NextResponse.json({ error: 'subject and htmlBody required' }, { status: 400, headers: CORS });
    }
    if (!AGENTMAIL_API_KEY || !AGENTMAIL_FROM) {
      return NextResponse.json({ error: 'AgentMail not configured on PlumbCore' }, { status: 400, headers: CORS });
    }

    const r = await fetch('https://api.agentmail.to/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AGENTMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { email: AGENTMAIL_FROM, name: 'Social Media Factory' },
        to: [{ email: to || APPROVAL_EMAIL }],
        subject,
        htmlBody,
      }),
    });
    const d = await r.json();
    if (r.ok) return NextResponse.json({ success: true, id: d.id }, { headers: CORS });
    return NextResponse.json({ error: d.error || d.message || 'Send failed' }, { status: 400, headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
