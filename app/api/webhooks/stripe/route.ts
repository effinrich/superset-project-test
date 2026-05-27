import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { getStripe } from "@/lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature") ?? "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.subscription) {
          const subscriptionResult = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const subscriptionData = subscriptionResult as unknown as {
            id: string;
            items: { data: Array<{ price: { id: string } }> };
            current_period_end: number;
            status: string;
          };

          const userId = session.metadata?.userId;

          if (userId) {
            // Update subscription
            await db
              .update(subscription)
              .set({
                stripeSubscriptionId: subscriptionData.id,
                stripePriceId: subscriptionData.items.data[0]?.price.id,
                stripeCurrentPeriodEnd: new Date(
                  subscriptionData.current_period_end * 1000
                ),
                status: subscriptionData.status as
                  | "active"
                  | "canceled"
                  | "incomplete"
                  | "past_due",
                plan: "pro",
                updatedAt: new Date(),
              })
              .where(eq(subscription.userId, userId));
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string;
        };

        if (invoice.subscription) {
          const subscriptionResult = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );

          const subscriptionData = subscriptionResult as unknown as {
            id: string;
            items: { data: Array<{ price: { id: string } }> };
            current_period_end: number;
            status: string;
          };

          // Find subscription by stripeSubscriptionId
          const existingSub = await db
            .select()
            .from(subscription)
            .where(eq(subscription.stripeSubscriptionId, subscriptionData.id))
            .limit(1);

          if (existingSub.length > 0) {
            await db
              .update(subscription)
              .set({
                stripePriceId: subscriptionData.items.data[0]?.price.id,
                stripeCurrentPeriodEnd: new Date(
                  subscriptionData.current_period_end * 1000
                ),
                status: subscriptionData.status as
                  | "active"
                  | "canceled"
                  | "incomplete"
                  | "past_due",
                updatedAt: new Date(),
              })
              .where(eq(subscription.id, existingSub[0].id));
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscriptionData = event.data.object as Stripe.Subscription;

        const existingSub = await db
          .select()
          .from(subscription)
          .where(eq(subscription.stripeSubscriptionId, subscriptionData.id))
          .limit(1);

        if (existingSub.length > 0) {
          await db
            .update(subscription)
            .set({
              status: "canceled",
              plan: "free",
              updatedAt: new Date(),
            })
            .where(eq(subscription.id, existingSub[0].id));
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
