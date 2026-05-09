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
    <div className="flex gap-3 w-full" ref={containerRef}>
      <div className="relative flex-1" ref={inputWrapperRef}>
        <div
          className={cn(
            "relative group transition-all duration-300",
            open && "ring-2 ring-primary/20 rounded-xl",
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
            className="bg-background border-border font-bold h-12 w-full pl-11 pr-4 focus-visible:ring-primary shadow-sm rounded-xl transition-all"
          />
          <Search
            className={cn(
              "absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors duration-300",
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
                  className="bg-popover/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden"
                >
                  <div className="max-h-[350px] overflow-y-auto py-2 custom-scrollbar">
                    {isLoading && (
                      <div className="p-6 flex items-center justify-center gap-3">
                        <div className="relative">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <div className="absolute inset-0 blur-sm bg-primary/20 animate-pulse rounded-full" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-tighter text-foreground/70">
                          Analyzing Market Titles...
                        </span>
                      </div>
                    )}

                    {!isLoading && suggestions.length > 0 && (
                      <div className="flex flex-col px-1">
                        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
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
                            className="group flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded-xl mx-1 mb-0.5"
                          >
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors">
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
        className="h-12 px-8 font-black shrink-0 shadow-lg hover:shadow-xl transition-all active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
        disabled={!value.trim()}
      >
        <Plus className="h-5 w-5 mr-2 stroke-3" />
        ADD
      </Button>
    </div>
  );
}
