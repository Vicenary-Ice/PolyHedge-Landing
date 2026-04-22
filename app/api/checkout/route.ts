import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { priceStr, planName } = await req.json();
    const amount = Number(priceStr);

    if (amount === 0) {
      return NextResponse.json({ url: '/auth' }); // Free tier skips payment
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product: process.env.STRIPE_PRODUCT_ID,
            unit_amount: amount * 100, // dollars to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `http://localhost:3000/auth?paid=true&plan=${planName}`,
      cancel_url: `http://localhost:3000/pricing`,
    });

    if (!session.url) throw new Error('No session URL returned from Stripe');

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
