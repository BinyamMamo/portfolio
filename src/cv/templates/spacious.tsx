import { Document, type DocumentProps, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Children, type ReactElement, type ReactNode } from 'react';

import type { CvCredential, CvEntry, CvProject, ResolvedCv } from '@/cv/resolve';
import { Bullets, ink, mailto } from '@/cv/templates/shared';
import type { CvSectionId } from '@/lib/schemas';

/**
 * The legible, unhurried design: generous margins, larger type, more room between entries. It is
 * expected to run past two pages once the full content list prints — that trade is the point of
 * this template, not a defect. It is never what /resume.pdf serves by default.
 */
const s = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 52,
    paddingHorizontal: 64,
    fontFamily: 'Geist',
    fontSize: 10.5,
    lineHeight: 1.65,
    color: ink.text,
  },
  name: { fontSize: 30, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.15 },
  headline: { fontSize: 13, fontWeight: 500, color: ink.brand, marginTop: 6, lineHeight: 1.4 },
  contact: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, fontSize: 9.5, color: ink.muted },
  contactItem: { marginRight: 16, color: ink.muted, textDecoration: 'none' },
  summary: { marginTop: 18, color: ink.body, fontSize: 11, lineHeight: 1.6 },
  section: { marginTop: 26 },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingBottom: 6,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: ink.rule,
  },
  entry: { marginBottom: 16 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  entryTitle: { fontWeight: 700, fontSize: 11 },
  entryOrg: { color: ink.muted },
  period: { fontSize: 9.5, color: ink.subtle },
  bullet: { flexDirection: 'row', marginTop: 5 },
  bulletMark: { width: 12, color: ink.subtle },
  bulletText: { flex: 1, color: ink.body },
  meta: { marginTop: 6, fontSize: 9, color: ink.muted },
  metaLabel: { fontWeight: 600 },
  projectLink: { marginLeft: 12, fontSize: 9.5, color: ink.brand, textDecoration: 'none' },
  client: { color: ink.muted },
  description: { marginTop: 4, color: ink.body },
  highlight: { marginTop: 4, fontStyle: 'italic', color: ink.muted },
  skillRow: { marginBottom: 8 },
  skillTitle: { fontWeight: 700, marginBottom: 2 },
  skillItems: { color: ink.body },
  credential: { marginBottom: 12 },
  credentialNote: { marginTop: 3, color: ink.body },
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
    <View style={s.entry} wrap={false}>
      <View style={s.entryHeader}>
        <Text>
          <Text style={s.entryTitle}>{entry.title}</Text>
          <Text style={s.entryOrg}>{`   ${entry.org}`}</Text>
        </Text>
        <Text style={s.period}>{entry.period}</Text>
      </View>
      <Bullets items={entry.points} row={s.bullet} mark={s.bulletMark} text={s.bulletText} />
      {entry.details && entry.details.items.length > 0 && (
        <Text style={s.meta}>
          <Text style={s.metaLabel}>{entry.details.label}: </Text>
          {entry.details.items.join(', ')}
        </Text>
      )}
      {entry.stack.length > 0 && (
        <Text style={s.meta}>
          <Text style={s.metaLabel}>Tech: </Text>
          {entry.stack.join(', ')}
        </Text>
      )}
    </View>
  );
}

function Project({ project }: { project: CvProject }) {
  return (
    <View style={s.entry} wrap={false}>
      <View style={s.entryHeader}>
        <Text>
          <Text style={s.entryTitle}>{project.name}</Text>
          {project.tag && <Text style={s.client}>{`   ${project.tag}`}</Text>}
          {project.client && <Text style={s.client}>{`   ${project.client}`}</Text>}
        </Text>
        {project.link && (
          <Link src={project.link.url} style={s.projectLink}>
            {project.link.text}
          </Link>
        )}
      </View>
      <Text style={s.description}>{project.description}</Text>
      {project.highlight && <Text style={s.highlight}>{project.highlight}</Text>}
      {project.stack.length > 0 && (
        <Text style={s.meta}>
          <Text style={s.metaLabel}>Tech: </Text>
          {project.stack.join(', ')}
        </Text>
      )}
    </View>
  );
}

/** A certification is a line, not a job, so it prints compactly rather than as a bulleted entry. */
function CredentialRow({ credential }: { credential: CvCredential }) {
  return (
    <View style={s.credential} wrap={false}>
      <View style={s.entryHeader}>
        <Text>
          <Text style={s.entryTitle}>{credential.title}</Text>
          <Text style={s.entryOrg}>{`   ${credential.issuer}`}</Text>
        </Text>
        <Text style={s.period}>{credential.date}</Text>
      </View>
      {credential.note && <Text style={s.credentialNote}>{credential.note}</Text>}
    </View>
  );
}

export function SpaciousTemplate({ cv }: { cv: ResolvedCv }): ReactElement<DocumentProps> {
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
      <Section key="selectedWork" title="Selected work">
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
          <View key={line.label} style={s.skillRow} wrap={false}>
            <Text style={s.skillTitle}>{line.label}</Text>
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
        {cv.summary && <Text style={s.summary}>{cv.summary}</Text>}

        {cv.sections.map((id) => sections[id])}
      </Page>
    </Document>
  );
}
