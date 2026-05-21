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
    setIsLoading(false);
  }, []);

  const incrementUsage = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setUsage((prev) => {
      const newUsage =
        prev.date === today
          ? { date: today, count: prev.count + 1 }
          : { date: today, count: 1 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
      return newUsage;
    });
  }, []);

  const canUseFeature = useCallback(() => {
    if (isLoading) {
      return false;
    }
    return usage.count < DAILY_LIMIT;
  }, [usage.count, isLoading]);

  const remainingUses = DAILY_LIMIT - usage.count;
  const hasReachedLimit = usage.count >= DAILY_LIMIT;

  return {
    usage,
    incrementUsage,
    canUseFeature,
    remainingUses,
    hasReachedLimit,
    isLoading,
    dailyLimit: DAILY_LIMIT,
  };
}
