"use client";

import { Award, ExternalLink } from "lucide-react";
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
 * ExecutiveProTemplate — Corporate, high-end design
 * ATS Score: 95 (very clean, standard headers, high parseability)
 */
export default function ExecutiveProTemplate({
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
        <section key="summary" className="mb-8">
          <h2 className="text-lg font-bold text-primary uppercase tracking-wider border-b-2 border-primary mb-3">
            Executive Summary
          </h2>
          <div
            className="text-muted-foreground leading-relaxed italic"
            dangerouslySetInnerHTML={{ __html: basics.summary }}
          />
        </section>
      ) : null,

    work: () =>
      sectionVisibility?.work && (work || []).length > 0 ? (
        <section key="work" className="mb-8">
          <h2 className="text-lg font-bold text-primary uppercase tracking-wider border-b-2 border-primary mb-4">
            Professional Experience
          </h2>
          <div className="space-y-6">
            {(work || []).map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-md font-bold text-foreground">
                    {item.position}
                  </h3>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {item.startDate} – {item.endDate || "Present"}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-primary font-bold tracking-tight">
                    {item.company}
                  </span>
                  <span className="text-sm text-muted-foreground italic">
                    {item.location}
                  </span>
                </div>
                {item.highlights && (item.highlights || []).length > 0 && (
                  <ul className="space-y-1.5 ml-4">
                    {(item.highlights || []).map((h, i) => (
                      <li
                        key={i}
                        className="text-muted-foreground text-sm list-disc pl-1 leading-snug"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    education: () =>
      sectionVisibility?.education && (education || []).length > 0 ? (
        <section key="education" className="mb-8">
          <h2 className="text-lg font-bold text-primary uppercase tracking-wider border-b-2 border-primary mb-4">
            Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(education || []).map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-foreground">
                    {item.institution}
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    {item.startDate} – {item.endDate || "Present"}
                  </span>
                </div>
                <div className="text-sm text-primary font-medium">
                  {item.studyType}
                  {item.area ? ` in ${item.area}` : ""}
                </div>
                {item.score && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Academic Standing: {item.score}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    skills: () =>
      sectionVisibility?.skills && (skills || []).length > 0 ? (
        <section key="skills" className="mb-8">
          <h2 className="text-lg font-bold text-primary uppercase tracking-wider border-b-2 border-primary mb-4">
            Core Competencies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
            {(skills || []).map((group) => (
              <div key={group.id}>
                <h3 className="text-xs font-bold text-primary uppercase mb-2">
                  {group.name}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(group.keywords || []).map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    projects: () =>
      sectionVisibility?.projects && (projects || []).length > 0 ? (
        <section key="projects" className="mb-8">
          <h2 className="text-lg font-bold text-primary uppercase tracking-wider border-b-2 border-primary mb-4">
            Selected Projects
          </h2>
          <div className="space-y-6">
            {(projects || []).map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-md font-bold text-foreground flex items-center gap-2">
                    {item.name}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {item.startDate} – {item.endDate || ""}
                  </span>
                </div>
                {item.description && (
                  <p className="text-muted-foreground text-sm mb-2 italic">
                    {item.description}
                  </p>
                )}
                {item.highlights && (item.highlights || []).length > 0 && (
                  <ul className="space-y-1 ml-4">
                    {(item.highlights || []).map((h, i) => (
                      <li
                        key={i}
                        className="text-muted-foreground text-sm list-square pl-1"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    certifications: () =>
      sectionVisibility?.certifications && (certifications || []).length > 0 ? (
        <section key="certifications" className="mb-8">
          <h2 className="text-lg font-bold text-primary uppercase tracking-wider border-b-2 border-primary mb-4">
            Certifications & Licenses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(certifications || []).map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-secondary/10 rounded border-l-4 border-primary"
              >
                <div>
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.issuer}</p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    languages: () =>
      sectionVisibility?.languages && (languages || []).length > 0 ? (
        <section key="languages" className="mb-8">
          <h2 className="text-lg font-bold text-primary uppercase tracking-wider border-b-2 border-primary mb-4">
            Languages
          </h2>
          <div className="flex flex-wrap gap-8">
            {(languages || []).map((item) => (
              <div key={item.id} className="flex gap-2 items-center">
                <span className="font-bold text-sm text-foreground">
                  {item.language}
                </span>
                <span className="text-xs text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                  {item.fluency}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    volunteer: () =>
      sectionVisibility?.volunteer && (volunteer || []).length > 0 ? (
        <section key="volunteer" className="mb-8">
          <h2 className="text-lg font-bold text-primary uppercase tracking-wider border-b-2 border-primary mb-4">
            Community Leadership
          </h2>
          <div className="space-y-4">
            {(volunteer || []).map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-foreground">{item.position}</h3>
                  <span className="text-sm text-muted-foreground">
                    {item.startDate} – {item.endDate || ""}
                  </span>
                </div>
                <div className="text-primary font-medium">
                  {item.organization}
                </div>
                {item.summary && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {item.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    awards: () =>
      sectionVisibility?.awards && (awards || []).length > 0 ? (
        <section key="awards" className="mb-8">
          <h2 className="text-lg font-bold text-primary uppercase tracking-wider border-b-2 border-primary mb-4">
            Honors & Awards
          </h2>
          <div className="space-y-4">
            {(awards || []).map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {item.date}
                  </span>
                </div>
                <div className="text-primary font-medium">{item.awarder}</div>
                {item.summary && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {item.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    publications: () =>
      sectionVisibility?.publications && (publications || []).length > 0 ? (
        <section key="publications" className="mb-8">
          <h2 className="text-lg font-bold text-primary uppercase tracking-wider border-b-2 border-primary mb-4">
            Publications
          </h2>
          <div className="space-y-4">
            {(publications || []).map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-foreground">{item.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {item.releaseDate}
                  </span>
                </div>
                <div className="text-primary font-medium">{item.publisher}</div>
                {item.summary && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {item.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    references: () =>
      sectionVisibility?.references && (references || []).length > 0 ? (
        <section key="references" className="mb-8">
          <h2 className="text-lg font-bold text-primary uppercase tracking-wider border-b-2 border-primary mb-4">
            References
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(references || []).map((item) => (
              <div
                key={item.id}
                className="p-4 bg-secondary/5 rounded border border-border italic"
              >
                <p className="text-sm text-muted-foreground mb-2">
                  &quot;{item.reference}&quot;
                </p>
                <p className="text-md font-bold text-foreground">
                  — {item.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null,
  };

  return (
    <div
      className="resume-page executive-pro-template"
      style={{
        fontFamily,
        fontSize,
        lineHeight,
        ["--resume-padding" as string]: `${page?.margin ?? 20}mm`,
        ["--resume-primary" as string]: theme?.primary || "#1e293b",
        ["--resume-bg" as string]: theme?.background || "#ffffff",
        ["--resume-text" as string]: theme?.text || "#334155",
        ["--resume-accent" as string]: theme?.accent || "#3b82f6",
        ["--primary" as string]: theme?.primary || "#1e293b",
        ["--foreground" as string]: theme?.text || "#334155",
        ["--background" as string]: theme?.background || "#ffffff",
        ["--muted-foreground" as string]: theme?.accent || "#3b82f6",
      }}
    >
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-2">
          {basics.name || "Your Name"}
        </h1>
        <p className="text-lg font-bold text-primary uppercase tracking-widest mb-6">
          {basics.label}
        </p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-y border-border py-4">
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

        {(basics.profiles || []).length > 0 && (
          <div className="flex justify-center gap-6 mt-4">
            {(basics.profiles || []).map((p) => (
              <ContactItem
                key={p.network}
                icon={getProfileIcon(p.network)}
                text={formatProfileText(p.url, p.username || p.network)}
                href={p.url}
              />
            ))}
          </div>
        )}
      </header>

      <main>
        {Object.keys(sectionRenderers).map((key) => sectionRenderers[key]())}
      </main>
    </div>
  );
}
