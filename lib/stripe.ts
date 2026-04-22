import 'server-only';
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia' as any,
  appInfo: {
    name: 'PolyHedge',
    version: '0.1.0',
  },
});
