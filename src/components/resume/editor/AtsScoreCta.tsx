"use client";

import { motion, useReducedMotion } from "motion/react";
import AtsIcon from "@/components/resume/editor/AtsIcon";
import { Button } from "@/components/ui/button";

interface AtsScoreCtaProps {
  onOpen: () => void;
}

/** Sticky bottom bar — always visible while editing. */
export function AtsScoreStickyBar({ onOpen }: AtsScoreCtaProps) {
  const prefersReducedMotion = useReducedMotion();

  const entrance = prefersReducedMotion
    ? { initial: false as const, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <motion.div
      {...entrance}
      className="shrink-0 border-border border-t bg-gradient-to-r from-background via-primary/3 to-background backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="hidden min-w-0 items-center gap-3 sm:flex">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15">
            <AtsIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm">
              ATS Score Check
            </p>
            <p className="truncate text-muted-foreground text-xs">
              Match keywords to any job posting
            </p>
          </div>
        </div>

        <motion.div
          className="relative w-full sm:w-auto"
          whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        >
          {!prefersReducedMotion && (
            <motion.span
              aria-hidden="true"
              className="-inset-1 pointer-events-none absolute rounded-xl bg-primary/30"
              animate={{ opacity: [0.4, 0.15, 0.4], scale: [1, 1.03, 1] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          <Button
            onClick={onOpen}
            size="lg"
            className="relative h-11 w-full gap-2.5 px-5 font-bold sm:w-auto"
          >
            <AtsIcon className="h-5 w-5" animated={false} variant="inherit" />
            Improve ATS Score
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
