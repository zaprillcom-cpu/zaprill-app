"use client";

import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  Clock,
  ExternalLink,
  History,
  Loader2,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";

interface TrackedJob {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  matchPercentage: number;
  createdAt: string;
}

export default function MyJobsPage() {
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    saved: TrackedJob[];
    visited: TrackedJob[];
  }>({ saved: [], visited: [] });
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());

  const handleUnsave = async (jobId: string) => {
    const jobToRemove = data.saved.find(
      (j) => j.jobId === jobId || j.id === jobId,
    );
    if (!jobToRemove) return;

    // High-priority synchronous update for instant UI feedback
    const previousSaved = data.saved;
    setData((prev) => ({
      ...prev,
      saved: prev.saved.filter((j) => j.jobId !== jobId && j.id !== jobId),
    }));

    let undoClicked = false;
    toast("Job removed from bookmarks", {
      action: {
        label: "Undo",
        onClick: () => {
          undoClicked = true;
          setData((prev) => ({ ...prev, saved: previousSaved }));
          fetch("/api/save-job", {
            method: "POST",
            body: JSON.stringify(jobToRemove),
          }).catch(console.error);
        },
      },
    });

    try {
      const res = await fetch("/api/save-job", {
        method: "DELETE",
        body: JSON.stringify({ jobId }),
      });

      if (!res.ok && !undoClicked) {
        // Revert on failure
        setData((prev) => ({
          ...prev,
          saved: previousSaved,
        }));
      }
    } catch (error) {
      if (!undoClicked) {
        console.error("Failed to unsave:", error);
        setData((prev) => ({
          ...prev,
          saved: previousSaved,
        }));
      }
    }
  };

  const handleBulkUnsave = async () => {
    if (selectedJobs.size === 0) return;

    const jobsToRemove = data.saved.filter((j) =>
      selectedJobs.has(j.jobId || j.id),
    );
    const previousSaved = data.saved;

    // Optimistic UI removal
    setData((prev) => ({
      ...prev,
      saved: prev.saved.filter((j) => !selectedJobs.has(j.jobId || j.id)),
    }));

    const idsToDelete = Array.from(selectedJobs);
    setSelectedJobs(new Set());

    let undoClicked = false;
    toast(`${idsToDelete.length} job(s) removed`, {
      action: {
        label: "Undo",
        onClick: () => {
          undoClicked = true;
          setData((prev) => ({ ...prev, saved: previousSaved }));
          Promise.all(
            jobsToRemove.map((job) =>
              fetch("/api/save-job", {
                method: "POST",
                body: JSON.stringify(job),
              }),
            ),
          ).catch(console.error);
        },
      },
    });

    try {
      await Promise.all(
        idsToDelete.map((jobId) =>
          fetch("/api/save-job", {
            method: "DELETE",
            body: JSON.stringify({ jobId }),
          }),
        ),
      );
    } catch (error) {
      if (!undoClicked) {
        console.error("Failed to bulk unsave:", error);
        setData((prev) => ({
          ...prev,
          saved: previousSaved,
        }));
      }
    }
  };

  useEffect(() => {
    if (!session) return;

    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/user-jobs");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [session]);

  if (isPending || (session && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null; // Handle via middleware/router
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={
          session.user
            ? {
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
              }
            : null
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
            My Jobs
          </h1>
          <p className="text-muted-foreground font-medium">
            Track your application history and bookmarked opportunities.
          </p>
        </div>

        <Tabs defaultValue="visited" className="space-y-8">
          <TabsList className="bg-muted border border-border/50 p-1 h-14 rounded-2xl shadow-sm">
            <TabsTrigger
              value="visited"
              className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <History className="h-4 w-4 mr-2" />
              Visited ({data.visited.length})
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmarked ({data.saved.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="visited"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {data.visited.length === 0 ? (
              <EmptyState
                title="No applications yet"
                description="Jobs you apply for will show up here automatically."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {data.visited.map((job) => (
                  <JobListItem key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="saved"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {data.saved.length === 0 ? (
              <EmptyState
                title="No bookmarks"
                description="Save jobs during analysis to track them here."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 pb-20">
                {data.saved.map((job) => (
                  <JobListItem
                    key={job.id}
                    job={job}
                    isSaved
                    selected={selectedJobs.has(job.jobId || job.id)}
                    onSelect={(checked) => {
                      const id = job.jobId || job.id;
                      setSelectedJobs((prev) => {
                        const next = new Set(prev);
                        if (checked) next.add(id);
                        else next.delete(id);
                        return next;
                      });
                    }}
                    onUnsave={() => handleUnsave(job.jobId || job.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Bulk Action Bar */}
      {selectedJobs.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-foreground text-background px-6 py-3 rounded-full shadow-2xl border border-border/20 flex items-center gap-6">
            <span className="text-sm font-bold whitespace-nowrap">
              {selectedJobs.size} selected
            </span>
            <div className="w-px h-4 bg-background/20" />
            <button
              onClick={handleBulkUnsave}
              className="text-sm font-black text-destructive-foreground hover:text-red-400 transition-colors whitespace-nowrap"
            >
              Remove Selected
            </button>
            <button
              onClick={() => setSelectedJobs(new Set())}
              className="text-sm font-medium text-background/60 hover:text-background transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function JobListItem({
  job,
  isSaved,
  selected,
  onSelect,
  onUnsave,
}: {
  job: TrackedJob;
  isSaved?: boolean;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onUnsave?: () => void;
}) {
  return (
    <Card className="bg-card border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex-1 min-w-0 flex items-start gap-4">
            {isSaved && onSelect && (
              <div className="pt-1.5 shrink-0">
                <Checkbox
                  checked={selected}
                  onCheckedChange={onSelect}
                  className="w-5 h-5 rounded-md border-border/60 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-black text-foreground truncate group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-primary/5 text-primary border-none font-black text-[10px] uppercase px-2"
                >
                  {job.matchPercentage}% Match
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-semibold">
                <div className="flex items-center gap-1.5 text-foreground/80">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-70">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isSaved && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  if (onUnsave) onUnsave();
                }}
                className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border/60"
                title="Remove bookmark"
              >
                <BookmarkCheck className="h-4 w-4 fill-current" />
              </Button>
            )}

            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className={
                buttonVariants({ variant: "default", size: "sm" }) +
                " font-black rounded-xl px-6 flex-1 sm:flex-none"
              }
            >
              View Listing
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-24 bg-card/50 rounded-3xl border-2 border-dashed border-border/60">
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Briefcase className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-black mb-1">{title}</h3>
      <p className="text-muted-foreground font-medium">{description}</p>
    </div>
  );
}
