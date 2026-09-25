import { Document, type DocumentProps, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Children, type ReactElement, type ReactNode } from 'react';

import type { CvCredential, CvEntry, CvProject, ResolvedCv } from '@/cv/resolve';
import { Dot, iconForLink, MailIcon, PhoneIcon, PinIcon } from '@/cv/templates/icons';
import { Bullets, mailto } from '@/cv/templates/shared';
import type { CvSectionId } from '@/lib/schemas';

const SIDEBAR_WIDTH = '35%';
const ACCENT = '#047857';
const PHONE_COLOR = '#047857';
const MAIL_COLOR = '#2563EB';
const PIN_COLOR = '#D97706';

const s = StyleSheet.create({
  page: { flexDirection: 'row', fontFamily: 'Geist', fontSize: 9, lineHeight: 1.38, color: '#171717' },
  sidebarBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#f0fdf4',
  },
  sidebar: { width: SIDEBAR_WIDTH, paddingTop: 28, paddingBottom: 26, paddingHorizontal: 20 },
  main: { flex: 1, paddingTop: 28, paddingBottom: 26, paddingHorizontal: 26 },

  name: { fontSize: 21, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.15, color: '#171717' },
  headline: { fontSize: 10.5, fontWeight: 600, color: ACCENT, marginTop: 3 },
  summary: { marginTop: 10, color: '#262626', fontSize: 9 },

  sideSection: { marginBottom: 12 },
  sideTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: ACCENT,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1.2,
    borderBottomColor: '#bbf7d0',
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  badge: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  contactText: { color: '#262626', textDecoration: 'none', flex: 1 },

  skillGroup: { marginBottom: 7 },
  skillTitle: { fontWeight: 700, marginBottom: 1, color: '#171717' },
  skillItems: { color: '#404040' },

  sideEntry: { marginBottom: 6 },
  sideEntryTitle: { fontWeight: 700, fontSize: 9, color: '#171717' },
  sideEntryMeta: { color: '#525252', fontSize: 8.3, marginTop: 1 },

  section: { marginTop: 11 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: ACCENT,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1.2,
    borderBottomColor: '#bbf7d0',
  },
  entry: { marginBottom: 7 },
  entryHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  entryTitleRow: { flexDirection: 'row', alignItems: 'center' },
  // The main column is narrower than a single-column template, so a long project name and tag can
  // run into a link placed on the same line; the project link prints on its own row instead.
  entryTitleRowFull: { flexDirection: 'row', alignItems: 'center' },
  projectLinkRow: { marginTop: 2, marginLeft: 11, fontSize: 8.5, color: ACCENT, textDecoration: 'none' },
  dotSpace: { marginRight: 5 },
  entryTitle: { fontWeight: 700, color: '#171717' },
  entryOrg: { color: '#525252' },
  period: { fontSize: 8.5, color: '#737373' },
  bullet: { flexDirection: 'row', marginTop: 2, marginLeft: 11 },
  bulletMark: { width: 9, color: ACCENT },
  bulletText: { flex: 1, color: '#262626' },
  meta: { marginTop: 2, marginLeft: 11, fontSize: 8, color: '#525252' },
  metaLabel: { fontWeight: 700 },
  description: { marginTop: 1, marginLeft: 11, color: '#262626' },
  highlight: { marginTop: 2, marginLeft: 11, fontStyle: 'italic', color: '#525252' },
  projectLink: { fontSize: 8.5, color: ACCENT, textDecoration: 'none' },
  client: { color: '#525252' },
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  const [first, ...rest] = Children.toArray(children);
  return (
    <View style={s.section}>
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
      <View style={s.entryHeaderRow}>
        <View style={s.entryTitleRow}>
          <View style={s.dotSpace}>
            <Dot color={ACCENT} />
          </View>
          <Text>
            <Text style={s.entryTitle}>{entry.title}</Text>
            <Text style={s.entryOrg}>{`  |  ${entry.org}`}</Text>
          </Text>
        </View>
        <Text style={s.period}>{entry.period}</Text>
      </View>
      <Bullets items={entry.points} row={s.bullet} mark={s.bulletMark} text={s.bulletText} />
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
      <View style={s.entryTitleRowFull}>
        <View style={s.dotSpace}>
          <Dot color={ACCENT} />
        </View>
        <Text>
          <Text style={s.entryTitle}>{project.name}</Text>
          {project.tag && <Text style={s.client}>{`  |  ${project.tag}`}</Text>}
          {project.client && <Text style={s.client}>{`  |  ${project.client}`}</Text>}
        </Text>
      </View>
      <Text style={s.description}>{project.description}</Text>
      {project.highlight && <Text style={s.highlight}>{project.highlight}</Text>}
      {project.stack.length > 0 && (
        <Text style={s.meta}>
          <Text style={s.metaLabel}>Tech: </Text>
          {project.stack.join(', ')}
        </Text>
      )}
      {project.link && (
        <Link src={project.link.url} style={s.projectLinkRow}>
          {project.link.text}
        </Link>
      )}
    </View>
  );
}

