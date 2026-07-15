/**
 * SMS notification service using Twilio
 * 
 * Setup: Add to env:
 *   TWILIO_ACCOUNT_SID=ACxxx
 *   TWILIO_AUTH_TOKEN=xxx
 *   TWILIO_PHONE_NUMBER=+15551234567
 */

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || '';

export async function sendSms(to: string, body: string): Promise<boolean> {
  if (!TWILIO_SID || !TWILIO_TOKEN) {
    console.log('[SMS DISABLED] Would send to ' + to + ': ' + body.substring(0, 60));
    return false;
  }

  // Normalize phone to E.164 (+1XXXXXXXXXX)
  const normalized = to.replace(/\D/g, '');
  const formatted = normalized.startsWith('1') ? '+' + normalized : '+1' + normalized;

  try {
    const auth = Buffer.from(TWILIO_SID + ':' + TWILIO_TOKEN).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formatted,
        From: TWILIO_FROM,
        Body: body,
      }),
    });

    if (!res.ok) {
      console.error('Twilio error:', await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error('SMS send failed:', err);
    return false;
  }
}

/* ── Templates ── */

export function leadSmsTemplate(opts: { customerName: string; address: string; estimate: number; diagnosis: string; leadId: string }) {
  return `🔔 New PlumbCore Lead!
${opts.customerName} · ${opts.address}
${opts.diagnosis}
$${opts.estimate} est. · Reply ACCEPT ${opts.leadId.slice(-6)} or login to dashboard`;
}

export function leadAcceptedSmsTemplate(opts: { customerName: string; phone: string }) {
  return `✅ Lead accepted! ${opts.customerName} · ${opts.phone}
Job created in your schedule. Login to view details.`;
}

export function customerDepositSmsTemplate(customerName: string, depositAmount: number, trackingToken: string) {
  return `Your $${depositAmount} deposit is confirmed. It will be deducted from your final bill. Track: plumbcore.ai/track/${trackingToken}`;
}

export function weeklyPayoutSmsTemplate(plumberName: string, totalDeposits: number, jobCount: number) {
  return `This week's deposits: $${totalDeposits} transferred to your bank for ${jobCount} jobs.`;
}
