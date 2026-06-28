"use client";

import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getResumeIdFromPath,
  hasResumeDraft,
} from "@/lib/resume/draft-recovery";

/**
 * Route-level error boundary for the resume editor.
 * Replaces the generic app error page with resume-specific recovery options.
 */
export default function ResumeEditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [draftAvailable, setDraftAvailable] = useState(false);

  useEffect(() => {
    console.error("Resume editor error:", error);

    const resumeId = getResumeIdFromPath(window.location.pathname);
    if (resumeId) {
      setDraftAvailable(hasResumeDraft(resumeId));
    }
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="font-black text-2xl tracking-tight sm:text-3xl">
            Resume editor hit a snag
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
            Something unexpected happened while loading this resume. Your recent
            edits may still be saved locally on this device.
          </p>
          {draftAvailable && (
            <p className="font-medium text-achievement text-sm">
              A local draft was found — try reloading to recover your work.
            </p>
          )}
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="max-h-[120px] overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 text-left font-mono text-muted-foreground text-xs">
            {error.message || "Unknown error"}
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Button
            onClick={() => reset()}
            size="lg"
            className="w-full gap-2 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Reload editor
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/resumes")}
            className="w-full gap-2 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to resumes
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => router.push("/")}
            className="w-full gap-2 sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
