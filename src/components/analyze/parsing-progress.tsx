"use client";

import { Loader2, Zap } from "lucide-react";
import SkillBadge from "@/components/SkillBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalysisStep } from "@/types";
import type { ResumeData } from "@/types/resume";

interface ParsingProgressProps {
  step: AnalysisStep;
  resume: ResumeData | null;
}

export function ParsingProgress({ step, resume }: ParsingProgressProps) {
  const skills = resume?.skills.flatMap((s) => s.keywords) || [];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Top Status Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 relative">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <Zap className="h-5 w-5 text-primary absolute -top-2 -right-2 fill-current" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            {step === "parsing"
              ? "Decoding your Professional DNA..."
              : "Finalizing Profile..."}
          </h2>
          <p className="text-muted-foreground font-medium">
            Our AI is extractingskills, experience, and impact metrics to build
            your search engine.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Extraction Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                Live Extraction
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {resume ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      Candidate
                    </p>
                    <p className="text-lg font-black truncate">
                      {resume.basics.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Skills
                      </p>
                      <p className="text-base font-black text-primary">
                        {skills.length}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Roles
                      </p>
                      <p className="text-base font-black text-primary">
                        {resume.work.length}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      Detected Keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 15).map((s) => (
                        <SkillBadge
                          key={s}
                          skill={s}
                          variant="neutral"
                          size="sm"
                        />
                      ))}
                      {skills.length > 15 && (
                        <span className="text-[10px] font-black text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          +{skills.length - 15}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="pt-4 space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-6 w-16 rounded-md" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-muted/20 border border-border/50 text-center space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Processing Time
            </p>
            <p className="text-sm font-medium italic opacity-70">
              Usually takes 10-15 seconds...
            </p>
          </div>
        </div>

        {/* Right Column: Simulated Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Parsing Stream
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Active
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="shadow-sm border-border/50 bg-card/50 rounded-2xl overflow-hidden opacity-60 grayscale-[0.5]"
              >
                <CardContent className="p-6 flex gap-6 items-center">
                  <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-2/5" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
