import { NextResponse } from 'next/server';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' as any });

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`⚡ Stripe webhook received: ${event.type}`);

    // Import dynamically to avoid circular deps
    const { updateUserSubscription } = await import('@/lib/custom-auth');
    const { sendEmail, subscriptionPastDueEmail, depositConfirmationEmail, adminNotificationEmail } = await import('@/lib/email');
    const { getAdminClient } = await import('@/lib/supabase-admin');

    const priceMap: Record<string, string> = {
      'price_1TrEh8D0AAcByeQ9hCRJDqHs': 'solo',   // Solo $349/mo
      'price_1TrEhCD0AAcByeQ9ERNDiEHS': 'pro',      // Pro $799/mo
      'price_1TrEhED0AAcByeQ9yyeuUONo': 'business', // Business $1,499/mo
      // Legacy prices (keep for existing subscribers)
      'price_1TqFwHD0AAcByeQ9qNUaikbx': 'solo',
      'price_1TqFwOD0AAcByeQ94DnPlHr1': 'pro',
      'price_1TqFwPD0AAcByeQ9SjTdf8VF': 'pro',
      'price_1TqFwVD0AAcByeQ90c6KWdEJ': 'business',
      'price_1TqFwXD0AAcByeQ9vJ2OGA8G': 'enterprise',
    };

    /**
     * Extract email from a Stripe event object by fetching the customer
     */
    async function getCustomerEmail(customerId: string): Promise<string | null> {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        return (customer as any).email || null;
      } catch {
        return null;
      }
    }

    /**
     * Extract the tier from subscription items
     */
    function getTierFromSubscription(sub: any): string {
      const priceId = sub.items?.data?.[0]?.price?.id || '';
      return priceMap[priceId] || 'solo';
    }

    /**
     * Get customer name from Stripe
     */
    async function getCustomerName(customerId: string): Promise<string> {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        return (customer as any).name || 'Valued Customer';
      } catch {
        return 'Valued Customer';
      }
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const customerEmail = session.customer_details?.email;
        const metadata = session.metadata || {};
        const isDeposit = session.mode === 'payment' && metadata.quoteType === 'deposit';

        /* ── Deposit payment (quote page $49 deposit) ── */
        if (isDeposit) {
          const customerName = metadata.customer_name || session.customer_details?.name || 'Customer';
          const customerPhone = metadata.customer_phone || '';
          const diagnosis = metadata.diagnosis || '';
          const severity = metadata.severity || '';
          const totalEstimate = parseFloat(metadata.totalEstimate || '0');
          const companySlug = metadata.companySlug || '';
          const customerAddress = metadata.customerAddress || '';
          const customerCity = metadata.customerCity || '';
          const amountPaid = (session.amount_total || 4900) / 100;

          console.log(`💰 Deposit paid: $${amountPaid} — ${customerEmail} (${customerName})`);
          console.log(`  → Estimate: $${totalEstimate} | ${diagnosis} | ${severity}`);

          // 1. Create lead (or direct job for white-label)
          const admin = getAdminClient();

          // White-label: job goes directly to that plumber
          if (companySlug && companySlug !== 'plumbcore') {
            if (admin) {
              try {
                const { data: company } = await (admin as any)
                  .from('companies')
                  .select('id, owner_id')
                  .eq('slug', companySlug)
                  .single();

                if (company) {
                  await (admin as any).from('jobs').insert({
                    company_id: company.id,
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                    customer_address: customerAddress,
                    diagnosis,
                    severity,
                    total_estimate: totalEstimate,
                    deposit_paid: amountPaid,
                    deposit_stripe_id: session.id,
                    status: 'deposit_paid',
                  });
                  console.log(`  → White-label job created for ${companySlug}`);
                }
              } catch (err: any) {
                console.error('  → White-label job creation failed:', err.message);
              }
            }
          } else {
            // Marketplace: create lead for routing
            if (admin) {
              try {
                const now = new Date();
                const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h

                const { data: lead, error: leadErr } = await (admin as any)
                  .from('leads')
                  .insert({
                    stripe_session_id: session.id,
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                    customer_address: customerAddress,
                    diagnosis,
                    severity,
                    total_estimate: totalEstimate,
                    deposit_paid: amountPaid,
                    status: 'pending',
                    created_at: now.toISOString(),
                    expires_at: expiresAt.toISOString(),
                  })
                  .select('id')
                  .single();

                if (leadErr) {
                  console.error('  → Failed to create lead:', leadErr.message);
                } else if (lead) {
                  console.log(`  → Lead created: ${lead.id} — triggering routing`);
                  // Trigger routing asynchronously
                  fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://plumbcore-ai.vercel.app'}/api/leads/route`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leadId: lead.id }),
                  }).catch(() => {});
                }
              } catch (err: any) {
                console.error('  → Lead creation failed:', err.message);
              }
            } else {
              console.log('  → Supabase not configured — skipping lead creation');
            }
          }

          // 2. Send confirmation email to customer
          if (customerEmail) {
            const confirmEmail = depositConfirmationEmail({
              customerName,
              diagnosis,
              totalEstimate,
              amountPaid,
              companySlug,
            });
            await sendEmail({ to: customerEmail, subject: confirmEmail.subject, html: confirmEmail.html });
            console.log(`  → Sent confirmation to ${customerEmail}`);
          }

          // 3. Notify admin
          const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'amer.niyonzima@gmail.com';
          const adminNote = adminNotificationEmail({
            customerName,
            customerEmail,
            customerPhone,
            diagnosis,
            totalEstimate,
            amountPaid,
            companySlug,
            customerAddress,
            customerCity,
          });
          await sendEmail({ to: adminEmail, subject: adminNote.subject, html: adminNote.html });
          console.log(`  → Notified admin at ${adminEmail}`);

          break;
        }

        /* ── Subscription checkout ── */
        console.log(`✅ New subscription: ${subscriptionId} — customer: ${customerEmail} (${customerId})`);

        // Fetch the subscription to get the tier
        if (subscriptionId && customerEmail) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const tier = getTierFromSubscription(subscription);

            await updateUserSubscription(customerEmail, {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionTier: tier,
              subscriptionStatus: subscription.status,
            });
            console.log(`  → Updated ${customerEmail} to ${tier} plan (${subscription.status})`);
          } catch (err) {
            console.error('  → Failed to process checkout:', err);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        const tier = getTierFromSubscription(subscription);
        console.log(`🔄 Subscription updated: ${subscriptionId} — status: ${status}, tier: ${tier}`);

        // Find the customer email
        const email = await getCustomerEmail(customerId);
        if (email) {
          await updateUserSubscription(email, {
            stripeSubscriptionId: subscriptionId,
            subscriptionTier: tier,
            subscriptionStatus: status,
          });
          console.log(`  → Updated ${email} to ${tier} (${status})`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const subscriptionId = subscription.id;
        console.log(`❌ Subscription cancelled: ${subscriptionId}`);

        const email = await getCustomerEmail(customerId);
        const name = await getCustomerName(customerId);
        if (email) {
          await updateUserSubscription(email, {
            stripeSubscriptionId: '',
            subscriptionTier: '',
            subscriptionStatus: 'cancelled',
          });
          console.log(`  → Marked ${email} as cancelled`);

          // Send cancellation email
          const billingUrl = 'https://plumbcore-ai.vercel.app/billing';
          const cancelledEmail = {
            subject: 'Your PlumbCore AI subscription has been cancelled',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #64748B, #475569); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 22px;">Subscription Cancelled</h1>
                </div>
                <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                  <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
                  <p style="color: #334155; font-size: 16px; line-height: 1.6;">Your PlumbCore AI subscription has been cancelled. You can still access your account until the end of your current billing period.</p>
                  <p style="color: #334155; font-size: 16px; line-height: 1.6;">If you'd like to reactivate, click below:</p>
                  <a href="${billingUrl}" style="display: inline-block; padding: 12px 32px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">Reactivate Subscription</a>
                </div>
              </div>
            `,
          };
          await sendEmail({ to: email, subject: cancelledEmail.subject, html: cancelledEmail.html });
          console.log(`  → Sent cancellation notice to ${email}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const amount = invoice.amount_paid / 100;
        const currency = invoice.currency.toUpperCase();
        console.log(`💰 Payment received: ${amount} ${currency} — ${invoice.customer_email || 'no email'}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerEmail = invoice.customer_email || (await getCustomerEmail(invoice.customer));
        const customerName = invoice.customer_name || (await getCustomerName(invoice.customer));
        console.log(`⚠️ Payment failed: ${customerEmail || 'unknown'} — attempt ${invoice.attempt_count}`);

        if (customerEmail) {
          await updateUserSubscription(customerEmail, {
            subscriptionStatus: 'past_due',
          });
          console.log(`  → Marked ${customerEmail} as past_due`);

          // Send past due email
          const billingUrl = 'https://plumbcore-ai.vercel.app/billing';
          const emailContent = subscriptionPastDueEmail(customerName, billingUrl);
          await sendEmail({ to: customerEmail, subject: emailContent.subject, html: emailContent.html });
          console.log(`  → Sent past due notice to ${customerEmail}`);
        }
        break;
      }

      default:
        console.log(`📬 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
