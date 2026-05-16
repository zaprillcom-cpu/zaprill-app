import ProgressTimeline from "@/components/ProgressTimeline";
import SkillBadge from "@/components/SkillBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisStep } from "@/types";
import type { ResumeData } from "@/types/resume";

interface ParsingProgressProps {
  step: AnalysisStep;
  resume: ResumeData | null;
}

export function ParsingProgress({ step, resume }: ParsingProgressProps) {
  const skills = resume?.skills.flatMap((s) => s.keywords) || [];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 items-start">
      <Card className="sticky top-28 shadow-sm border-border rounded-xl">
        <CardHeader className="pb-5 border-b border-border">
          <CardTitle className="text-lg font-black tracking-tight">
            Analysis Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ProgressTimeline currentStep={step} />
          {resume && (
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Target Profile
              </p>
              <p className="text-base font-black text-foreground mb-1">
                {resume.basics.name}
              </p>
              <p className="text-sm tracking-tight text-muted-foreground font-semibold mb-4">
                {skills.length} skills · {resume.work.length} roles
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 10).map((s) => (
                  <SkillBadge key={s} skill={s} variant="neutral" size="md" />
                ))}
                {skills.length > 10 && (
                  <span className="text-xs font-bold text-muted-foreground pt-1.5 pl-1.5">
                    +{skills.length - 10}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6 pt-2">
        <p className="text-xl font-bold text-muted-foreground mb-2 animate-pulse">
          Parsing uploaded document...
        </p>
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="h-[180px] shadow-sm border-border bg-card/50 rounded-2xl"
          >
            <CardContent className="pt-8">
              <div className="h-5 bg-muted rounded w-2/5 mb-4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/4 mb-7 animate-pulse" />
              <div className="flex gap-3">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="h-8 bg-muted rounded w-20 animate-pulse"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
