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
