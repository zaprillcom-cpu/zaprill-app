"use client";

import { Briefcase, Loader2, Plus, Search, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface JobTitleAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: (title: string) => void;
  placeholder?: string;
}

export function JobTitleAutocomplete({
  value,
  onChange,
  onAdd,
  placeholder = "Enter job title...",
}: JobTitleAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputWrapperRef = React.useRef<HTMLDivElement>(null);
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Update position for the portal
  const updatePosition = React.useCallback(() => {
    if (inputWrapperRef.current) {
      const rect = inputWrapperRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      updatePosition();
      // Use capture phase to handle nested scroll containers
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  const fetchSuggestions = React.useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/job-titles?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      setSuggestions(data.titles || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const query = value.trim();
    if (query.length >= 2) {
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [value, fetchSuggestions]);

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        const portalContent = document.getElementById(
          "autocomplete-portal-content",
        );
        if (portalContent?.contains(event.target as Node)) return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (title: string) => {
    onAdd(title);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      handleSelect(value);
    }
    if (e.key === "Escape") setOpen(false);
  };

  const showDropdown = open && (suggestions.length > 0 || isLoading);

  return (
    <div className="flex w-full gap-3" ref={containerRef}>
      <div className="relative flex-1" ref={inputWrapperRef}>
        <div
          className={cn(
            "group relative transition-all duration-300",
            open && "rounded-xl ring-2 ring-primary/20",
          )}
        >
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className="h-12 w-full rounded-xl border-border bg-background pr-4 pl-11 font-bold shadow-sm transition-all focus-visible:ring-primary"
          />
          <Search
            className={cn(
              "-translate-y-1/2 absolute top-1/2 left-3.5 h-4.5 w-4.5 transition-colors duration-300",
              open ? "text-primary" : "text-muted-foreground",
            )}
          />
        </div>

        {typeof document !== "undefined" &&
          createPortal(
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  id="autocomplete-portal-content"
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: coords.top + 6,
                    left: coords.left,
                    width: coords.width,
                    zIndex: 9999,
                  }}
                  className="overflow-hidden rounded-2xl border border-border/50 bg-popover/90 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-xl"
                >
                  <div className="custom-scrollbar max-h-[350px] overflow-y-auto py-2">
                    {isLoading && (
                      <div className="flex items-center justify-center gap-3 p-6">
                        <div className="relative">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-sm" />
                        </div>
                        <span className="font-black text-foreground/70 text-sm uppercase tracking-tighter">
                          Analyzing Market Titles...
                        </span>
                      </div>
                    )}

                    {!isLoading && suggestions.length > 0 && (
                      <div className="flex flex-col px-1">
                        <div className="flex items-center gap-2 px-3 py-2 font-black text-[10px] text-muted-foreground uppercase tracking-widest">
                          <Sparkles className="h-3 w-3 text-primary" />
                          Suggested Matches
                        </div>
                        {suggestions.map((title, i) => (
                          <motion.button
                            key={title}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => handleSelect(title)}
                            className="group mx-1 mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary-foreground/20">
                              <Briefcase className="h-4 w-4 text-muted-foreground group-hover:text-primary-foreground" />
                            </div>
                            <span className="font-bold tracking-tight">
                              {title}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </div>

      <Button
        onClick={() => onAdd(value)}
        className="h-12 shrink-0 rounded-xl bg-primary px-8 font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl active:scale-95"
        disabled={!value.trim()}
      >
        <Plus className="mr-2 h-5 w-5 stroke-3" />
        ADD
      </Button>
    </div>
  );
}
