"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Check, Lock, Palette, Type } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SortableItem from "@/components/resume/editor/SortableItem";
import { TEMPLATE_REGISTRY } from "@/components/resume/templates/registry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Lato",
  "Open Sans",
  "Merriweather",
  "Playfair Display",
  "Source Sans 3",
  "Nunito",
];

const PAGE_FORMATS = [
  { value: "a4", label: "A4 (210 × 297mm)" },
  { value: "letter", label: "US Letter (8.5 × 11in)" },
];

const SECTION_LABELS: Record<string, string> = {
  summary: "Summary",
  work: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  volunteer: "Volunteer",
  awards: "Awards",
  publications: "Publications",
  references: "References",
};

type ThemeKey = "primary" | "accent" | "text" | "background";

export default function SettingsForm({
  serverErrors: _serverErrors,
}: {
  serverErrors?: unknown;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const templateSlug = useSelector((s: RootState) => s.resume.templateSlug);
  const metadata = useSelector((s: RootState) => s.resume.metadata);

  const [isPro, setIsPro] = useState(false);

  // Derive everything from Redux metadata
  const theme = metadata?.theme ?? {
    primary: "#1a1a2e",
    background: "#ffffff",
    text: "#333333",
    accent: "#4a6cf7",
  };
  const typography = metadata?.typography ?? {
    font: { family: "Inter", size: 11 },
    lineHeight: 1.5,
  };
  const page = metadata?.page ?? { format: "a4" as const, margin: 20 };
  const sectionVisibility = metadata?.sectionVisibility ?? {
    summary: true,
    work: true,
    education: true,
    skills: true,
    projects: false,
    certifications: false,
    languages: false,
    volunteer: false,
    awards: false,
    publications: false,
    references: false,
  };
  const sectionOrder = metadata?.sectionOrder ?? [
    "summary",
    "work",
    "education",
    "skills",
    "projects",
  ];

  useEffect(() => {
    fetch("/api/billing/subscription")
      .then((r) => r.json())
      .then((data) => {
        setIsPro(!!(data.isPro ?? data.subscription));
      })
      .catch(() => setIsPro(false));
  }, []);

  const orderableSections = useMemo(
    () => sectionOrder.filter((key) => key in SECTION_LABELS),
    [sectionOrder],
  );

  // ── Refs for latest derived state (avoid stale closures in callbacks) ──
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const typographyRef = useRef(typography);
  typographyRef.current = typography;
  const pageRef = useRef(page);
  pageRef.current = page;
  const sectionVisibilityRef = useRef(sectionVisibility);
  sectionVisibilityRef.current = sectionVisibility;

  // ── Direct Redux dispatch helpers ──────────────────────

  const setTemplate = (slug: string) => {
    dispatch(resumeActions.setTemplateSlug(slug));
  };

  const setThemeColor = useCallback(
    (key: ThemeKey, value: string) => {
      dispatch(
        resumeActions.setMetadata({
          theme: { ...themeRef.current, [key]: value },
        }),
      );
    },
    [dispatch],
  );

  const handleThemeHexInput = useCallback(
    (key: ThemeKey, value: string) => {
      if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
        dispatch(
          resumeActions.setMetadata({
            theme: { ...themeRef.current, [key]: value },
          }),
        );
      }
    },
    [dispatch],
  );

  const setFontFamily = useCallback(
    (family: string) => {
      const t = typographyRef.current;
      dispatch(
        resumeActions.setMetadata({
          typography: { ...t, font: { ...t.font, family } },
        }),
      );
    },
    [dispatch],
  );

  const setFontSize = useCallback(
    (size: number) => {
      const t = typographyRef.current;
      dispatch(
        resumeActions.setMetadata({
          typography: { ...t, font: { ...t.font, size } },
        }),
      );
    },
    [dispatch],
  );

  const setLineHeight = useCallback(
    (lineHeight: number) => {
      const t = typographyRef.current;
      dispatch(
        resumeActions.setMetadata({
          typography: { ...t, lineHeight },
        }),
      );
    },
    [dispatch],
  );

  const setPageFormat = useCallback(
    (format: "a4" | "letter") => {
      const p = pageRef.current;
      dispatch(resumeActions.setMetadata({ page: { ...p, format } }));
    },
    [dispatch],
  );

  const setMargin = useCallback(
    (margin: number) => {
      const p = pageRef.current;
      dispatch(resumeActions.setMetadata({ page: { ...p, margin } }));
    },
    [dispatch],
  );

  const toggleSectionVisibility = useCallback(
    (key: string) => {
      const sv = sectionVisibilityRef.current;
      dispatch(
        resumeActions.setMetadata({
          sectionVisibility: {
            ...sv,
            [key]: !sv[key as keyof typeof sv],
          },
        }),
      );
    },
    [dispatch],
  );

  const handleSectionDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const from = sectionOrder.indexOf(active.id as string);
        const to = sectionOrder.indexOf(over.id as string);
        if (from !== -1 && to !== -1) {
          dispatch(resumeActions.reorderSections({ from, to }));
        }
      }
    },
    [dispatch, sectionOrder],
  );

  // ── Theme color inputs ──────────────────────────────────

  type ThemeColorState = { [k in ThemeKey]: string };
  const [themeInputs, setThemeInputs] = useState<ThemeColorState>({
    primary: theme.primary ?? "",
    accent: theme.accent ?? "",
    text: theme.text ?? "",
    background: theme.background ?? "",
  });
  // Sync input state when Redux theme changes externally
  useEffect(() => {
    setThemeInputs({
      primary: theme.primary ?? "",
      accent: theme.accent ?? "",
      text: theme.text ?? "",
      background: theme.background ?? "",
    });
  }, [theme.primary, theme.accent, theme.text, theme.background]);

  return (
    <div className="space-y-8">
      {/* Template Selection */}
      <section>
        <h3 className="mb-4 font-black text-muted-foreground text-sm uppercase tracking-widest">
          Template
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TEMPLATE_REGISTRY.map((tmpl) => {
            const locked = tmpl.isPremium && !isPro;
            return (
              <button
                type="button"
                key={tmpl.slug}
                onClick={() => !locked && setTemplate(tmpl.slug)}
                className={`relative rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                  templateSlug === tmpl.slug
                    ? "border-primary bg-primary/5"
                    : locked
                      ? "cursor-not-allowed border-border bg-muted/20 opacity-60"
                      : "cursor-pointer border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                {templateSlug === tmpl.slug && (
                  <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                {locked && (
                  <div className="absolute top-3 right-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <h4 className="font-bold text-sm">{tmpl.name}</h4>
                <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                  {tmpl.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-bold text-[10px] uppercase"
                  >
                    {tmpl.layout}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="font-bold text-[10px] uppercase"
                  >
                    ATS {tmpl.atsScore}%
                  </Badge>
                  {locked && (
                    <Badge
                      variant="secondary"
                      className="font-bold text-[10px] uppercase"
                    >
                      Pro
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Colors */}
      <section>
        <h3 className="mb-4 flex items-center gap-2 font-black text-muted-foreground text-sm uppercase tracking-widest">
          <Palette className="h-4 w-4" /> Colors
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              { key: "primary" as ThemeKey, label: "Primary" },
              { key: "accent" as ThemeKey, label: "Accent" },
              { key: "text" as ThemeKey, label: "Text" },
              { key: "background" as ThemeKey, label: "Background" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                {label}
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme[key] ?? "#000000"}
                  onChange={(e) => setThemeColor(key, e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                />
                <Input
                  value={themeInputs[key]}
                  onChange={(e) => {
                    const v = e.target.value;
                    setThemeInputs((prev) => ({ ...prev, [key]: v }));
                    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) {
                      handleThemeHexInput(key, v);
                    }
                  }}
                  onBlur={() => {
                    // Revert to Redux value on blur if input is invalid
                    setThemeInputs((prev) => ({
                      ...prev,
                      [key]: theme[key] ?? "",
                    }));
                  }}
                  className="h-10 font-mono text-xs"
                  maxLength={7}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h3 className="mb-4 flex items-center gap-2 font-black text-muted-foreground text-sm uppercase tracking-widest">
          <Type className="h-4 w-4" /> Typography
        </h3>
        <Card className="border-border">
          <CardContent className="space-y-5 p-5">
            <div className="space-y-2">
              <Label className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                Font Family
              </Label>
              <Select
                value={typography.font.family}
                onValueChange={(v) => {
                  if (v) setFontFamily(v);
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Font Size
                </Label>
                <span className="font-bold text-sm">
                  {typography.font.size}pt
                </span>
              </div>
              <Slider
                value={[typography.font.size]}
                min={9}
                max={14}
                step={0.5}
                onValueChange={(v) => setFontSize(Array.isArray(v) ? v[0] : v)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Line Height
                </Label>
                <span className="font-bold text-sm">
                  {typography.lineHeight}
                </span>
              </div>
              <Slider
                value={[typography.lineHeight]}
                min={1.2}
                max={2.0}
                step={0.05}
                onValueChange={(v) =>
                  setLineHeight(Array.isArray(v) ? v[0] : v)
                }
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Page Settings */}
      <section>
        <h3 className="mb-4 font-black text-muted-foreground text-sm uppercase tracking-widest">
          Page Layout
        </h3>
        <Card className="border-border">
          <CardContent className="space-y-5 p-5">
            <div className="space-y-2">
              <Label className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                Page Format
              </Label>
              <Select
                value={page.format}
                onValueChange={(v) => {
                  if (v) setPageFormat(v as "a4" | "letter");
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_FORMATS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Margin
                </Label>
                <span className="font-bold text-sm">{page.margin}mm</span>
              </div>
              <Slider
                value={[page.margin]}
                min={10}
                max={30}
                step={1}
                onValueChange={(v) => setMargin(Array.isArray(v) ? v[0] : v)}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section Visibility */}
      <section>
        <h3 className="mb-4 font-black text-muted-foreground text-sm uppercase tracking-widest">
          Section Visibility
        </h3>
        <Card className="border-border">
          <CardContent className="space-y-1 p-4">
            {Object.entries(SECTION_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
              >
                <span className="font-medium text-sm">{label}</span>
                <Switch
                  checked={
                    (sectionVisibility as unknown as Record<string, boolean>)[
                      key
                    ] ?? false
                  }
                  onCheckedChange={() => toggleSectionVisibility(key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Section Order */}
      <section>
        <h3 className="mb-4 font-black text-muted-foreground text-sm uppercase tracking-widest">
          Section Order
        </h3>
        <p className="mb-3 text-muted-foreground text-xs">
          Drag sections to reorder them on your resume
        </p>
        <Card className="border-border">
          <CardContent className="p-2">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={orderableSections}
                strategy={verticalListSortingStrategy}
              >
                {orderableSections.map((key: string) => (
                  <SortableItem key={key} id={key}>
                    <div className="flex items-center gap-2 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50">
                      <span className="pl-6 font-medium text-sm">
                        {SECTION_LABELS[key] || key}
                      </span>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