function CredentialRow({ credential }: { credential: CvCredential }) {
  return (
    <View style={s.sideEntry} wrap={false}>
      <Text style={s.sideEntryTitle}>{credential.title}</Text>
      <Text style={s.sideEntryMeta}>{credential.issuer}</Text>
      <Text style={s.sideEntryMeta}>{credential.date}</Text>
    </View>
  );
}

export function VibrantTemplate({ cv }: { cv: ResolvedCv }): ReactElement<DocumentProps> {
  // The sidebar's column is fixed, so cv.sections works as an inclusion list here, same as sidebar.tsx.
  const has = (id: CvSectionId) => cv.sections.includes(id);

  const mainSections: Record<CvSectionId, ReactNode> = {
    experience:
      has('experience') && cv.experience.length > 0 ? (
        <Section key="experience" title="Experience">
          {cv.experience.map((entry) => (
            <Entry key={entry.id} entry={entry} />
          ))}
        </Section>
      ) : null,
    selectedWork:
      has('selectedWork') && cv.clientProjects.length > 0 ? (
        <Section key="selectedWork" title="Selected work">
          {cv.clientProjects.map((project) => (
            <Project key={project.name} project={project} />
          ))}
        </Section>
      ) : null,
    projects:
      has('projects') && cv.projects.length > 0 ? (
        <Section key="projects" title="Projects">
          {cv.projects.map((project) => (
            <Project key={project.name} project={project} />
          ))}
        </Section>
      ) : null,
    skills: null,
    certifications: null,
    activities: null,
    education: null,
  };

  return (
    <Document title={`${cv.name} CV`} author={cv.name}>
      <Page size="A4" style={s.page}>
        <View fixed style={s.sidebarBackground} />

        <View style={s.sidebar}>
          <View style={s.sideSection}>
            <Text style={s.sideTitle}>Contact</Text>
            {cv.phone && (
              <View style={s.contactRow}>
                <View style={s.badge}>
                  <PhoneIcon size={8} color={PHONE_COLOR} />
                </View>
                <Text style={s.contactText}>{cv.phone}</Text>
              </View>
            )}
            <Link src={mailto(cv.email)} style={s.contactRow}>
              <View style={s.badge}>
                <MailIcon size={8} color={MAIL_COLOR} />
              </View>
              <Text style={s.contactText}>{cv.email}</Text>
            </Link>
            {cv.location && (
              <View style={s.contactRow}>
                <View style={s.badge}>
                  <PinIcon size={8} color={PIN_COLOR} />
                </View>
                <Text style={s.contactText}>{cv.location}</Text>
              </View>
            )}
            {cv.links.map((link) => (
              <Link key={link.url} src={link.url} style={s.contactRow}>
                <View style={s.badge}>{iconForLink(link.label, 8)}</View>
                <Text style={s.contactText}>{link.text}</Text>
              </Link>
            ))}
          </View>

          {has('skills') && cv.skillLines.length > 0 && (
            <View style={s.sideSection}>
              <Text style={s.sideTitle}>Skills</Text>
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
              <Text style={s.sideTitle}>Education</Text>
              {cv.education.map((entry) => (
                <View key={entry.id} style={s.sideEntry} wrap={false}>
                  <Text style={s.sideEntryTitle}>{entry.title}</Text>
                  <Text style={s.sideEntryMeta}>{entry.org}</Text>
                  <Text style={s.sideEntryMeta}>{entry.period}</Text>
                </View>
              ))}
            </View>
          )}

          {has('certifications') && cv.certifications.length > 0 && (
            <View style={s.sideSection}>
              <Text style={s.sideTitle}>Certifications</Text>
              {cv.certifications.map((credential) => (
                <CredentialRow key={credential.id} credential={credential} />
              ))}
            </View>
          )}

          {has('activities') && cv.activities.length > 0 && (
            <View style={s.sideSection}>
              <Text style={s.sideTitle}>Extracurricular</Text>
              {cv.activities.map((entry) => (
                <View key={entry.id} style={s.sideEntry} wrap={false}>
                  <Text style={s.sideEntryTitle}>{entry.title}</Text>
                  <Text style={s.sideEntryMeta}>{entry.org}</Text>
                  <Text style={s.sideEntryMeta}>{entry.period}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.main}>
          <Text style={s.name}>{cv.name}</Text>
          <Text style={s.headline}>{cv.headline}</Text>
          {cv.summary && <Text style={s.summary}>{cv.summary}</Text>}

          {cv.sections.map((id) => mainSections[id])}
        </View>
      </Page>
    </Document>
  );
}
