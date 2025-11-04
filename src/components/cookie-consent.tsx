"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent, type ConsentDecision } from "@/lib/consent";
import {
  loadGAScript,
  setDefaultDeniedConsentEarly,
  updateGtagConsent,
} from "@/lib/gtag";

// Public env var for GA4 Measurement ID (e.g., G-XXXXXX)
const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS as string | undefined;

export default function CookieConsent() {
  // Avoid SSR/client mismatch: don't read storage during SSR.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [decision, setDecision] = useState<ConsentDecision>("unset");

  useEffect(() => {
    setMounted(true);
    const d = getConsent();
    setDecision(d);
    setVisible(d === "unset");
  }, []);

  // Ensure default-denied on mount in case inline head script didn't run yet
  useEffect(() => {
    setDefaultDeniedConsentEarly();
  }, []);

  const enableAnalytics = useCallback(async () => {
    if (!GA_ID) return;
    await loadGAScript(GA_ID);
    updateGtagConsent(true);
  }, []);

  const onAccept = useCallback(async () => {
    setConsent("accepted");
    setDecision("accepted");
    setVisible(false);
    await enableAnalytics();
  }, [enableAnalytics]);

  const onReject = useCallback(() => {
    setConsent("rejected");
    setDecision("rejected");
    setVisible(false);
    updateGtagConsent(false);
  }, []);

  // Expose a simple global to reopen settings
  useEffect(() => {
    (window as any).openCookieSettings = () => setVisible(true);
  }, []);

  // If the user had previously accepted and GA_ID exists, ensure GA loads once
  useEffect(() => {
    if (!mounted) return;
    if (decision === "accepted" && GA_ID) {
      enableAnalytics();
    }
  }, [mounted, decision, enableAnalytics]);

  // During SSR, render nothing to keep HTML stable; show only after mount.
  if (!mounted || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60]">
      <div className="mx-auto max-w-5xl px-4 pb-4">
        <div className="rounded-lg border border-white bg-background shadow-lg p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm leading-6 text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                Cookies & privacy
              </p>
              <p>
                We use cookies to remember your preferences and to measure
                performance. Analytics cookies are optional and only enabled if
                you accept.
              </p>
            </div>
            <div className="flex items-center gap-2 md:shrink-0">
              <Button variant="secondary" onClick={onReject}>
                Reject
              </Button>
              <Button onClick={onAccept}>Accept</Button>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <button
              className="underline hover:text-foreground"
              onClick={() => (window as any).openCookieSettings?.()}
            >
              Cookie settings
            </button>
            <span> · </span>
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
