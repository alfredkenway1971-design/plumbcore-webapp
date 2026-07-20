/**
 * Sent.dm unified messaging service for PlumbCore
 * Routes messages across SMS, WhatsApp, and RCS automatically.
 * 
 * API key comes from the calling context (per-request pattern).
 * Env: SENT_API_KEY for server-side operations.
 * 
 * Docs: https://docs.sent.dm
 * SDK: @sentdm/sentdm
 */

import SentDm from '@sentdm/sentdm';

/* ── Types ── */

export interface SentRecipient {
  id: string;
  to: string;
  channel: 'sms' | 'whatsapp' | 'rcs';
  body?: string;
}

export interface SentResult {
  success: boolean;
  status?: string;
  templateId?: string;
  templateName?: string;
  recipients: SentRecipient[];
  error?: string;
}

export interface SentMessageInput {
  to: string[];
  channel?: ('sms' | 'whatsapp' | 'rcs')[];
  template?: {
    id?: string;
    name?: string;
    parameters: Record<string, string>;
  };
  sandbox?: boolean;
}

/* ── Client Factory ── */

let cachedKey = '';

export function setSentApiKey(key: string) {
  cachedKey = key;
}

function getClient(): SentDm {
  const key = cachedKey || process.env.SENT_API_KEY || '';
  return new SentDm({ apiKey: key, maxRetries: 2, timeout: 15_000 });
}

/* ── Send Message ── */

export async function sendMessage(input: SentMessageInput): Promise<SentResult> {
  try {
    const client = getClient();
    const response = await client.messages.send({
      to: input.to,
      channel: input.channel,
      template: input.template,
      sandbox: input.sandbox ?? false,
    });

    const data = (response as any).data ?? {};
    const recipients: SentRecipient[] = (data.recipients ?? []).map((r: any) => ({
      id: r.message_id,
      to: r.to,
      channel: r.channel,
      body: r.body,
    }));

    return {
      success: true,
      status: data.status,
      templateId: data.template_id,
      templateName: data.template_name,
      recipients,
    };
  } catch (err: any) {
    console.error('[Sent] Send failed:', err?.message || err);
    return {
      success: false,
      recipients: [],
      error: err?.message || 'Failed to send message',
    };
  }
}

/* ── Verify API Key ── */

export async function verifyApiKey(key: string): Promise<{ valid: boolean; account?: any }> {
  try {
    const baseUrl = process.env.SENT_BASE_URL ?? 'https://api.sent.dm';
    const res = await fetch(`${baseUrl}/v3/me`, {
      headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (res.ok) return { valid: true, account: data };
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

/* ── PlumbCore Templates ── */

export const TEMPLATES = {
  LEAD_ALERT: {
    name: 'plumbcore_lead_alert',
    label: 'New Lead Alert',
    description: 'Sent to plumber when a new lead comes in',
  },
  BOOKING_CONFIRMED: {
    name: 'plumbcore_booking_confirmed',
    label: 'Booking Confirmed',
    description: 'Sent to customer when booking is confirmed',
  },
  STATUS_UPDATE: {
    name: 'plumbcore_status_update',
    label: 'Status Update',
    description: 'Job status change notification',
  },
  DEPOSIT_CONFIRMED: {
    name: 'plumbcore_deposit_confirmed',
    label: 'Deposit Confirmed',
    description: 'Sent when deposit is received',
  },
} as const;

/* ── PlumbCore Notification Helpers ── */

export async function notifyPlumberNewLead(params: {
  plumberPhone: string;
  customerName: string;
  address: string;
  diagnosis: string;
  estimate: number;
  leadId: string;
}) {
  return sendMessage({
    to: [params.plumberPhone],
    template: {
      name: TEMPLATES.LEAD_ALERT.name,
      parameters: {
        '1': params.customerName,
        '2': params.address,
        '3': params.diagnosis,
        '4': `$${params.estimate}`,
        '5': params.leadId.slice(-6),
      },
    },
  });
}

export async function notifyCustomerBookingConfirmed(params: {
  customerPhone: string;
  customerName: string;
  date: string;
  time: string;
  plumberName: string;
}) {
  return sendMessage({
    to: [params.customerPhone],
    template: {
      name: TEMPLATES.BOOKING_CONFIRMED.name,
      parameters: {
        '1': params.customerName,
        '2': params.date,
        '3': params.time,
        '4': params.plumberName,
      },
    },
  });
}

export async function notifyStatusUpdate(params: {
  phone: string;
  customerName: string;
  status: string;
  jobId: string;
}) {
  return sendMessage({
    to: [params.phone],
    template: {
      name: TEMPLATES.STATUS_UPDATE.name,
      parameters: {
        '1': params.customerName,
        '2': params.status,
        '3': params.jobId.slice(-6),
      },
    },
  });
}

export async function notifyDepositConfirmed(params: {
  phone: string;
  customerName: string;
  amount: number;
}) {
  return sendMessage({
    to: [params.phone],
    template: {
      name: TEMPLATES.DEPOSIT_CONFIRMED.name,
      parameters: {
        '1': params.customerName,
        '2': `$${params.amount}`,
      },
    },
  });
}
