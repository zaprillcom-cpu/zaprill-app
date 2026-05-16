import { Filter, RefreshCw, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import {
  LocationCombobox,
  locationMatchesCity,
} from "@/components/LocationCombobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  trackFilterApplied,
  trackFilterPanelOpen,
  trackLocationSearch,
} from "@/lib/analytics";
import type { JobMatch } from "@/types";
import type { ResumeData } from "@/types/resume";
import type { FilterState } from "./types";

interface JobFiltersProps {
  filterState: FilterState;
  setFilterState: Dispatch<SetStateAction<FilterState>>;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  isSearchingLocation: boolean;
  resume: ResumeData | null;
  jobs: JobMatch[];
  runAnalysis: (resume: ResumeData, locationOverride?: string) => void;
}

export function JobFilters({
  filterState,
  setFilterState,
  showFilters,
  setShowFilters,
  isSearchingLocation,
  resume,
  jobs,
  runAnalysis,
}: JobFiltersProps) {
  const { searchTitle, searchLoc, workType, empType, minMatch, requireSalary } =
    filterState;

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    setFilterState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mb-8 p-6 bg-card border border-border rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-black uppercase tracking-wider text-foreground">
          Advanced Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!showFilters) trackFilterPanelOpen();
            setShowFilters(!showFilters);
          }}
          className="font-bold text-sm"
        >
          <Filter className="mr-2 h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in pt-2 border-t border-border/50">
          {/* Text Filters */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Search Title
              </label>
              <Input
                placeholder="e.g. Frontend Engineer"
                value={searchTitle}
                onChange={(e) => {
                  updateFilter("searchTitle", e.target.value);
                  if (e.target.value) {
                    trackFilterApplied({
                      filter_type: "title",
                      filter_value: e.target.value,
                    });
                  }
                }}
                className="bg-background border-border font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                City (India)
              </label>
              <LocationCombobox
                value={searchLoc}
                onChange={(city) => {
                  updateFilter("searchLoc", city);
                  // If the chosen city isn't in the existing results, trigger a new search
                  if (city && resume) {
                    const hasJobsInCity = jobs.some((j) =>
                      locationMatchesCity(j.location, city),
                    );
                    if (!hasJobsInCity) {
                      trackLocationSearch({
                        city,
                        triggered_by: "combobox_change",
                      });
                      runAnalysis(resume, city);
                    }
                  }
                  trackFilterApplied({
                    filter_type: "location",
                    filter_value: city,
                  });
                }}
                disabled={isSearchingLocation}
              />
              {searchLoc && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full font-bold h-9"
                  disabled={isSearchingLocation}
                  onClick={() => {
                    if (resume) {
                      trackLocationSearch({
                        city: searchLoc,
                        triggered_by: "search_button",
                      });
                      runAnalysis(resume, searchLoc);
                    }
                  }}
                >
                  {isSearchingLocation ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    `Search jobs in ${searchLoc}`
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Workspace
              </label>
              <Select
                value={workType}
                onValueChange={(v) => {
                  updateFilter("workType", v || "any");
                  trackFilterApplied({
                    filter_type: "work_type",
                    filter_value: v || "any",
                  });
                }}
              >
                <SelectTrigger className="bg-background border-border font-bold">
                  <SelectValue placeholder="Any Workspace" />
                </SelectTrigger>
                <SelectContent className="font-bold">
                  <SelectItem value="any">Any Workspace</SelectItem>
                  <SelectItem value="remote">Remote Only</SelectItem>
                  <SelectItem value="onsite">Onsite Only</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Employment Type
              </label>
              <Select
                value={empType}
                onValueChange={(v) => {
                  updateFilter("empType", v || "any");
                  trackFilterApplied({
                    filter_type: "employment_type",
                    filter_value: v || "any",
                  });
                }}
              >
                <SelectTrigger className="bg-background border-border font-bold">
                  <SelectValue placeholder="Any Type" />
                </SelectTrigger>
                <SelectContent className="font-bold">
                  <SelectItem value="any">Any Type</SelectItem>
                  <SelectItem value="fulltime">Full-Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="parttime">Part-Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Slider and Range Filters */}
          <div className="space-y-6 pt-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Min Match Score
                </label>
                <span className="text-sm font-black text-foreground">
                  {minMatch[0]}%
                </span>
              </div>
              <Slider
                defaultValue={[0]}
                max={100}
                step={5}
                value={minMatch}
                onValueChange={(v) => {
                  const valArr = Array.isArray(v) ? v : [v];
                  updateFilter("minMatch", valArr);
                  trackFilterApplied({
                    filter_type: "min_match",
                    filter_value: valArr[0],
                  });
                }}
                className="my-4"
              />
            </div>
            <div className="flex items-center justify-between bg-background p-3 rounded border border-border">
              <label className="text-sm font-bold text-foreground">
                Require Salary Details
              </label>
              <Switch
                checked={requireSalary}
                onCheckedChange={(v) => {
                  updateFilter("requireSalary", v);
                  trackFilterApplied({
                    filter_type: "require_salary",
                    filter_value: v,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Badges */}
      {(searchTitle ||
        searchLoc ||
        workType !== "any" ||
        empType !== "any" ||
        minMatch[0] > 0 ||
        requireSalary) &&
        showFilters && (
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border/50 items-center">
            <span className="text-xs font-bold text-muted-foreground mr-2">
              Active:
            </span>
            {searchTitle && (
              <Badge
                variant="secondary"
                className="font-bold flex gap-1 items-center px-2 py-1"
              >
                Title: &apos;{searchTitle}&apos;{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("searchTitle", "")}
                />
              </Badge>
            )}
            {searchLoc && (
              <Badge
                variant="secondary"
                className="font-bold flex gap-1 items-center px-2 py-1"
              >
                Location: &apos;{searchLoc}&apos;{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("searchLoc", "")}
                />
              </Badge>
            )}
            {workType !== "any" && (
              <Badge
                variant="secondary"
                className="font-bold flex gap-1 items-center px-2 py-1 capitalize"
              >
                {workType}{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("workType", "any")}
                />
              </Badge>
            )}
            {empType !== "any" && (
              <Badge
                variant="secondary"
                className="font-bold flex gap-1 items-center px-2 py-1 capitalize"
              >
                {empType.replace("time", "-time")}{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("empType", "any")}
                />
              </Badge>
            )}
            {minMatch[0] > 0 && (
              <Badge
                variant="secondary"
                className="font-bold flex gap-1 items-center px-2 py-1"
              >
                &gt;{minMatch[0]}% Match{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("minMatch", [0])}
                />
              </Badge>
            )}
            {requireSalary && (
              <Badge
                variant="secondary"
                className="font-bold flex gap-1 items-center px-2 py-1"
              >
                Has Salary{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("requireSalary", false)}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs font-bold ml-auto"
              onClick={() => {
                setFilterState({
                  searchTitle: "",
                  searchLoc: "",
                  workType: "any",
                  empType: "any",
                  minMatch: [0],
                  requireSalary: false,
                });
              }}
            >
              Clear All
            </Button>
          </div>
        )}
    </div>
  );
}
