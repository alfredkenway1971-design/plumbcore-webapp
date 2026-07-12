/**
 * Email service using Resend API
 *
 * Setup: Get a free API key at https://resend.com and add to env:
 *   RESEND_API_KEY=re_xxxxxxxxxxxx
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log('[EMAIL DISABLED] Would send to ' + to + ': ' + subject);
    return false;
  }

  try {
    const authHeader = 'Bearer ' + RESEND_API_KEY;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PlumbCore AI <noreply@plumbcore.ai>',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend API error:', err);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
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
}

export function depositConfirmationEmail({ customerName, diagnosis, totalEstimate, amountPaid }: DepositEmailParams): { subject: string; html: string } {
  const balance = totalEstimate - amountPaid;
  return {
    subject: `✅ Deposit confirmed — Your PlumbCore AI estimate`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #06B6D4); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Deposit Confirmed! 🎉</h1>
        </div>
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi ${customerName},</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Your <strong>$${amountPaid.toFixed(2)} deposit</strong> has been received. A PlumbCore technician will contact you shortly to schedule your service.</p>
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Diagnosis:</strong> ${diagnosis}</p>
            <p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Estimate Total:</strong> $${totalEstimate.toFixed(2)}</p>
            <p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Deposit Paid:</strong> $${amountPaid.toFixed(2)}</p>
            <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Remaining Balance:</strong> $${balance.toFixed(2)}</p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">The deposit is fully refundable and will be deducted from your final bill. If you have any questions, reply to this email.</p>
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
