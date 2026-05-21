"use client";

import { useCallback, useEffect, useState } from "react";

interface SubscriptionData {
  plan: string;
  status: string;
  isPro: boolean;
  currentPeriodEnd?: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    try {
      const response = await fetch("/api/subscription");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Failed to check subscription:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const isPro = subscription?.isPro ?? false;

  return {
    subscription,
    isPro,
    isLoading,
    checkSubscription,
  };
}
