import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const TB = process.env['TELEGRAM_BOT_TOKEN'] || '';
const TC = process.env['TELEGRAM_CHAT_ID'] || '8159594758';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

export async function GET() {
  const configured = !!(TB && TC);
  return NextResponse.json({ configured }, { headers: CORS });
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: 'message required' }, { status: 400, headers: CORS });
    if (!TB) return NextResponse.json({ error: 'Telegram not configured' }, { status: 400, headers: CORS });

    const r = await fetch(`https://api.telegram.org/bot${TB}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: parseInt(TC), text: message, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(5000),
    });
    const d = await r.json();
    return NextResponse.json(d.ok ? { success: true } : { error: d.description }, { headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
