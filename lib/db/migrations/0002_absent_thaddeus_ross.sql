CREATE TABLE IF NOT EXISTS "Subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"stripeCustomerId" text NOT NULL,
	"stripeSubscriptionId" text,
	"stripePriceId" text,
	"stripeCurrentPeriodEnd" timestamp,
	"status" varchar DEFAULT 'incomplete' NOT NULL,
	"plan" varchar DEFAULT 'free' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
