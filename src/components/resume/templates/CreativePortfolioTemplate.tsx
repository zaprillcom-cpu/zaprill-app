"use client";

import { ExternalLink } from "lucide-react";
import {
  DEFAULT_RESUME_DATA,
  DEFAULT_RESUME_METADATA,
  type ResumeData,
  type ResumeMetadata,
} from "@/types/resume";
import {
  ContactItem,
  formatProfileText,
  getProfileIcon,
  IconMail,
  IconMapPin,
  IconPhone,
  IconWorld,
} from "./SharedComponents";

/**
 * CreativePortfolioTemplate — Modern, bold design for creative professionals
 * ATS Score: 85 (uses some non-standard layouts, but remains parseable)
 */
export default function CreativePortfolioTemplate({
  data,
  metadata,
}: {
  data: ResumeData;
  metadata: ResumeMetadata;
}) {
  // Safety: use fallbacks if data/metadata are empty
  const d = data || DEFAULT_RESUME_DATA;
  const m = metadata || DEFAULT_RESUME_METADATA;

  const basics = d.basics || DEFAULT_RESUME_DATA.basics;
  const work = d.work || [];
  const education = d.education || [];
  const skills = d.skills || [];
  const projects = d.projects || [];
  const certifications = d.certifications || [];
  const languages = d.languages || [];
  const volunteer = d.volunteer || [];
  const awards = d.awards || [];
  const publications = d.publications || [];
  const references = d.references || [];

  const {
    theme = DEFAULT_RESUME_METADATA.theme,
    typography = DEFAULT_RESUME_METADATA.typography,
    sectionVisibility = DEFAULT_RESUME_METADATA.sectionVisibility,
    page = DEFAULT_RESUME_METADATA.page,
  } = m;

  const fontFamily = typography?.font?.family || "Inter";
  const fontSize = `${typography?.font?.size || 11}pt`;
  const lineHeight = typography?.lineHeight || 1.5;

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      sectionVisibility?.summary && basics?.summary ? (
        <section key="summary" className="mb-12">
          <div
            className="text-2xl font-medium leading-relaxed tracking-tight text-foreground"
            dangerouslySetInnerHTML={{ __html: basics.summary }}
          />
        </section>
      ) : null,

    work: () =>
      sectionVisibility?.work && (work || []).length > 0 ? (
        <section key="work" className="mb-12">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-8">
            Experience
          </h2>
          <div className="space-y-12">
            {(work || []).map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <div className="text-sm font-bold text-muted-foreground tabular-nums">
                  {item.startDate} — {item.endDate || "Present"}
                </div>
                <div className="md:col-span-3">
                  <h3 className="text-xl font-bold mb-1">{item.position}</h3>
                  <p className="text-primary font-medium mb-4">
                    {item.company}
                  </p>
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="space-y-3">
                      {(item.highlights || []).map((h, i) => (
                        <li
                          key={i}
                          className="text-muted-foreground leading-relaxed flex gap-4"
                        >
                          <span className="text-primary/40 shrink-0">—</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    education: () =>
      sectionVisibility?.education && (education || []).length > 0 ? (
        <section key="education" className="mb-12">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-8">
            Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(education || []).map((item) => (
              <div key={item.id}>
                <h3 className="text-lg font-bold">{item.institution}</h3>
                <p className="text-muted-foreground mb-1">
                  {item.studyType}
                  {item.area ? ` in ${item.area}` : ""}
                </p>
                <p className="text-sm font-medium text-primary">
                  {item.startDate} — {item.endDate || "Present"}
                  {item.score ? ` · GPA: ${item.score}` : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    skills: () =>
      sectionVisibility?.skills && (skills || []).length > 0 ? (
        <section key="skills" className="mb-12">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-8">
            Expertise
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(skills || []).map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-bold mb-3">{group.name}</h3>
                <ul className="space-y-1">
                  {(group.keywords || []).map((skill, i) => (
                    <li
                      key={i}
                      className="text-muted-foreground text-sm flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary/30" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    projects: () =>
      sectionVisibility?.projects && (projects || []).length > 0 ? (
        <section key="projects" className="mb-12">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-8">
            Featured Projects
          </h2>
          <div className="space-y-12">
            {(projects || []).map((item) => (
              <div key={item.id} className="group">
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    {item.name}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </h3>
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.startDate} — {item.endDate}
                  </span>
                </div>
                {item.description && (
                  <p className="text-muted-foreground leading-relaxed mb-4 max-w-2xl">
                    {item.description}
                  </p>
                )}
                {item.highlights && (item.highlights || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(item.highlights || []).map((h, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    certifications: () =>
      sectionVisibility?.certifications && (certifications || []).length > 0 ? (
        <section key="certifications" className="mb-12">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">
            Certifications
          </h2>
          <div className="flex flex-wrap gap-4">
            {(certifications || []).map((item) => (
              <div
                key={item.id}
                className="p-4 border-2 border-border rounded-2xl hover:border-primary transition-colors"
              >
                <h3 className="font-bold text-sm mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {item.issuer} · {item.date}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    languages: () =>
      sectionVisibility?.languages && (languages || []).length > 0 ? (
        <section key="languages" className="mb-12">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">
            Languages
          </h2>
          <div className="flex flex-wrap gap-8">
            {(languages || []).map((item) => (
              <div key={item.id} className="flex flex-col">
                <span className="text-lg font-bold">{item.language}</span>
                <span className="text-xs font-black uppercase tracking-widest text-primary/60">
                  {item.fluency}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null,
  };

  return (
    <div
      className="resume-page creative-portfolio-template"
      style={{
        fontFamily,
        fontSize,
        lineHeight,
        ["--resume-padding" as string]: `${page?.margin ?? 20}mm`,
        ["--resume-primary" as string]: theme?.primary || "#ff3e00",
        ["--resume-bg" as string]: theme?.background || "#ffffff",
        ["--resume-text" as string]: theme?.text || "#1a1a1a",
        ["--resume-accent" as string]: theme?.accent || "#000000",
        ["--primary" as string]: theme?.primary || "#ff3e00",
        ["--foreground" as string]: theme?.text || "#1a1a1a",
        ["--background" as string]: theme?.background || "#ffffff",
        ["--muted-foreground" as string]: theme?.accent || "#000000",
      }}
    >
      <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-7xl font-black tracking-tighter leading-none mb-4 uppercase">
            {basics.name || "Your Name"}
          </h1>
          <p className="text-2xl font-bold text-primary tracking-tight">
            {basics.label}
          </p>
        </div>

        <div className="flex flex-col gap-2 items-start md:items-end text-sm font-medium">
          <ContactItem
            icon={IconMail}
            text={basics.email}
            href={`mailto:${basics.email}`}
          />
          <ContactItem
            icon={IconPhone}
            text={basics.phone}
            href={`tel:${basics.phone}`}
          />
          <ContactItem
            icon={IconMapPin}
            text={
              basics.location?.city
                ? `${basics.location.city}${basics.location.region ? `, ${basics.location.region}` : ""}`
                : ""
            }
          />
          <ContactItem
            icon={IconWorld}
            text={formatProfileText(basics.url, basics.url)}
            href={basics.url}
          />
        </div>
      </header>

      <main>
        {Object.keys(sectionRenderers).map((key) => sectionRenderers[key]())}
      </main>

      {(basics.profiles || []).length > 0 && (
        <footer className="mt-20 pt-12 border-t-4 border-foreground">
          <div className="flex flex-wrap gap-8">
            {(basics.profiles || []).map((p) => (
              <a
                key={p.network}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center group-hover:bg-primary transition-colors">
                  {(() => {
                    const Icon = getProfileIcon(p.network);
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {p.network}
                  </div>
                  <div className="text-sm font-bold">
                    {p.username || "View Profile"}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
