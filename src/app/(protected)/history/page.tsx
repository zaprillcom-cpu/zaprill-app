"use client";

import {
  ChevronRight,
  ExternalLink,
  Loader2,
  MousePointer2,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LearningRoadmap from "@/components/LearningRoadmap";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import type { RoadmapItem } from "@/types";

interface CareerInsightsData {
  lastAnalysis: {
    id: string;
    createdAt: string;
    resumeSkills: string[];
    inferredJobTitles: string[];
    roadmap: any;
    advice: string;
    topMatchScore: number;
    totalJobsFound: number;
  } | null;
  recentVisits: {
    id: string;
    title: string;
    company: string;
    location: string | null;
    url: string | null;
    matchPercentage: number | null;
    createdAt: string;
  }[];
}

export default function CareerInsightsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<CareerInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/");
      return;
    }

    if (session?.user) {
      fetch("/api/career-insights")
        .then((res) => res.json())
        .then((json) => {
          setData(json);
        })
        .finally(() => setIsLoading(false));
    }
  }, [session, isPending, router]);

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <span className="font-bold text-lg tracking-tight">
          Loading insights...
        </span>
      </div>
    );
  }

  const { lastAnalysis, recentVisits } = data || {
    lastAnalysis: null,
    recentVisits: [],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar
        showBack
        backHref="/"
        backLabel="Home"
        user={
          session?.user
            ? {
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
              }
            : null
        }
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        {/* ── Hero Section ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px] px-2 py-0.5"
              >
                Beta
              </Badge>
              <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                Dashboard
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
              Career Insights
            </h1>
            <p className="text-muted-foreground font-medium text-lg max-w-xl leading-relaxed">
              Actionable intelligence from your latest analysis and tracked
              applications.
            </p>
          </div>
        </div>

        {!lastAnalysis && recentVisits.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-border/60 rounded-3xl bg-card/50 backdrop-blur-sm">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Target className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black mb-3 tracking-tight">
              Ready to boost your career?
            </h2>
            <p className="text-muted-foreground mb-8 font-semibold text-lg max-w-md mx-auto">
              Upload your resume and search for jobs to unlock your personalized
              roadmap and track your applications.
            </p>
            <Button
              size="lg"
              onClick={() => router.push("/")}
              className="font-bold px-8"
            >
              Get Started Now
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ── Left Column: Analysis Stats & Roadmap ── */}
            <div className="lg:col-span-8 space-y-8">
              {/* Learning Roadmap */}
              {lastAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      Growth Roadmap
                    </h3>
                  </div>
                  <div className="bg-card rounded-3xl border border-border/40 shadow-sm overflow-hidden">
                    <LearningRoadmap
                      roadmap={lastAnalysis.roadmap as RoadmapItem[]}
                      advice={lastAnalysis.advice}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column: Skill Gaps & Activity ── */}
            <div className="lg:col-span-4 space-y-8">
              {/* Critical Skill Gaps */}
              {lastAnalysis && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-amber-500" />
                      Priority Gaps
                    </h3>
                    <Badge
                      variant="outline"
                      className="font-bold border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                    >
                      Top{" "}
                      {Math.min(
                        5,
                        (lastAnalysis.roadmap as RoadmapItem[]).length,
                      )}{" "}
                      Improvements
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {(lastAnalysis.roadmap as RoadmapItem[])
                      .slice(0, 5)
                      .map((gap, idx) => (
                        <div
                          key={gap.skill}
                          className="group relative bg-card p-4 rounded-2xl border border-border/40 shadow-sm hover:border-primary/20 transition-all"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted font-black text-muted-foreground text-xs border border-border/50">
                                0{idx + 1}
                              </div>
                              <div>
                                <h4 className="font-black text-sm tracking-tight text-foreground">
                                  {gap.skill}
                                </h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                  {gap.category}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="hidden sm:flex flex-col items-end">
                                <div className="flex gap-1 h-1 w-12 rounded-full overflow-hidden bg-muted">
                                  <div
                                    className={`h-full rounded-full ${
                                      gap.priority === "high"
                                        ? "bg-primary w-full"
                                        : gap.priority === "medium"
                                          ? "bg-primary/60 w-2/3"
                                          : "bg-primary/30 w-1/3"
                                    }`}
                                  />
                                </div>
                                <span className="text-[9px] font-black uppercase text-muted-foreground mt-1 tracking-tighter">
                                  Market Demand
                                </span>
                              </div>
                              <Badge
                                className={`
                              text-[10px] font-black px-2 py-0.5 rounded-lg border-none uppercase tracking-wider
                              ${
                                gap.priority === "high"
                                  ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                  : gap.priority === "medium"
                                    ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                                    : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                              }
                            `}
                              >
                                {gap.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Subtle Skills Inventory */}
                  <div className="pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-1">
                      Validated Inventory ({lastAnalysis.resumeSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                      {lastAnalysis.resumeSkills.slice(0, 10).map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border/50"
                        >
                          {skill}
                        </span>
                      ))}
                      {lastAnalysis.resumeSkills.length > 10 && (
                        <span className="text-[10px] font-bold px-2 py-1 text-muted-foreground">
                          +{lastAnalysis.resumeSkills.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Job Tracking CTA */}
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  <MousePointer2 className="h-6 w-6 text-blue-500" />
                  Job Tracking
                </h3>
                <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/10 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                      <Target className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h4 className="text-lg font-black mb-2">
                      Track Applications
                    </h4>
                    <p className="text-sm text-muted-foreground font-medium mb-6 leading-relaxed">
                      Monitor all your applied jobs and saved bookmarks in one
                      central dashboard.
                    </p>
                    <Button
                      onClick={() => router.push("/jobs")}
                      className="w-full font-black rounded-xl gap-2 shadow-sm"
                    >
                      View My Jobs
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
