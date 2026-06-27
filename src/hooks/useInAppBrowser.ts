"use client";

import { useEffect, useState } from "react";

const PATTERNS: { regex: RegExp; name: string }[] = [
  { regex: /FBAN|FBAV/i, name: "Facebook" },
  { regex: /Instagram/i, name: "Instagram" },
  { regex: /Twitter/i, name: "Twitter" },
  { regex: /WhatsApp/i, name: "WhatsApp" },
  { regex: /\bLine\b/i, name: "Line" },
  { regex: /GSA\//i, name: "Google App" },
  { regex: /MicroMessenger/i, name: "WeChat" },
  { regex: /LinkedInApp/i, name: "LinkedIn" },
  { regex: /Snapchat/i, name: "Snapchat" },
  { regex: /TikTok|musical_ly/i, name: "TikTok" },
  { regex: /BytedanceWebview/i, name: "ByteDance" },
];

export type Platform = "android" | "ios" | "other";

export function useInAppBrowser() {
  const [isInApp, setIsInApp] = useState(false);
  const [appName, setAppName] = useState<string>("an in-app browser");
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    const ua = navigator.userAgent ?? "";

    if (/Android/i.test(ua)) setPlatform("android");
    else if (/iPhone|iPad|iPod/i.test(ua)) setPlatform("ios");

    const match = PATTERNS.find(({ regex }) => regex.test(ua));
    if (match) {
      setIsInApp(true);
      setAppName(match.name);
      return;
    }

    // Generic Android WebView: Chrome-based but with "wv" flag
    if (/Android/i.test(ua) && /wv/.test(ua)) {
      setIsInApp(true);
      setAppName("an in-app browser");
    }
  }, []);

  return { isInApp, appName, platform };
}

/**
 * Attempts to open `url` in the system browser.
 *
 * Android: uses the `intent://` URI scheme to target Chrome directly.
 * iOS / other: falls back to window.open (works in some in-app browsers,
 *              silently fails in others — the copy-link flow is the backup).
 */
export function openInSystemBrowser(url: string, platform: Platform) {
  if (platform === "android") {
    // Strip the scheme — the intent URI re-adds it via scheme= param.
    const bare = url.replace(/^https?:\/\//, "");
    window.location.href = `intent://${bare}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
  } else {
    // iOS has no guaranteed way to escape a WebView from the web layer.
    // window.open sometimes triggers an "Open in Safari" sheet on older iOS.
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
