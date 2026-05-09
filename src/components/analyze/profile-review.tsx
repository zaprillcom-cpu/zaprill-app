import {
  Briefcase,
  Check,
  Info,
  Plus,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { JobTitleAutocomplete } from "@/components/JobTitleAutocomplete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { ParsedResume } from "@/types";
import type { ReviewState } from "./types";

interface ProfileReviewProps {
  resume: ParsedResume;
  reviewState: ReviewState;
  setReviewState: Dispatch<SetStateAction<ReviewState>>;
  runAnalysis: (resume: ParsedResume) => void;
}

export function ProfileReview({
  resume,
  reviewState,
  setReviewState,
  runAnalysis,
}: ProfileReviewProps) {
  const {
    reviewSkills,
    newSkill,
    selectedTitles,
    reviewTitles,
    newTitleValue,
    editingTitleIndex,
    editingTitleValue,
    experienceYears,
  } = reviewState;

  const addSkill = () => {
    if (newSkill.trim() && !reviewSkills.includes(newSkill.trim())) {
      setReviewState((prev) => ({
        ...prev,
        reviewSkills: [...prev.reviewSkills, prev.newSkill.trim()],
        newSkill: "",
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setReviewState((prev) => ({
      ...prev,
      reviewSkills: prev.reviewSkills.filter((s) => s !== skill),
    }));
  };

  const toggleTitle = (title: string) => {
    setReviewState((prev) => {
      if (prev.selectedTitles.includes(title)) {
        return {
          ...prev,
          selectedTitles: prev.selectedTitles.filter((t) => t !== title),
        };
      } else if (prev.selectedTitles.length < 3) {
        return {
          ...prev,
          selectedTitles: [...prev.selectedTitles, title],
        };
      }
      return prev;
    });
  };

  const removeTitle = (title: string) => {
    setReviewState((prev) => ({
      ...prev,
      reviewTitles: prev.reviewTitles.filter((t) => t !== title),
      selectedTitles: prev.selectedTitles.filter((t) => t !== title),
    }));
  };

  const startEditingTitle = (index: number, text: string) => {
    setReviewState((prev) => ({
      ...prev,
      editingTitleIndex: index,
      editingTitleValue: text,
    }));
  };

  const saveEditedTitle = (index: number) => {
    setReviewState((prev) => {
      const newVal = prev.editingTitleValue.trim();
      if (!newVal) {
        return { ...prev, editingTitleIndex: null };
      }
      const oldVal = prev.reviewTitles[index];
      const newReviewTitles = [...prev.reviewTitles];
      newReviewTitles[index] = newVal;

      let newSelectedTitles = prev.selectedTitles;
      if (prev.selectedTitles.includes(oldVal)) {
        newSelectedTitles = prev.selectedTitles.map((t) =>
          t === oldVal ? newVal : t,
        );
      }

      return {
        ...prev,
        reviewTitles: newReviewTitles,
        selectedTitles: newSelectedTitles,
        editingTitleIndex: null,
      };
    });
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-black tracking-tight text-foreground mb-3">
          Finalize Your Profile
        </h2>
        <p className="text-lg text-muted-foreground font-semibold">
          We've parsed your resume. Review and customize the data before we
          search for jobs.
        </p>
      </div>

      <div className="space-y-8">
        {/* Quality Note */}
        <Card className="border-accent/30 bg-accent/5 dark:bg-accent/10 dark:border-accent/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1">
                  Search Quality Tip
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  For the best results, avoid selecting very diverse job roles
                  (e.g., "Web Developer" AND "Data Analyst"). The analysis
                  quality is highest when you focus on a specific career path.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="pb-4 bg-muted/30 border-b border-border/50">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Years of Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-10 px-8">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                Experience Level
              </span>
              <span className="text-3xl font-black text-foreground">
                {experienceYears} Years
              </span>
            </div>
            <Slider
              value={[experienceYears]}
              min={0}
              max={20}
              step={1}
              onValueChange={(val) =>
                setReviewState((prev) => ({
                  ...prev,
                  experienceYears: Array.isArray(val)
                    ? (val[0] ?? prev.experienceYears)
                    : val,
                }))
              }
              className="py-4"
            />
            <p className="mt-4 text-xs text-muted-foreground font-semibold text-center italic">
              Slide to adjust your total professional experience for better job
              matching.
            </p>
          </CardContent>
        </Card>

        {/* Job Titles Section */}
        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="pb-4 bg-muted/30 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Target Job Titles
              </CardTitle>
              <Badge
                variant={selectedTitles.length === 3 ? "default" : "secondary"}
                className="font-black"
              >
                {selectedTitles.length}/3 Selected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {reviewTitles.map((title, idx) => {
                const isSelected = selectedTitles.includes(title);
                const isEditing = editingTitleIndex === idx;

                if (isEditing) {
                  return (
                    <div
                      key={"edit-" + idx}
                      className="flex items-center gap-2"
                    >
                      <Input
                        value={editingTitleValue}
                        onChange={(e) =>
                          setReviewState((prev) => ({
                            ...prev,
                            editingTitleValue: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && saveEditedTitle(idx)
                        }
                        autoFocus
                        className="h-12 font-bold"
                      />
                      <Button
                        size="sm"
                        onClick={() => saveEditedTitle(idx)}
                        className="h-12"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                }

                return (
                  <div key={title} className="relative group/item">
                    <button
                      onClick={() => toggleTitle(title)}
                      className={`flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group
                        ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-muted-foreground/30 text-foreground"
                        }
                      `}
                    >
                      <span className="font-bold tracking-tight pr-10 truncate">
                        {title}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0
                          ${
                            isSelected
                              ? "bg-primary-foreground border-primary-foreground"
                              : "bg-muted border-border group-hover:border-muted-foreground/30"
                          }
                        `}
                      >
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-primary stroke-[3px]" />
                        )}
                      </div>
                    </button>
                    {/* Floating Actions */}
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTitle(idx, title);
                        }}
                        className={`p-1.5 rounded-md hover:bg-muted transition-colors ${
                          isSelected
                            ? "text-background hover:bg-background/20"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Edit"
                      >
                        <TrendingUp className="h-3.5 w-3.5 rotate-90" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTitle(title);
                        }}
                        className={`p-1.5 rounded-md hover:bg-destructive hover:text-white transition-colors ${
                          isSelected
                            ? "text-background"
                            : "text-muted-foreground"
                        }`}
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <JobTitleAutocomplete
              value={newTitleValue}
              onChange={(val) =>
                setReviewState((prev) => ({ ...prev, newTitleValue: val }))
              }
              onAdd={(title) => {
                const val = title.trim();
                setReviewState((prev) => {
                  if (val && !prev.reviewTitles.includes(val)) {
                    return {
                      ...prev,
                      reviewTitles: [...prev.reviewTitles, val],
                      selectedTitles:
                        prev.selectedTitles.length < 3
                          ? [...prev.selectedTitles, val]
                          : prev.selectedTitles,
                      newTitleValue: "",
                    };
                  }
                  return prev;
                });
              }}
              placeholder="Add custom job title (e.g. Lead Dev)..."
            />
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="pb-4 bg-muted/30 border-b border-border/50">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Key Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-wrap gap-2 mb-8">
              {reviewSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="pl-3 pr-1 py-1.5 text-sm font-bold flex items-center gap-1 hover:bg-muted-foreground/10 transition-colors"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add a missing skill..."
                value={newSkill}
                onChange={(e) =>
                  setReviewState((prev) => ({
                    ...prev,
                    newSkill: e.target.value,
                  }))
                }
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="bg-muted/50 border-border font-bold h-12"
              />
              <Button
                onClick={addSkill}
                variant="default"
                className="h-12 w-12 p-0 shrink-0"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4">
          <Button
            onClick={() => runAnalysis(resume)}
            disabled={selectedTitles.length === 0}
            className="w-full h-16 text-xl font-black tracking-tight shadow-xl group"
          >
            <Zap className="mr-3 h-6 w-6 fill-current group-hover:scale-110 transition-transform" />
            Start Job Search Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}
