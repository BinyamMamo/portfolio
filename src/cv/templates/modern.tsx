import { Document, type DocumentProps, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Children, type ReactElement, type ReactNode } from 'react';

import type { CvCredential, CvEntry, CvProject, ResolvedCv } from '@/cv/resolve';
import { Bullets, ink, mailto } from '@/cv/templates/shared';
import type { CvSectionId } from '@/lib/schemas';

/** Wide enough for "Jul 2024 - Sep 2024" on one line. */
const MARGIN_COLUMN = 112;

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: 'Geist',
    fontSize: 9,
    lineHeight: 1.45,
    color: ink.text,
  },
  header: { paddingBottom: 12, borderBottomWidth: 1.5, borderBottomColor: ink.brand },
  // Large text needs its own line height; the page's 1.45 is sized for body text and makes lines collide.
  name: { fontSize: 24, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 },
  headline: { fontSize: 11, fontWeight: 500, color: ink.brand, marginTop: 2, lineHeight: 1.3 },
  contact: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, color: ink.muted },
  contactItem: { marginRight: 12, color: ink.muted, textDecoration: 'none' },
  summary: { marginTop: 12, color: ink.body, fontSize: 9.5 },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: 600,
    // Wide tracking makes pdftotext emit "E D U C AT I O N", which no keyword match survives.
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: ink.brand,
    marginBottom: 6,
  },
  row: { flexDirection: 'row', marginBottom: 9 },
  margin: { width: MARGIN_COLUMN, paddingRight: 10, fontFamily: 'Geist Mono', fontSize: 7.5, color: ink.subtle },
  body: { flex: 1 },
  entryTitle: { fontWeight: 600, fontSize: 9.5 },
  entryOrg: { color: ink.muted },
  bullet: { flexDirection: 'row', marginTop: 2 },
  bulletMark: { width: 9, color: ink.brand },
  bulletText: { flex: 1, color: ink.body },
  // No flex here: inside a column, flex: 1 collapses the text's height and the next line draws over it.
  description: { color: ink.body },
  meta: { marginTop: 3, fontSize: 8, color: ink.muted },
  projectLink: { color: ink.brand, textDecoration: 'none', marginRight: 8 },
  links: { flexDirection: 'row', marginTop: 2 },
  highlight: { marginTop: 2, fontStyle: 'italic', color: ink.muted },
  skillItems: { flex: 1, color: ink.body },
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  const [first, ...rest] = Children.toArray(children);
  return (
    <View style={s.section}>
      {/* The heading travels with its first entry, so it is never left alone at the bottom of a page. */}
      <View wrap={false}>
        <Text style={s.sectionTitle}>{title}</Text>
        {first}
      </View>
      {rest}
    </View>
  );
}

function Entry({ entry }: { entry: CvEntry }) {
  return (
    <View style={s.row} wrap={false}>
      <Text style={s.margin}>{entry.period}</Text>
      <View style={s.body}>
        <Text>
          <Text style={s.entryTitle}>{entry.title}</Text>
          <Text style={s.entryOrg}>{`, ${entry.org}`}</Text>
        </Text>
        <Bullets items={entry.points} row={s.bullet} mark={s.bulletMark} text={s.bulletText} />
        {entry.details && entry.details.items.length > 0 && (
          <Text style={s.meta}>{`${entry.details.label}: ${entry.details.items.join(', ')}`}</Text>
        )}
        {entry.stack.length > 0 && <Text style={s.meta}>{entry.stack.join(' / ')}</Text>}
      </View>
    </View>
  );
}

function Project({ project }: { project: CvProject }) {
  return (
    <View style={s.row} wrap={false}>
      <Text style={s.margin}>{project.stack.slice(0, 3).join('\n')}</Text>
      <View style={s.body}>
        <Text>
          <Text style={s.entryTitle}>{project.name}</Text>
          {project.client && (
            <Text style={s.entryOrg}>{`, ${project.client}${project.year ? ` (${project.year})` : ''}`}</Text>
          )}
        </Text>
        <Text style={s.description}>{project.description}</Text>
        {project.highlight && <Text style={s.highlight}>{project.highlight}</Text>}
        {project.link && (
          <View style={s.links}>
            <Link src={project.link.url} style={s.projectLink}>
              {project.link.text}
            </Link>
          </View>
        )}
      </View>
    </View>
  );
}

/** A certification is a line, not a job, so it prints compactly rather than as a bulleted entry. */
function CredentialRow({ credential }: { credential: CvCredential }) {
  return (
    <View style={s.row} wrap={false}>
      <Text style={s.margin}>{credential.date}</Text>
      <View style={s.body}>
        <Text>
          <Text style={s.entryTitle}>{credential.title}</Text>
          <Text style={s.entryOrg}>{`   ${credential.issuer}`}</Text>
        </Text>
        {credential.note && <Text style={s.description}>{credential.note}</Text>}
      </View>
    </View>
  );
}

export function ModernTemplate({ cv }: { cv: ResolvedCv }): ReactElement<DocumentProps> {
  // Built once and looked up by id, so the order on the page is exactly the order in settings.
  const sections: Record<CvSectionId, ReactNode> = {
    experience: cv.experience.length > 0 && (
      <Section key="experience" title="Experience">
        {cv.experience.map((entry) => (
          <Entry key={entry.id} entry={entry} />
        ))}
      </Section>
    ),
    selectedWork: cv.clientProjects.length > 0 && (
      <Section key="selectedWork" title="Client work">
        {cv.clientProjects.map((project) => (
          <Project key={project.name} project={project} />
        ))}
      </Section>
    ),
    projects: cv.projects.length > 0 && (
      <Section key="projects" title="Projects">
        {cv.projects.map((project) => (
          <Project key={project.name} project={project} />
        ))}
      </Section>
    ),
    skills: cv.skillLines.length > 0 && (
      <Section key="skills" title="Skills">
        {cv.skillLines.map((line) => (
          <View key={line.label} style={s.row} wrap={false}>
            <Text style={s.margin}>{line.label}</Text>
            <Text style={s.skillItems}>{line.items}</Text>
          </View>
        ))}
      </Section>
    ),
    certifications: cv.certifications.length > 0 && (
      <Section key="certifications" title="Certifications">
        {cv.certifications.map((credential) => (
          <CredentialRow key={credential.id} credential={credential} />
        ))}
      </Section>
    ),
    activities: cv.activities.length > 0 && (
      <Section key="activities" title="Extracurricular and leadership">
        {cv.activities.map((entry) => (
          <Entry key={entry.id} entry={entry} />
        ))}
      </Section>
    ),
    education: cv.education.length > 0 && (
      <Section key="education" title="Education">
        {cv.education.map((entry) => (
          <Entry key={entry.id} entry={entry} />
        ))}
      </Section>
    ),
  };

  return (
    <Document title={`${cv.name} CV`} author={cv.name}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{cv.name}</Text>
          <Text style={s.headline}>{cv.headline}</Text>
          <View style={s.contact}>
            {cv.location && <Text style={s.contactItem}>{cv.location}</Text>}
            <Link src={mailto(cv.email)} style={s.contactItem}>
              {cv.email}
            </Link>
            {cv.phone && <Text style={s.contactItem}>{cv.phone}</Text>}
            {cv.links.map((link) => (
              <Link key={link.url} src={link.url} style={s.contactItem}>
                {link.text}
              </Link>
            ))}
          </View>
        </View>
        {cv.summary && <Text style={s.summary}>{cv.summary}</Text>}

        {cv.sections.map((id) => sections[id])}
      </Page>
    </Document>
  );
}
