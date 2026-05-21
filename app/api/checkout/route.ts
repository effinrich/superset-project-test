import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { subscription, user } from "@/lib/db/schema";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const existingSubscription = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, session.user.id))
      .limit(1);

    let customerId: string;

    if (
      existingSubscription.length > 0 &&
      existingSubscription[0].stripeCustomerId
    ) {
      customerId = existingSubscription[0].stripeCustomerId;
    } else {
      // Get user email
      const userData = await db
        .select()
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

      const customer = await stripe.customers.create({
        email: userData[0]?.email ?? undefined,
        metadata: {
          userId: session.user.id,
        },
      });

      customerId = customer.id;

      // Create subscription record
      if (existingSubscription.length === 0) {
        await db.insert(subscription).values({
          userId: session.user.id,
          stripeCustomerId: customerId,
          status: "incomplete",
          plan: "free",
        });
      } else {
        await db
          .update(subscription)
          .set({
            stripeCustomerId: customerId,
            updatedAt: new Date(),
          })
          .where(eq(subscription.userId, session.user.id));
      }
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/?canceled=true`,
      subscription_data: {
        metadata: {
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
