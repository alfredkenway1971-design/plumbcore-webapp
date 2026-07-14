import { NextResponse } from 'next/server';

export async function GET() {
  const results: string[] = [];
  
  const API_KEY = process.env.AGENTMAIL_API_KEY || '';
  const FROM_INBOX = process.env.AGENTMAIL_FROM_INBOX || '';
  
  results.push(`AGENTMAIL_API_KEY set: ${API_KEY ? 'YES (len=' + API_KEY.length + ')' : 'NO'}`);
  results.push(`AGENTMAIL_FROM_INBOX set: ${FROM_INBOX || 'NO'}`);
  
  if (!API_KEY || !FROM_INBOX) {
    return NextResponse.json({ error: 'Missing env vars', results });
  }
  
  try {
    const res = await fetch(`https://api.agentmail.to/v0/inboxes/${FROM_INBOX}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: ['amer.niyonzima@gmail.com'],
        subject: 'Vercel AgentMail Test',
        html: '<p>Test from Vercel deployment</p>',
        text: 'Test from Vercel deployment',
      }),
    });
    
    results.push(`AgentMail response status: ${res.status}`);
    const body = await res.text();
    results.push(`AgentMail response body: ${body}`);
    
    if (res.ok) return NextResponse.json({ success: true, results });
    return NextResponse.json({ success: false, results });
  } catch (err: any) {
    results.push(`Error: ${err.message}`);
    return NextResponse.json({ success: false, results });
  }
}
