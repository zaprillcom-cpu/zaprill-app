"use client";

import { Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

const SCAN_PHASES = [
  {
    label: "Extract",
    messages: [
      "Extracting text from your document...",
      "Identifying sections and structure...",
      "Detecting contact information...",
      "Reading your professional DNA...",
    ],
  },
  {
    label: "Parse",
    messages: [
      "Mapping your work experience...",
      "Cataloging technical skills...",
      "Parsing education history...",
      "Identifying certifications...",
    ],
  },
  {
    label: "Analyze",
    messages: [
      "Running ATS compatibility check...",
      "Analyzing keyword density...",
      "Scoring action verb impact...",
      "Evaluating formatting quality...",
    ],
  },
  {
    label: "Score",
    messages: [
      "Computing ATS score...",
      "Generating optimization suggestions...",
      "Building your improvement roadmap...",
      "Finalizing analysis report...",
    ],
  },
];

const FUN_FACTS = [
  "Did you know? 75% of resumes are rejected by ATS before a human ever sees them.",
  "Fact: Resumes with quantified achievements get 40% more interview calls.",
  "Tip: Tailoring your resume to each job description increases callback rates by 3x.",
  "Data: The average recruiter spends just 6-7 seconds on an initial resume scan.",
  "Insight: Action verbs like 'Orchestrated' and 'Spearheaded' outperform 'Responsible for' by 2x.",
  "Stat: Resumes with a professional summary section score 21% higher on ATS.",
  "Fact: Including metrics and numbers in bullet points boosts ATS scores by up to 15 points.",
  "Tip: PDF formatting preserves your layout better than DOCX for ATS parsing.",
];

function ResumeDocumentSkeleton() {
  const skillWidths = useMemo(() => [44, 56, 38, 60, 48, 52, 42, 64], []);

  return (
    <div className="w-full max-w-95 mx-auto rounded-lg border border-border bg-card shadow-2xl overflow-hidden">
      {/* Paper texture top */}
      <div className="bg-linear-to-b from-muted/50 to-transparent h-1" />

      <div className="px-6 py-6 space-y-4">
        {/* Name + title header */}
        <div className="text-center space-y-2">
          <div className="h-4 bg-muted/60 rounded w-3/5 mx-auto" />
          <div className="h-2.5 bg-muted/40 rounded w-2/5 mx-auto" />
        </div>

        {/* Contact row */}
        <div className="flex justify-center gap-3">
          <div className="h-2 bg-muted/30 rounded w-16" />
          <div className="h-2 bg-muted/30 rounded w-14" />
          <div className="h-2 bg-muted/30 rounded w-20" />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Summary section */}
        <div className="space-y-1.5">
          <div className="h-2.5 bg-muted/50 rounded w-16" />
          <div className="h-2 bg-muted/20 rounded w-full" />
          <div className="h-2 bg-muted/20 rounded w-full" />
          <div className="h-2 bg-muted/20 rounded w-3/4" />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Experience section */}
        <div className="space-y-1.5">
          <div className="h-2.5 bg-muted/50 rounded w-20" />
          {/* Job 1 */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <div className="h-2 bg-muted/40 rounded w-28" />
              <div className="h-2 bg-muted/20 rounded w-14" />
            </div>
            <div className="h-2 bg-muted/20 rounded w-24" />
            <div className="h-2 bg-muted/20 rounded w-full" />
            <div className="h-2 bg-muted/20 rounded w-5/6" />
            <div className="h-2 bg-muted/20 rounded w-4/6" />
          </div>
          {/* Job 2 */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between">
              <div className="h-2 bg-muted/40 rounded w-24" />
              <div className="h-2 bg-muted/20 rounded w-14" />
            </div>
            <div className="h-2 bg-muted/20 rounded w-20" />
            <div className="h-2 bg-muted/20 rounded w-full" />
            <div className="h-2 bg-muted/20 rounded w-3/4" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Education section */}
        <div className="space-y-1.5">
          <div className="h-2.5 bg-muted/50 rounded w-20" />
          <div className="flex justify-between">
            <div className="h-2 bg-muted/40 rounded w-32" />
            <div className="h-2 bg-muted/20 rounded w-14" />
          </div>
          <div className="h-2 bg-muted/20 rounded w-24" />
        </div>

        {/* Skills section */}
        <div className="space-y-2 pt-1">
          <div className="h-2.5 bg-muted/50 rounded w-14" />
          <div className="flex flex-wrap gap-1.5">
            {skillWidths.map((w) => (
              <div
                key={`skill-pill-${w}`}
                className="h-2 bg-muted/30 rounded"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Paper texture bottom */}
      <div className="bg-linear-to-t from-muted/50 to-transparent h-1" />
    </div>
  );
}

export default function ResumeScannerLoader({ file }: { file?: File | null }) {
  const [phase, setPhase] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [funFact, setFunFact] = useState(0);
  const documentUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase((p) => (p + 1) % SCAN_PHASES.length);
      setMsgIndex(0);
    }, 5000);

    const msgInterval = setInterval(() => {
      setMsgIndex((m) => {
        const max = SCAN_PHASES[phase]?.messages.length ?? 4;
        return (m + 1) % max;
      });
    }, 2500);

    const factInterval = setInterval(() => {
      setFunFact((f) => (f + 1) % FUN_FACTS.length);
    }, 6000);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(msgInterval);
      clearInterval(factInterval);
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      if (documentUrl) URL.revokeObjectURL(documentUrl);
    };
  }, [documentUrl]);

  const activePhase = SCAN_PHASES[phase];

  return (
    <div className="w-full max-w-2xl mx-auto py-8 md:py-12 px-4">
      {/* Document scan area */}
      <div className="relative mb-10">
        {/* Glow behind the document */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-primary/5 blur-3xl"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: -20, bottom: -20, left: -20, right: -20 }}
        />

        <div className="relative">
          {/* Scanner border frame */}
          <div className="absolute -inset-1 rounded-xl border border-primary/10 pointer-events-none" />
          <div className="absolute -inset-2 rounded-xl border border-primary/5 pointer-events-none" />

          {/* Document preview */}
          <div className="relative overflow-hidden rounded-lg shadow-2xl">
            {documentUrl && file?.type === "application/pdf" ? (
              <div className="w-full max-w-95 mx-auto bg-white">
                <iframe
                  src={documentUrl}
                  className="w-full border-0"
                  style={{ height: 500 }}
                  title="Resume preview"
                />
              </div>
            ) : (
              <ResumeDocumentSkeleton />
            )}

            {/* Scanning line */}
            <motion.div
              className="absolute left-0 right-0 pointer-events-none z-10"
              style={{ height: 3, top: 0 }}
              animate={{ top: ["0%", "100%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Main bright line */}
              <div className="absolute inset-0 bg-primary shadow-[0_0_20px_4px_rgba(var(--primary),0.6)]" />

              {/* Upper glow spread */}
              <div className="absolute bottom-full left-0 right-0 h-8 bg-linear-to-b from-transparent via-primary/20 to-primary/40" />

              {/* Lower glow spread */}
              <div className="absolute top-full left-0 right-0 h-12 bg-linear-to-b from-primary/40 via-primary/15 to-transparent" />
            </motion.div>

            {/* Overlay that darkens unscanned area - top portion */}
            <motion.div
              className="absolute left-0 right-0 pointer-events-none bg-background/60 z-5"
              style={{ top: 0, height: "100%" }}
              animate={{ height: ["100%", "0%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Corner accents */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-primary/30 rounded-tl-lg pointer-events-none" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-primary/30 rounded-tr-lg pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-primary/30 rounded-bl-lg pointer-events-none" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-primary/30 rounded-br-lg pointer-events-none" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-black tracking-tight text-foreground text-center mb-8">
        Scanning Your Resume
      </h2>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-linear-to-r from-primary/60 via-primary to-primary/60 rounded-full"
            animate={{
              width: ["20%", "45%", "65%", "85%"],
            }}
            transition={{
              duration: 17,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {SCAN_PHASES.map((p, i) => (
            <span
              key={p.label}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                i <= phase ? "text-primary" : "text-muted-foreground/40"
              }`}
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Current message */}
      <div className="mb-6 min-h-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${phase}-${msgIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-base font-semibold text-muted-foreground text-center"
          >
            {activePhase.messages[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Fun fact */}
      <div className="mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={funFact}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3"
          >
            <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-primary/80">
              {FUN_FACTS[funFact]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Sections", value: "--" },
          { label: "Skills Found", value: "--" },
          { label: "Keywords", value: "--" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center"
          >
            <motion.span
              className="block text-lg font-black text-foreground"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {stat.value}
            </motion.span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
