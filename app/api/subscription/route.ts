import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userSubscription = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, session.user.id))
      .limit(1);

    if (userSubscription.length === 0) {
      return NextResponse.json({
        plan: "free",
        status: "incomplete",
        isPro: false,
      });
    }

    const sub = userSubscription[0];
    const isPro =
      sub.plan === "pro" &&
      sub.status === "active" &&
      (sub.stripeCurrentPeriodEnd
        ? new Date(sub.stripeCurrentPeriodEnd) > new Date()
        : false);

    return NextResponse.json({
      plan: sub.plan,
      status: sub.status,
      isPro,
      currentPeriodEnd: sub.stripeCurrentPeriodEnd,
    });
  } catch (error) {
    console.error("Subscription check error:", error);
    return NextResponse.json(
      { error: "Failed to check subscription" },
      { status: 500 }
    );
  }
}
