/**
 * Email service — supports AgentMail (primary) and Resend (fallback)
 *
 * All env vars read at call time for Vercel serverless compatibility.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using AgentMail (primary) or Resend (fallback)
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  // Read env vars at CALL TIME (not module load time) for Vercel compatibility
  const agentmailKey = process.env.AGENTMAIL_API_KEY || '';

  // Try AgentMail first
  if (agentmailKey) {
    return sendViaAgentMail(agentmailKey, to, subject, html, text);
  }

  // Fallback to Resend
  const resendKey = process.env.RESEND_API_KEY || '';
  if (resendKey) {
    return sendViaResend(resendKey, to, subject, html, text);
  }

  console.log('[EMAIL DISABLED] Would send to ' + to + ': ' + subject);
  return false;
}

/**
 * Send via AgentMail API
 */
async function sendViaAgentMail(apiKey: string, to: string, subject: string, html: string, text?: string): Promise<boolean> {
  const AGENTMAIL_BASE = 'https://api.agentmail.to/v0';
  const resendKey = process.env.RESEND_API_KEY || '';

  try {
    let inboxId = process.env.AGENTMAIL_FROM_INBOX || '';

    // If no inbox configured, create one on the fly
    if (!inboxId) {
      const created = await createDefaultInbox(apiKey);
      if (!created) {
        console.warn('[AgentMail] Could not create inbox');
        if (resendKey) return sendViaResend(resendKey, to, subject, html, text);
        return false;
      }
      inboxId = created;
    }

    const res = await fetch(`${AGENTMAIL_BASE}/inboxes/${encodeURIComponent(inboxId)}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[AgentMail] Send error:', res.status, errBody);
      if (resendKey) return sendViaResend(resendKey, to, subject, html, text);
      return false;
    }

    console.log('[AgentMail] Email sent to', to);
    return true;
  } catch (err) {
    console.error('[AgentMail] Failed to send:', err);
    if (resendKey) return sendViaResend(resendKey, to, subject, html, text);
    return false;
  }
}

let _defaultInboxId: string | null = null;

async function createDefaultInbox(apiKey: string): Promise<string | null> {
  if (_defaultInboxId) return _defaultInboxId;
  const AGENTMAIL_BASE = 'https://api.agentmail.to/v0';

  try {
    // Try existing
    const listRes = await fetch(`${AGENTMAIL_BASE}/inboxes?limit=10`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (listRes.ok) {
      const list = await listRes.json();
      if (list.inboxes?.length > 0) {
        _defaultInboxId = list.inboxes[0].inbox_id;
        return _defaultInboxId;
      }
    }

    // Create new
    const createRes = await fetch(`${AGENTMAIL_BASE}/inboxes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'plumbcore',
        domain: 'agentmail.to',
        display_name: 'PlumbCore AI',
      }),
    });
    if (createRes.ok) {
      const inbox = await createRes.json();
      _defaultInboxId = inbox.inbox_id;
      return _defaultInboxId;
    }
    return null;
  } catch (err) {
    console.error('[AgentMail] Inbox setup error:', err);
    return null;
  }
}

/**
 * Send via Resend API (fallback)
 */
async function sendViaResend(apiKey: string, to: string, subject: string, html: string, text?: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'PlumbCore AI <onboarding@resend.dev>',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error('[Resend] API error:', errBody);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Resend] Failed to send:', err);
    return false;
  }
}

// ── Email Templates ──

export function welcomeEmail(name: string, companyName: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to PlumbCore AI, ' + name + '!',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #06B6D4); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to PlumbCore AI!</h1>
        </div>
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Your <strong>${companyName}</strong> account is ready! Here's what you can do next:</p>
          <ul style="color: #475569; font-size: 15px; line-height: 1.8; padding-left: 20px;">
            <li>Complete your company profile in onboarding</li>
            <li>Set up your team members</li>
            <li>Configure your pricebook</li>
            <li>Try AI photo estimates</li>
          </ul>
          <a href="https://plumbcore-ai.vercel.app/dashboard" style="display: inline-block; padding: 12px 32px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 12px;">Go to Dashboard</a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">If you didn't create this account, you can ignore this email.</p>
        </div>
      </div>
    `,
  };
}

export function passwordResetEmail(resetLink: string): { subject: string; html: string } {
  return {
    subject: 'Reset your PlumbCore AI password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #06B6D4); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Reset Your Password</h1>
        </div>
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">You requested a password reset. Click the button below to set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 32px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">Reset Password</a>
          <p style="color: #64748b; font-size: 14px;">Or copy this link: <br/><span style="color: #3B82F6;">${resetLink}</span></p>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  };
}

export function subscriptionPastDueEmail(name: string, billingUrl: string): { subject: string; html: string } {
  return {
    subject: 'Payment failed - Update your billing info',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Payment Failed</h1>
        </div>
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Your latest subscription payment failed. Please update your billing information to keep your account active.</p>
          <a href="${billingUrl}" style="display: inline-block; padding: 12px 32px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">Update Billing</a>
        </div>
      </div>
    `,
  };
}

