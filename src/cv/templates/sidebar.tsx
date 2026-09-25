import { Document, type DocumentProps, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Children, type ReactElement, type ReactNode } from 'react';

import type { CvEntry, CvProject, ResolvedCv } from '@/cv/resolve';
import { Bullets, ink, mailto } from '@/cv/templates/shared';

const SIDEBAR_WIDTH = '32%';

const s = StyleSheet.create({
  page: { flexDirection: 'row', fontFamily: 'Geist', fontSize: 9, lineHeight: 1.45, color: ink.text },
  // Painted on every page so the side column stays tinted when content flows onto a second page.
  sidebarBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: ink.wash,
  },
  sidebar: { width: SIDEBAR_WIDTH, paddingTop: 40, paddingBottom: 36, paddingHorizontal: 22 },
  main: { flex: 1, paddingTop: 40, paddingBottom: 36, paddingHorizontal: 30 },
  name: { fontSize: 22, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.15 },
  headline: { fontSize: 11, fontWeight: 500, color: ink.brand, marginTop: 4 },
  summary: { marginTop: 12, color: ink.body, fontSize: 9.5 },
  section: { marginTop: 16 },
  sideSection: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: 600,
    // Wide tracking makes pdftotext emit "E D U C AT I O N", which no keyword match survives.
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 7,
    color: ink.text,
  },
  sideItem: { marginBottom: 4, color: ink.body, textDecoration: 'none' },
  sideLabel: { fontSize: 7.5, color: ink.subtle, textTransform: 'uppercase', letterSpacing: 0.8 },
  skillGroup: { marginBottom: 7 },
  skillTitle: { fontWeight: 600, marginBottom: 1 },
  skillItems: { color: ink.body },
  entry: { marginBottom: 10 },
  entryTitle: { fontWeight: 600, fontSize: 9.5 },
  entryMeta: { color: ink.muted, fontSize: 8.5 },
  bullet: { flexDirection: 'row', marginTop: 2 },
  bulletMark: { width: 9, color: ink.subtle },
  bulletText: { flex: 1, color: ink.body },
  // No flex here: inside a column, flex: 1 collapses the text's height and the next line draws over it.
  description: { color: ink.body },
  meta: { marginTop: 3, fontSize: 8, color: ink.muted },
  links: { flexDirection: 'row', marginTop: 2 },
  link: { color: ink.brand, textDecoration: 'none', marginRight: 8, fontSize: 8.5 },
  highlight: { marginTop: 2, fontStyle: 'italic', color: ink.muted },
  eduEntry: { marginBottom: 8 },
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
      <Text style={s.entryTitle}>{entry.title}</Text>
      <Text style={s.entryMeta}>{`${entry.org}, ${entry.period}`}</Text>
      <Bullets items={entry.points} row={s.bullet} mark={s.bulletMark} text={s.bulletText} />
      {entry.stack.length > 0 && <Text style={s.meta}>{entry.stack.join(', ')}</Text>}
    </View>
  );
}

function Project({ project }: { project: CvProject }) {
  return (
    <View style={s.entry} wrap={false}>
      <Text style={s.entryTitle}>{project.name}</Text>
      {project.client && (
        <Text style={s.entryMeta}>{`${project.client}${project.year ? `, ${project.year}` : ''}`}</Text>
      )}
      <Text style={s.description}>{project.description}</Text>
      {project.highlight && <Text style={s.highlight}>{project.highlight}</Text>}
      {project.stack.length > 0 && <Text style={s.meta}>{project.stack.join(', ')}</Text>}
      {project.link && (
        <View style={s.links}>
          <Link src={project.link.url} style={s.link}>
            {project.link.text}
          </Link>
        </View>
      )}
    </View>
  );
}

export function SidebarTemplate({ cv }: { cv: ResolvedCv }): ReactElement<DocumentProps> {
  // This template fixes which column each section lives in, so the settings order cannot apply here.
  // It is honoured as an inclusion list instead: a section left out of settings is left off the page.
  const has = (id: (typeof cv.sections)[number]) => cv.sections.includes(id);

  return (
    <Document title={`${cv.name} CV`} author={cv.name}>
      <Page size="A4" style={s.page}>
        <View fixed style={s.sidebarBackground} />

        <View style={s.sidebar}>
          <View style={s.sideSection}>
            <Text style={s.sectionTitle}>Contact</Text>
            {cv.location && <Text style={s.sideItem}>{cv.location}</Text>}
            <Link src={mailto(cv.email)} style={s.sideItem}>
              {cv.email}
            </Link>
            {cv.phone && <Text style={s.sideItem}>{cv.phone}</Text>}
            {cv.links.map((link) => (
              <View key={link.url}>
                <Text style={s.sideLabel}>{link.label}</Text>
                <Link src={link.url} style={s.sideItem}>
                  {link.text}
                </Link>
              </View>
            ))}
          </View>

          {has('skills') && cv.skillLines.length > 0 && (
            <View style={s.sideSection}>
              <Text style={s.sectionTitle}>Skills</Text>
              {cv.skillLines.map((line) => (
                <View key={line.label} style={s.skillGroup} wrap={false}>
                  <Text style={s.skillTitle}>{line.label}</Text>
                  <Text style={s.skillItems}>{line.items}</Text>
                </View>
              ))}
            </View>
          )}

          {has('education') && cv.education.length > 0 && (
            <View style={s.sideSection}>
              <Text style={s.sectionTitle}>Education</Text>
              {cv.education.map((entry) => (
                <View key={entry.id} style={s.eduEntry} wrap={false}>
                  <Text style={s.skillTitle}>{entry.title}</Text>
                  <Text style={s.entryMeta}>{entry.org}</Text>
                  <Text style={s.entryMeta}>{entry.period}</Text>
                </View>
              ))}
            </View>
          )}

          {has('certifications') && cv.certifications.length > 0 && (
            <View style={s.sideSection}>
              <Text style={s.sectionTitle}>Certifications</Text>
              {cv.certifications.map((credential) => (
                <View key={credential.id} style={s.eduEntry} wrap={false}>
                  <Text style={s.skillTitle}>{credential.title}</Text>
                  <Text style={s.entryMeta}>{credential.issuer}</Text>
                  <Text style={s.entryMeta}>{credential.date}</Text>
                </View>
              ))}
            </View>
          )}

          {has('activities') && cv.activities.length > 0 && (
            <View style={s.sideSection}>
              <Text style={s.sectionTitle}>Extracurricular</Text>
              {cv.activities.map((entry) => (
                <View key={entry.id} style={s.eduEntry} wrap={false}>
                  <Text style={s.skillTitle}>{entry.title}</Text>
                  <Text style={s.entryMeta}>{entry.org}</Text>
                  <Text style={s.entryMeta}>{entry.period}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.main}>
          <Text style={s.name}>{cv.name}</Text>
          <Text style={s.headline}>{cv.headline}</Text>
          {cv.summary && <Text style={s.summary}>{cv.summary}</Text>}

          {has('experience') && cv.experience.length > 0 && (
            <Section title="Experience">
              {cv.experience.map((entry) => (
                <Entry key={entry.id} entry={entry} />
              ))}
            </Section>
          )}
          {has('selectedWork') && cv.clientProjects.length > 0 && (
            <Section title="Selected work">
              {cv.clientProjects.map((project) => (
                <Project key={project.name} project={project} />
              ))}
            </Section>
          )}
          {has('projects') && cv.projects.length > 0 && (
            <Section title="Projects">
              {cv.projects.map((project) => (
                <Project key={project.name} project={project} />
              ))}
            </Section>
          )}
        </View>
      </Page>
    </Document>
  );
}
