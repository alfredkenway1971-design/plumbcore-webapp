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

    const priceMap: Record<string, string> = {
      'price_1TqFwHD0AAcByeQ9qNUaikbx': 'solo',
      'price_1TqFwOD0AAcByeQ94DnPlHr1': 'team',
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

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const customerEmail = session.customer_details?.email;
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
        if (email) {
          await updateUserSubscription(email, {
            stripeSubscriptionId: '',
            subscriptionTier: '',
            subscriptionStatus: 'cancelled',
          });
          console.log(`  → Marked ${email} as cancelled`);
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
        console.log(`⚠️ Payment failed: ${customerEmail || 'unknown'} — attempt ${invoice.attempt_count}`);

        if (customerEmail) {
          await updateUserSubscription(customerEmail, {
            subscriptionStatus: 'past_due',
          });
          console.log(`  → Marked ${customerEmail} as past_due`);
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
