"use client";

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
 * ModernSplitTemplate — Two-column layout with fixed sidebar
 * ATS Score: 88 (clean structure, sidebar is parseable)
 */
export default function ModernSplitTemplate({
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

  return (
    <div
      className="resume-page modern-split-template"
      style={{
        fontFamily,
        fontSize,
        lineHeight,
        ["--resume-padding" as string]: `${page?.margin ?? 20}mm`,
        ["--resume-primary" as string]: theme?.primary || "#2563eb",
        ["--resume-bg" as string]: theme?.background || "#ffffff",
        ["--resume-text" as string]: theme?.text || "#1f2937",
        ["--resume-accent" as string]: theme?.accent || "#eff6ff",
      }}
    >
      <div className="ms-container">
        {/* Sidebar (left) */}
        <aside className="ms-sidebar">
          <header className="ms-header">
            <h1 className="resume-name">{basics.name || "Your Name"}</h1>
            <p className="resume-label">{basics.label}</p>
          </header>

          <div className="ms-sidebar-content">
            {/* Contact */}
            <section className="ms-sidebar-section">
              <h3 className="ms-sidebar-title">Contact</h3>
              <div className="ms-sidebar-list">
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
                {(basics.profiles || []).map((p) => (
                  <ContactItem
                    key={p.network}
                    icon={getProfileIcon(p.network)}
                    text={formatProfileText(p.url, p.username || p.network)}
                    href={p.url}
                  />
                ))}
              </div>
            </section>

            {/* Skills */}
            {sectionVisibility?.skills && (skills || []).length > 0 && (
              <section className="ms-sidebar-section">
                <h3 className="ms-sidebar-title">Skills</h3>
                <div className="ms-skills-list">
                  {(skills || []).map((group) => (
                    <div key={group.id} className="ms-skill-group">
                      <h4 className="ms-skill-name">{group.name}</h4>
                      <div className="ms-skill-keywords">
                        {(group.keywords || []).map((kw) => (
                          <span key={kw} className="ms-skill-badge">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {sectionVisibility?.languages && (languages || []).length > 0 && (
              <section className="ms-sidebar-section">
                <h3 className="ms-sidebar-title">Languages</h3>
                <div className="ms-sidebar-list">
                  {(languages || []).map((item) => (
                    <div key={item.id} className="ms-lang-item">
                      <span className="ms-lang-name">{item.language}</span>
                      <span className="ms-lang-level">{item.fluency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>

        {/* Main (right) */}
        <main className="ms-main">
          {/* Summary */}
          {sectionVisibility?.summary && basics?.summary && (
            <section className="ms-section">
              <h2 className="ms-section-title">Summary</h2>
              <div
                className="resume-text"
                dangerouslySetInnerHTML={{ __html: basics.summary }}
              />
            </section>
          )}

          {/* Experience */}
          {sectionVisibility?.work && (work || []).length > 0 && (
            <section className="ms-section">
              <h2 className="ms-section-title">Experience</h2>
              {(work || []).map((item) => (
                <div key={item.id} className="ms-entry">
                  <div className="ms-entry-header">
                    <div>
                      <h3 className="ms-entry-title">{item.position}</h3>
                      <p className="ms-entry-org">{item.company}</p>
                    </div>
                    <span className="ms-entry-date">
                      {item.startDate} – {item.endDate || "Present"}
                    </span>
                  </div>
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="ms-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={`${item.id}-h-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {sectionVisibility?.education && (education || []).length > 0 && (
            <section className="ms-section">
              <h2 className="ms-section-title">Education</h2>
              {(education || []).map((item) => (
                <div key={item.id} className="ms-entry">
                  <div className="ms-entry-header">
                    <div>
                      <h3 className="ms-entry-title">{item.institution}</h3>
                      <p className="ms-entry-org">
                        {item.studyType}
                        {item.area ? ` in ${item.area}` : ""}
                      </p>
                    </div>
                    <span className="ms-entry-date">
                      {item.startDate} – {item.endDate || "Present"}
                    </span>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Projects */}
          {sectionVisibility?.projects && (projects || []).length > 0 && (
            <section className="ms-section">
              <h2 className="ms-section-title">Projects</h2>
              {(projects || []).map((item) => (
                <div key={item.id} className="ms-entry">
                  <div className="ms-entry-header">
                    <h3 className="ms-entry-title">{item.name}</h3>
                    <span className="ms-entry-date">
                      {item.startDate} – {item.endDate || ""}
                    </span>
                  </div>
                  {item.description && (
                    <p className="ms-text mb-2">{item.description}</p>
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="ms-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={`${item.id}-h-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {sectionVisibility?.certifications &&
            (certifications || []).length > 0 && (
              <section className="ms-section">
                <h2 className="ms-section-title">Certifications</h2>
                {(certifications || []).map((item) => (
                  <div key={item.id} className="ms-entry-inline">
                    <span className="font-bold">{item.name}</span>
                    <span className="mx-2 text-muted-foreground">|</span>
                    <span>{item.issuer}</span>
                    <span className="ml-auto text-muted-foreground">
                      {item.date}
                    </span>
                  </div>
                ))}
              </section>
            )}
        </main>
      </div>
    </div>
  );
}
