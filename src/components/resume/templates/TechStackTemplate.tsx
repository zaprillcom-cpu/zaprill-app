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
 * TechStackTemplate — Two-column layout with skills sidebar
 * ATS Score: 90 (highly parseable, sidebar uses proper HTML structure)
 */
export default function TechStackTemplate({
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
      className="resume-page tech-stack-template"
      style={{
        fontFamily,
        fontSize,
        lineHeight,
        ["--resume-padding" as string]: `${page?.margin ?? 20}mm`,
        ["--resume-primary" as string]: theme?.primary || "#1a1a2e",
        ["--resume-bg" as string]: theme?.background || "#ffffff",
        ["--resume-text" as string]: theme?.text || "#333333",
        ["--resume-accent" as string]: theme?.accent || "#4a6cf7",
      }}
    >
      {/* Header — full width */}
      <header className="ts-header">
        <h1 className="resume-name">{basics.name || "Your Name"}</h1>
        {basics.label && <p className="resume-label">{basics.label}</p>}
        <div className="resume-contact">
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
      </header>

      {/* Two-column layout */}
      <div className="ts-columns">
        {/* Main column (left) */}
        <div className="ts-main">
          {/* Summary */}
          {sectionVisibility?.summary && basics?.summary && (
            <section className="resume-section">
              <h2 className="resume-section-title">Summary</h2>
              <div
                className="resume-text"
                dangerouslySetInnerHTML={{ __html: basics.summary }}
              />
            </section>
          )}

          {/* Experience */}
          {sectionVisibility?.work && (work || []).length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">Experience</h2>
              {(work || []).map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <div>
                      <h3 className="resume-entry-title">{item.position}</h3>
                      <span className="resume-entry-subtitle">
                        {item.company}
                        {item.location ? ` · ${item.location}` : ""}
                      </span>
                    </div>
                    <span className="resume-entry-date">
                      {item.startDate}
                      {item.endDate ? ` – ${item.endDate}` : " – Present"}
                    </span>
                  </div>
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="resume-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={`${item.id}-h-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Projects */}
          {sectionVisibility?.projects && (projects || []).length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">Projects</h2>
              {(projects || []).map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <h3 className="resume-entry-title">{item.name}</h3>
                    <span className="resume-entry-date">
                      {item.startDate}
                      {item.endDate ? ` – ${item.endDate}` : ""}
                    </span>
                  </div>
                  {item.description && (
                    <p className="resume-text">{item.description}</p>
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="resume-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={`${item.id}-h-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Volunteer */}
          {sectionVisibility?.volunteer && (volunteer || []).length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">Volunteer</h2>
              {(volunteer || []).map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <div>
                      <h3 className="resume-entry-title">{item.position}</h3>
                      <p className="resume-entry-subtitle">
                        {item.organization}
                      </p>
                    </div>
                    <span className="resume-entry-date">
                      {item.startDate}
                      {item.endDate ? ` – ${item.endDate}` : " – Present"}
                    </span>
                  </div>
                  {item.summary && (
                    <p className="resume-text">{item.summary}</p>
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="resume-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={`vol-${item.id}-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Sidebar (right) */}
        <aside className="ts-sidebar">
          {/* Skills */}
          {sectionVisibility?.skills && (skills || []).length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">Skills</h2>
              {(skills || []).map((group) => (
                <div key={group.id} className="ts-skill-block">
                  <h4 className="ts-skill-category">{group.name}</h4>
                  <div className="ts-skill-tags">
                    {(group.keywords || []).map((kw) => (
                      <span key={kw} className="ts-tag">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {sectionVisibility?.education && (education || []).length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">Education</h2>
              {(education || []).map((item) => (
                <div key={item.id} className="ts-edu-block">
                  <h4 className="ts-edu-title">{item.institution}</h4>
                  <p className="ts-edu-degree">
                    {item.studyType}
                    {item.area ? ` in ${item.area}` : ""}
                  </p>
                  <p className="ts-edu-date">
                    {item.startDate}
                    {item.endDate ? ` – ${item.endDate}` : " – Present"}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {sectionVisibility?.certifications &&
            (certifications || []).length > 0 && (
              <section className="resume-section">
                <h2 className="ts-sidebar-title">Certifications</h2>
                {(certifications || []).map((item) => (
                  <div key={item.id} className="ts-cert-block">
                    <h4 className="ts-edu-title">{item.name}</h4>
                    <p className="ts-edu-degree">{item.issuer}</p>
                    {item.date && <p className="ts-edu-date">{item.date}</p>}
                  </div>
                ))}
              </section>
            )}

          {/* Languages */}
          {sectionVisibility?.languages && (languages || []).length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">Languages</h2>
              {(languages || []).map((item) => (
                <div key={item.id} className="ts-lang-item">
                  <span className="ts-lang-name">{item.language}</span>
                  <span className="ts-lang-level">{item.fluency}</span>
                </div>
              ))}
            </section>
          )}

          {/* Awards */}
          {sectionVisibility?.awards && (awards || []).length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">Awards</h2>
              {(awards || []).map((item) => (
                <div key={item.id} className="ts-cert-block">
                  <h4 className="ts-edu-title">{item.title}</h4>
                  <p className="ts-edu-degree">{item.awarder}</p>
                  {item.date && <p className="ts-edu-date">{item.date}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Publications */}
          {sectionVisibility?.publications &&
            (publications || []).length > 0 && (
              <section className="resume-section">
                <h2 className="ts-sidebar-title">Publications</h2>
                {(publications || []).map((item) => (
                  <div key={item.id} className="ts-cert-block">
                    <h4 className="ts-edu-title">{item.name}</h4>
                    <p className="ts-edu-degree">{item.publisher}</p>
                    {item.releaseDate && (
                      <p className="ts-edu-date">{item.releaseDate}</p>
                    )}
                  </div>
                ))}
              </section>
            )}

          {/* References */}
          {sectionVisibility?.references && (references || []).length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">References</h2>
              {(references || []).map((item) => (
                <div key={item.id} className="ts-cert-block">
                  <h4 className="ts-edu-title">{item.name}</h4>
                  {item.reference && (
                    <p className="ts-edu-degree">{item.reference}</p>
                  )}
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
