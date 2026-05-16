"use client";

import {
  ArrowRight,
  ChevronRight,
  Globe,
  Loader2,
  Map,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { DashboardSkeleton } from "@/components/loading/PageLoaders";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/ui/file-upload";
import { WordFadeIn } from "@/components/ui/word-fade-in";
import { trackSavedProfileUsed } from "@/lib/analytics";
import { useSession } from "@/lib/auth-client";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [profile, setProfile] = useState<any>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setIsFetchingProfile(true);
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            setProfile(data.profile);
          }
        })
        .catch((err) => console.error("Failed to load profile", err))
        .finally(() => setIsFetchingProfile(false));
    } else {
      setProfile(null);
    }
  }, [session?.user]);

  const handleUseSavedProfile = () => {
    if (profile?.resumeRaw) {
      trackSavedProfileUsed();
      sessionStorage.setItem(
        "ai_job_god_resume",
        JSON.stringify(profile.resumeRaw),
      );
      router.push("/analyze");
    }
  };

  // 1. Initial Auth Loading - Show Skeleton
  if (sessionLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-20">
          <GridPattern />
        </div>
        <Navbar sticky={true} user={undefined} sessionLoading={true} />
        <DashboardSkeleton />
      </main>
    );
  }

  // 2. Fetching Profile for Logged In User - Show Skeleton
  if (session && isFetchingProfile && !profile) {
    return (
      <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-20">
          <GridPattern />
        </div>
        <Navbar
          sticky={true}
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
          sessionLoading={false}
        />
        <DashboardSkeleton />
      </main>
    );
  }

  // 3. User logged in and completed onboarding - Show Dashboard
  if (session && profile?.onboardingStatus === "completed") {
    return (
      <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-50 dark:opacity-20">
          <GridPattern />
        </div>
        <Navbar
          sticky={true}
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
          sessionLoading={false}
        />
        <div className="relative z-10 flex-1">
          <UserDashboard profile={profile} session={session} />
        </div>
        <footer className="py-12 border-t border-border bg-background relative z-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm font-medium text-muted-foreground">
              Made with ❤️ by{" "}
              <span className="italic text-primary">Team Zaprill</span>
            </div>
            <div className="flex items-center gap-6 text-sm font-bold">
              <Link
                href="/history"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                History
              </Link>
              <Link
                href="/profile"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Profile
              </Link>
            </div>
          </div>
        </footer>
      </main>
    );
  }

  // 4. Guest View or Not Onboarded
  return (
    <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none mask-[linear-gradient(to_bottom,white,transparent)] opacity-50 dark:opacity-20">
        <GridPattern />
      </div>

      <Navbar
        sticky={false}
        user={
          session
            ? {
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
              }
            : null
        }
        sessionLoading={false}
      />

      {/* Hero Section */}
      <section className="flex-1 pt-40 pb-32 flex flex-col items-center text-center px-6 relative z-10 w-full max-w-6xl mx-auto">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
            <Zap className="h-3 w-3 fill-current" />
            AI-Powered Career Intelligence
          </span>
        </div>

        <WordFadeIn
          words="Find the job you actually deserve."
          className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-5xl mb-8 text-foreground"
        />

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed mb-12 font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          We decode your professional DNA to match you with roles where you'll
          actually thrive. No more keyword guessing, just pure data-driven
          career growth.
        </p>

        {/* Primary Action Area */}
        <div className="w-full max-w-2xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          {session ? (
            <div className="flex flex-col items-center gap-6 w-full">
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-20 px-12 rounded-2xl text-xl font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-(--gradient-primary) opacity-90 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-3">
                    Complete Your Onboarding
                    <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground font-bold">
                Just one step away from personalized job matches.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8 w-full">
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-20 px-12 rounded-2xl text-xl font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-(--gradient-primary) opacity-100 group-hover:opacity-90 transition-opacity" />
                  <span className="relative flex items-center gap-3">
                    Get Started Now
                    <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <div className="flex items-center gap-8 text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-60">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  100% Private
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  AI Precision
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="py-12 border-t border-border bg-background relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm font-medium text-muted-foreground">
            Made with ❤️ by{" "}
            <span className="italic text-primary">Team Zaprill</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-bold">
            <Link
              href="/history"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              History
            </Link>
            <Link
              href="/profile"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Profile
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
