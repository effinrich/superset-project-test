import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeClient = new Stripe(apiKey, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return stripeClient;
}

// Lazy export - only use getStripe() in runtime code
export const stripe = null as unknown as Stripe;
