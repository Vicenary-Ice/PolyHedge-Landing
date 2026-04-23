import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPostHogClient } from '@/lib/posthog-server';

export async function POST(req: Request) {
  try {
    const { priceStr, planName } = await req.json();
    const amount = Number(priceStr);

    if (amount === 0) {
      return NextResponse.json({ url: '/auth' }); // Free tier skips payment
    }

    const productId = planName === 'Quant'
      ? process.env.STRIPE_PRODUCT_ID_QUANT
      : process.env.STRIPE_PRODUCT_ID_TRADER;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product: productId,
            unit_amount: amount * 100,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `https://www.polyhedgedata.com/auth?paid=true&plan=${planName}`,
      cancel_url: `https://www.polyhedgedata.com/pricing`,
    });

    if (!session.url) throw new Error('No session URL returned from Stripe');

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: session.id,
      event: 'checkout_session_created',
      properties: { plan_name: planName, price_usd: amount, stripe_session_id: session.id },
    });
    await posthog.flush();

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: err.message || 'Stripe error' }, { status: 500 });
  }
}
