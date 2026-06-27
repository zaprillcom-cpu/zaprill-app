"use client";

import { AlertTriangle, Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { openInSystemBrowser, useInAppBrowser } from "@/hooks/useInAppBrowser";

function CopyOpenButtons({
  platform,
  label,
}: {
  platform: ReturnType<typeof useInAppBrowser>["platform"];
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  };

  const handleOpen = () => openInSystemBrowser(currentUrl, platform);

  return (
    <div className="flex flex-wrap gap-2">
      {/* Android can reliably open Chrome; on iOS surface copy as primary */}
      {platform === "android" ? (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={`h-7 px-3 text-xs ${label}`}
            onClick={handleOpen}
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            Open in Chrome
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={`h-7 px-3 text-xs ${label}`}
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="mr-1 h-3 w-3" />
            ) : (
              <Copy className="mr-1 h-3 w-3" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={`h-7 px-3 text-xs ${label}`}
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="mr-1 h-3 w-3" />
            ) : (
              <Copy className="mr-1 h-3 w-3" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={`h-7 px-3 text-xs ${label}`}
            onClick={handleOpen}
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            Try Open in Safari
          </Button>
        </>
      )}
    </div>
  );
}

const BANNER_BTN =
  "border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-900";

const BLOCKER_BTN =
  "border-amber-300 bg-white text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-transparent dark:text-amber-200";

/**
 * Passive banner — shown at the top of auth forms whenever an in-app browser
 * is detected, so users know before they attempt Google sign-in.
 */
export function InAppBrowserWarning() {
  const { isInApp, appName, platform } = useInAppBrowser();
  if (!isInApp) return null;

  const instruction =
    platform === "android"
      ? 'Tap "Open in Chrome" below, or copy the link and paste it there.'
      : "Copy the link and paste it into Safari or Chrome to continue.";

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-2">
          <p className="font-bold text-amber-800 text-sm dark:text-amber-200">
            You&apos;re in {appName}&apos;s browser
          </p>
          <p className="text-amber-700 text-xs leading-relaxed dark:text-amber-300">
            Google sign-in is blocked here. {instruction} Email &amp; password
            works normally.
          </p>
          <CopyOpenButtons platform={platform} label={BANNER_BTN} />
        </div>
      </div>
    </div>
  );
}

/**
 * Shown inline below the Google button when the user taps it from an in-app
 * browser. More prominent and targeted than the passive banner.
 */
export function GoogleInAppBlocker({ appName }: { appName: string }) {
  const { platform } = useInAppBrowser();

  const instruction =
    platform === "android"
      ? "Tap Open in Chrome — Google will load in a secure browser and redirect you back here after sign-in."
      : "Copy the link and open it in Safari or Chrome. Google will redirect you back after sign-in.";

  return (
    <div className="-mt-2 rounded-b-md border border-amber-300 border-t-0 bg-amber-50 px-4 pt-3 pb-3 dark:border-amber-700 dark:bg-amber-950/40">
      <p className="mb-2 font-medium text-amber-800 text-xs dark:text-amber-200">
        Google blocks sign-in from {appName}. {instruction}
      </p>
      <CopyOpenButtons platform={platform} label={BLOCKER_BTN} />
    </div>
  );
}