/* ── Deposit Payment Emails ── */

interface DepositEmailParams {
  customerName: string;
  diagnosis: string;
  totalEstimate: number;
  amountPaid: number;
  companySlug: string;
  leadId?: string;
  customerCity?: string;
  confidence?: number;
}

export function depositConfirmationEmail({ customerName, diagnosis, totalEstimate, amountPaid, leadId, customerCity, confidence }: DepositEmailParams): { subject: string; html: string } {
  const balance = totalEstimate - amountPaid;
  const trackingUrl = leadId
    ? `https://plumbcore-ai.vercel.app/track/${leadId}`
    : 'https://plumbcore-ai.vercel.app/track';
  const city = customerCity || 'your area';
  return {
    subject: `Your plumbing estimate is confirmed — we're finding your plumber now`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #06B6D4); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Estimate Confirmed! 🎉</h1>
          <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 8px;">We're finding you the best plumber in your area</p>
        </div>
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi ${customerName},</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Your <strong>$${amountPaid.toFixed(2)} deposit</strong> has been received. We're now matching you with a licensed plumber in <strong>${city}</strong>.</p>

          <!-- Quote Details -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e2e8f0;">
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
              <div style="width: 64px; height: 64px; border-radius: 8px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="font-size: 24px;">📸</span>
              </div>
              <div>
                <p style="margin: 0 0 4px; color: #475569; font-size: 14px;"><strong>Issue:</strong> ${diagnosis}</p>
                <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Estimated Price:</strong> $${totalEstimate.toFixed(2)}</p>
                ${confidence ? `<p style="margin: 4px 0 0; color: #475569; font-size: 14px;"><strong>AI Confidence:</strong> ${confidence}%</p>` : ''}
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Deposit Paid:</strong> $${amountPaid.toFixed(2)}</p>
                <p style="margin: 2px 0 0; font-size: 13px; color: #475569;"><strong>Balance Due:</strong> $${balance.toFixed(2)}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8;">Photo placeholder</p>
              </div>
            </div>
          </div>

          <!-- Matching Status -->
          <div style="background: #eff6ff; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #bfdbfe; text-align: center;">
            <div style="font-size: 28px; margin-bottom: 8px;">🔍</div>
            <p style="margin: 0 0 4px; color: #1e40af; font-size: 15px; font-weight: 600;">Matching you with a licensed plumber in ${city}...</p>
            <p style="margin: 0; color: #3b82f6; font-size: 13px;">We'll notify you as soon as we find the right match</p>
          </div>

          <!-- Refund Policy -->
          <div style="background: #f0fdf4; border-radius: 8px; padding: 12px; margin: 16px 0; border: 1px solid #bbf7d0;">
            <p style="margin: 0; color: #166534; font-size: 13px;">🔒 <strong>48-Hour Full Refund Guarantee</strong> — If we can't match you with a licensed plumber within 48 hours, your deposit is fully refundable. No questions asked.</p>
          </div>

          <!-- Track Button -->
          <a href="${trackingUrl}" style="display: block; text-align: center; padding: 14px 32px; background: #3B82F6; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 20px 0;">
            Track Your Plumber →
          </a>

          <p style="color: #64748b; font-size: 13px; text-align: center;">
            Need help? Call <a href="tel:+15551234567" style="color: #3B82F6; font-weight: 600; text-decoration: none;">(555) 123-4567</a>
          </p>

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 8px;">
            Track your plumber live: <a href="${trackingUrl}" style="color: #3B82F6;">${trackingUrl}</a>
          </p>

          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">The deposit will be deducted from your final bill. If you have any questions, reply to this email or call our support team.</p>
        </div>
      </div>
    `,
  };
}

/* ── Refund Notification Email ── */

interface RefundNotificationParams {
  customerName: string;
  diagnosis: string;
  totalEstimate: number;
  amountPaid: number;
  leadId: string;
  customerEmail?: string;
}

export function refundNotificationEmail({ customerName, diagnosis, totalEstimate, amountPaid, leadId }: RefundNotificationParams): { subject: string; html: string } {
  const trackingUrl = `https://plumbcore-ai.vercel.app/track/${leadId}`;
  return {
    subject: `Refund processed — We couldn't find a plumber in your area`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Refund Processed 💸</h1>
          <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 8px;">We were unable to find a matching plumber in your area</p>
        </div>
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi ${customerName},</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">We're sorry — after searching our network of licensed plumbers, we were unable to find an available match for your plumbing issue in your area.</p>

          <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Issue:</strong> ${diagnosis}</p>
            <p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Estimate Total:</strong> $${totalEstimate.toFixed(2)}</p>
            <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Deposit Refunded:</strong> $${amountPaid.toFixed(2)}</p>
          </div>

          <div style="background: #fef2f2; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #fecaca; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
            <p style="margin: 0 0 4px; color: #991b1b; font-size: 15px; font-weight: 600;">Your deposit of $${amountPaid.toFixed(2)} has been refunded</p>
            <p style="margin: 0; color: #b91c1c; font-size: 13px;">Please allow 5-10 business days for the refund to appear on your statement.</p>
          </div>

          <p style="color: #475569; font-size: 14px; line-height: 1.6;">You can try again later or contact us directly for assistance finding a plumber in your area.</p>

          <a href="${trackingUrl}" style="display: block; text-align: center; padding: 14px 32px; background: #3B82F6; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 20px 0;">
            Check Status
          </a>

          <p style="color: #64748b; font-size: 13px; text-align: center;">
            Need help? Call <a href="tel:+15551234567" style="color: #3B82F6; font-weight: 600; text-decoration: none;">(555) 123-4567</a>
          </p>

          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">We apologize for the inconvenience. If you have any questions, please reply to this email or call our support team.</p>
        </div>
      </div>
    `,
  };
}

/* ── Team Invite Email ── */
export function teamInviteEmail(params: { invitedByName: string; companyName: string; inviteLink: string; role: string }): { subject: string; html: string } {
  return {
    subject: `${params.invitedByName} invited you to join ${params.companyName} on PlumbCore AI`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #06B6D4); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">You're Invited! 🎉</h1>
        </div>
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi there,</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;"><strong>${params.invitedByName}</strong> has invited you to join <strong>${params.companyName}</strong> on PlumbCore AI as a <strong>${params.role}</strong>.</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">PlumbCore AI helps plumbing teams manage scheduling, invoicing, inventory, AI estimates, and more — all in one place.</p>
          <a href="${params.inviteLink}" style="display: inline-block; padding: 14px 36px; background: #3B82F6; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; margin: 16px 0;">Accept Invitation</a>
          <p style="color: #64748b; font-size: 13px; margin-top: 8px;">Or copy this link:<br/><span style="color: #3B82F6;">${params.inviteLink}</span></p>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">This invitation expires in 7 days. If you weren't expecting this, you can ignore this email.</p>
        </div>
      </div>
    `,
  };
}

interface AdminNotificationParams extends DepositEmailParams {
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
}

export function adminNotificationEmail({ customerName, customerEmail, customerPhone, diagnosis, totalEstimate, amountPaid, companySlug, customerAddress, customerCity }: AdminNotificationParams): { subject: string; html: string } {
  return {
    subject: `💰 New deposit: $${amountPaid} — ${customerName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981, #06B6D4); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">New Deposit Received 💰</h1>
        </div>
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0; color: #166534; font-size: 20px; font-weight: 700;">$${amountPaid.toFixed(2)}</p>
            <p style="margin: 4px 0 0; color: #166534; font-size: 13px;">deposit paid via Stripe</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 100px;">Customer:</td><td style="color: #0f172a; font-weight: 600;">${customerName}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td style="color: #3B82F6;">${customerEmail}</td></tr>
            ${customerPhone ? `<tr><td style="padding: 6px 0; color: #64748b;">Phone:</td><td style="color: #0f172a;">${customerPhone}</td></tr>` : ''}
            ${customerAddress ? `<tr><td style="padding: 6px 0; color: #64748b;">Address:</td><td style="color: #0f172a;">${customerAddress}${customerCity ? ', ' + customerCity : ''}</td></tr>` : ''}
            <tr><td style="padding: 6px 0; color: #64748b;">Diagnosis:</td><td style="color: #0f172a;">${diagnosis}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Estimate:</td><td style="color: #0f172a; font-weight: 600;">$${totalEstimate.toFixed(2)}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Company:</td><td style="color: #0f172a;">${companySlug}</td></tr>
          </table>
          <a href="https://plumbcore-ai.vercel.app/admin" style="display: inline-block; padding: 12px 32px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px;">View in Admin</a>
        </div>
      </div>
    `,
  };
}
