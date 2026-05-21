"use client";

import { useCallback, useEffect, useState } from "react";

const DAILY_LIMIT = 5;
const STORAGE_KEY = "dataai_usage";

interface UsageData {
  date: string;
  count: number;
}

export function useUsageLimits() {
  const [usage, setUsage] = useState<UsageData>({ date: "", count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split("T")[0];

    if (stored) {
      const data: UsageData = JSON.parse(stored);
      if (data.date === today) {
        setUsage(data);
      } else {
        setUsage({ date: today, count: 0 });
      }
    } else {
      setUsage({ date: today, count: 0 });
    }

    // Check subscription status
    fetch("/api/subscription")
      .then((res) => res.json())
      .then((data) => {
        if (data.isPro) {
          setIsPro(true);
        }
      })
      .catch(() => {
        // Ignore errors - user might not be logged in
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const incrementUsage = useCallback(() => {
    if (isPro) {
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    setUsage((prev) => {
      const newUsage =
        prev.date === today
          ? { date: today, count: prev.count + 1 }
          : { date: today, count: 1 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
      return newUsage;
    });
  }, [isPro]);

  const canUseFeature = useCallback(() => {
    if (isLoading) {
      return false;
    }
    if (isPro) {
      return true;
    }
    return usage.count < DAILY_LIMIT;
  }, [usage.count, isLoading, isPro]);

  const remainingUses = isPro
    ? Number.POSITIVE_INFINITY
    : DAILY_LIMIT - usage.count;
  const hasReachedLimit = !isPro && usage.count >= DAILY_LIMIT;

  return {
    usage,
    incrementUsage,
    canUseFeature,
    remainingUses,
    hasReachedLimit,
    isLoading,
    dailyLimit: DAILY_LIMIT,
    isPro,
  };
}
