import { Document, type DocumentProps, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Children, type ReactElement, type ReactNode } from 'react';

import type { CvEntry, CvProject, ResolvedCv } from '@/cv/resolve';
import { Bullets, ink, mailto } from '@/cv/templates/shared';

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 46,
    fontFamily: 'Geist',
    fontSize: 9.5,
    lineHeight: 1.45,
    color: ink.text,
  },
  // Large text needs its own line height; the page's 1.45 is sized for body text and makes lines collide.
  name: { fontSize: 22, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.2 },
  headline: { fontSize: 11, fontWeight: 500, color: ink.muted, marginTop: 2, lineHeight: 1.3 },
  contact: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, fontSize: 9, color: ink.muted },
  contactItem: { marginRight: 12, color: ink.muted, textDecoration: 'none' },
  summary: { marginTop: 12, color: ink.body },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingBottom: 3,
    marginBottom: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: ink.rule,
  },
  entry: { marginBottom: 10 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  entryTitle: { fontWeight: 600 },
  entryOrg: { color: ink.muted },
  period: { fontSize: 9, color: ink.subtle },
  bullet: { flexDirection: 'row', marginTop: 2 },
  bulletMark: { width: 10, color: ink.subtle },
  bulletText: { flex: 1, color: ink.body },
  meta: { marginTop: 3, fontSize: 8.5, color: ink.muted },
  metaLabel: { fontWeight: 600 },
  projectLinks: { flexDirection: 'row' },
  projectLink: { marginLeft: 10, fontSize: 9, color: ink.muted, textDecoration: 'none' },
  description: { marginTop: 1, color: ink.body },
  highlight: { marginTop: 2, fontStyle: 'italic', color: ink.muted },
  skillRow: { flexDirection: 'row', marginBottom: 3 },
  skillTitle: { width: 120, fontWeight: 600 },
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
        <Text style={s.entryTitle}>{project.name}</Text>
        <View style={s.projectLinks}>
          {project.links.map((link) => (
            <Link key={link.url} src={link.url} style={s.projectLink}>
              {link.label}
            </Link>
          ))}
        </View>
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

export function ClassicTemplate({ cv }: { cv: ResolvedCv }): ReactElement<DocumentProps> {
  const skills = cv.skills.filter((group) => group.items.length > 0);

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

        {cv.experience.length > 0 && (
          <Section title="Experience">
            {cv.experience.map((entry) => (
              <Entry key={entry.id} entry={entry} />
            ))}
          </Section>
        )}
        {cv.projects.length > 0 && (
          <Section title="Projects">
            {cv.projects.map((project) => (
              <Project key={project.name} project={project} />
            ))}
          </Section>
        )}
        {skills.length > 0 && (
          <Section title="Skills">
            {skills.map((group) => (
              <View key={group.title} style={s.skillRow}>
                <Text style={s.skillTitle}>{group.title}</Text>
                <Text style={s.skillItems}>{group.items.join(', ')}</Text>
              </View>
            ))}
          </Section>
        )}
        {cv.education.length > 0 && (
          <Section title="Education">
            {cv.education.map((entry) => (
              <Entry key={entry.id} entry={entry} />
            ))}
          </Section>
        )}
      </Page>
    </Document>
  );
}
