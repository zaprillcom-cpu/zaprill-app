"use client";

import { AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeEditorErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
  compact?: boolean;
  showDraftHint?: boolean;
}

/**
 * Inline fallback for resume editor sections — keeps the shell usable
 * when a single panel (form, preview, settings) fails to render.
 */
export function ResumeEditorErrorFallback({
  title = "This section ran into a problem",
  message = "Your other edits are safe. Try reloading this section, or switch to a different tab.",
  onRetry,
  onBack,
  compact = false,
  showDraftHint = true,
}: ResumeEditorErrorFallbackProps) {
  return (
    <div
      className={
        compact
          ? "flex min-h-[160px] w-full flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center"
          : "flex min-h-[280px] w-full flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center"
      }
    >
      <AlertCircle className="mb-3 h-9 w-9 text-destructive/90" />
      <h3 className="mb-2 font-bold text-base text-foreground">{title}</h3>
      <p className="mb-1 max-w-md text-muted-foreground text-sm leading-relaxed">
        {message}
      </p>
      {showDraftHint && (
        <p className="mb-5 max-w-md text-muted-foreground/80 text-xs">
          Recent changes are backed up locally while you edit.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-1.5"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
        )}
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to resumes
          </Button>
        )}
      </div>
    </div>
  );
}
