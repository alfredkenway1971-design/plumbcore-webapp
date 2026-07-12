/**
 * POST /api/leads/expire
 * Cron endpoint: marks expired leads as "expired" and auto-refunds via Stripe
 * 
 * Run via cron: curl -X POST https://plumbcore-ai.vercel.app/api/leads/expire
 */

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';

export async function POST() {
  try {
    const admin = getAdminClient();
    if (!admin) return NextResponse.json({ message: 'DB not configured' });

    // Find all pending leads that have expired
    const { data: expiredLeads } = await (admin as any)
      .from('leads')
      .select('*')
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (!expiredLeads || expiredLeads.length === 0) {
      return NextResponse.json({ message: 'No expired leads', expired: 0 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' as any });

    let refunded = 0;

    for (const lead of expiredLeads) {
      try {
        // Mark as expired
        await (admin as any).from('leads').update({ status: 'expired' }).eq('id', lead.id);
        console.log(`⏰ Lead ${lead.id} expired`);

        // Auto-refund via Stripe
        if (lead.stripe_session_id && lead.deposit_paid > 0) {
          try {
            const session = await stripe.checkout.sessions.retrieve(lead.stripe_session_id);
            const paymentIntentId = session.payment_intent as string;

            if (paymentIntentId) {
              await stripe.refunds.create({ payment_intent: paymentIntentId });
              await (admin as any).from('leads').update({ status: 'refunded' }).eq('id', lead.id);
              console.log(`💰 Refunded $${lead.deposit_paid} for lead ${lead.id}`);
              refunded++;
            }
          } catch (stripeErr: any) {
            console.error(`  → Stripe refund failed for ${lead.id}:`, stripeErr.message);
          }
        }

        // Notify customer
        if (lead.customer_email) {
          await sendEmail({
            to: lead.customer_email,
            subject: 'Your PlumbCore AI estimate — next steps',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #64748B, #475569); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 20px;">Estimate Update</h1>
                </div>
                <div style="padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                  <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi ${lead.customer_name},</p>
                  <p style="color: #334155; font-size: 16px; line-height: 1.6;">Unfortunately, no PlumbCore technician was available in your area within the expected timeframe. Your deposit has been refunded and should appear in your account within 5-10 business days.</p>
                  <p style="color: #334155; font-size: 16px; line-height: 1.6;">We've saved your estimate and will notify you when a technician becomes available. You can also call us at <strong>(555) 123-4567</strong> for immediate assistance.</p>
                </div>
              </div>
            `,
          });
          console.log(`  → Notified ${lead.customer_email} of expiry`);
        }
      } catch (err: any) {
        console.error(`Failed to expire lead ${lead.id}:`, err.message);
      }
    }

    return NextResponse.json({
      message: `Expired ${expiredLeads.length} leads`,
      expired: expiredLeads.length,
      refunded,
    });
  } catch (err: any) {
    console.error('Expire endpoint error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
