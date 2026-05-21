"use client";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  remainingUses?: number;
}

export function UpgradePrompt({
  isOpen,
  onClose,
  remainingUses,
}: UpgradePromptProps) {
  const [showPricing, setShowPricing] = useState(false);

  if (showPricing) {
    return (
      <Dialog onOpenChange={setShowPricing} open={showPricing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription className="text-center">
              Unlock unlimited data analysis and premium features
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-2 text-3xl font-bold">$0</p>
              <p className="text-sm text-muted-foreground">per month</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 5 analyses per day
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 1 dataset at a time
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Basic AI models
                </li>
              </ul>
            </div>
            <div className="rounded-xl border-2 border-primary bg-primary/5 p-6">
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-2 text-3xl font-bold">$29</p>
              <p className="text-sm text-muted-foreground">per month</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Unlimited analyses
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 20 datasets
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> All AI models
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Export charts & data
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Priority support
                </li>
              </ul>
              <Button className="mt-4 w-full" disabled>
                Coming soon
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            {remainingUses === 0
              ? "Daily limit reached"
              : `${remainingUses} uses remaining today`}
          </DialogTitle>
          <DialogDescription className="text-center">
            {remainingUses === 0
              ? "You've used all your free analyses for today. Upgrade to Pro for unlimited access."
              : "You're on the free plan with 5 analyses per day. Upgrade for unlimited access."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => setShowPricing(true)}
            variant="default"
          >
            Upgrade to Pro
          </Button>
          <Button className="flex-1" onClick={onClose} variant="outline">
            {remainingUses === 0 ? "Maybe later" : "Continue free"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
