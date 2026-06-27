"use client";

import { Loader2 } from "lucide-react";
import { GoogleInAppBlocker } from "@/components/auth/InAppBrowserWarning";
import GoogleIcon from "@/components/icons/google-svg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GoogleSignInButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  showInAppBlocker?: boolean;
  appName?: string;
  label?: string;
}

/** Standalone Google OAuth button — full border radius unless in-app blocker is attached below. */
export function GoogleSignInButton({
  onClick,
  disabled,
  loading,
  showInAppBlocker,
  appName = "this app",
  label = "Sign in with Google",
}: GoogleSignInButtonProps) {
  return (
    <div className="space-y-0">
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-11 w-full font-bold",
          showInAppBlocker ? "rounded-b-none border-b-0" : "",
        )}
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        {label}
      </Button>
      {showInAppBlocker && <GoogleInAppBlocker appName={appName} />}
    </div>
  );
}
