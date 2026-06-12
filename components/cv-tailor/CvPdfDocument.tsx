// IMPORTANT: only ever import this module dynamically (see lib/cv-tailor/downloadCvPdf.ts) —
// a static import would pull @react-pdf/renderer into the route bundle and SSR.
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { PolishedCv } from '@/lib/cv-tailor/types'

const ACCENT = '#4f46e5'
const PRIMARY = '#1a1a2e'
const MUTED = '#6b7280'

const styles = StyleSheet.create({
  page: {
    paddingVertical: 42,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: PRIMARY,
    lineHeight: 1.45,
  },
  // Larger text needs its own lineHeight: the page-level 1.45 resolves to an
  // absolute 14.5pt before inheritance, which would cramp 22pt text
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.2,
    lineHeight: 1.2,
  },
  headline: {
    fontSize: 11,
    color: ACCENT,
    marginTop: 3,
    lineHeight: 1.45,
  },
  contactLine: {
    fontSize: 9,
    color: MUTED,
    marginTop: 5,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 3,
    marginBottom: 7,
  },
  entry: {
    marginBottom: 8,
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  entryTitle: {
    fontFamily: 'Helvetica-Bold',
  },
  entrySubtitle: {
    marginTop: 1,
  },
  dateRange: {
    fontSize: 9,
    color: MUTED,
  },
  detailText: {
    fontSize: 9,
    color: MUTED,
    marginTop: 1,
  },
  bulletRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  bulletMarker: {
    width: 12,
    color: ACCENT,
  },
  bulletText: {
    flex: 1,
  },
  skillLine: {
    marginBottom: 3,
  },
  skillHeading: {
    fontFamily: 'Helvetica-Bold',
  },
})

export default function CvPdfDocument({ cv }: { cv: PolishedCv }) {
  const contactParts = [
    cv.contact.location,
    cv.contact.phone,
    cv.contact.email,
    cv.contact.linkedin,
  ].filter(Boolean)

  return (
    <Document
      title={`${cv.contact.fullName} — CV`}
      author={cv.contact.fullName}
      subject={`CV tailored for ${cv.meta.industryLabel}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{cv.contact.fullName}</Text>
        <Text style={styles.headline}>{cv.headline}</Text>
        <Text style={styles.contactLine}>{contactParts.join('   ·   ')}</Text>

        {/* Summary */}
        {cv.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text>{cv.summary}</Text>
          </View>
        ) : null}

        {/* Education */}
        {cv.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {cv.education.map((entry, index) => (
              <View key={index} style={styles.entry} wrap={false}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>{entry.qualification}</Text>
                  {entry.dateRange ? <Text style={styles.dateRange}>{entry.dateRange}</Text> : null}
                </View>
                <Text style={styles.entrySubtitle}>
                  {entry.institution}
                  {entry.grade ? ` — ${entry.grade}` : ''}
                </Text>
                {entry.details ? <Text style={styles.detailText}>{entry.details}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {cv.skillGroups.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {cv.skillGroups.map((group) => (
              <Text key={group.heading} style={styles.skillLine}>
                <Text style={styles.skillHeading}>{group.heading}: </Text>
                {group.skills.join(' · ')}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Experience */}
        {cv.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {cv.experience.map((entry, index) => (
              <View key={index} style={styles.entry} wrap={false}>
                <View style={styles.entryHeaderRow}>
                  <Text>
                    <Text style={styles.entryTitle}>{entry.role}</Text>
                    {entry.company ? ` — ${entry.company}` : ''}
                  </Text>
                  {entry.dateRange ? <Text style={styles.dateRange}>{entry.dateRange}</Text> : null}
                </View>
                {entry.bullets.map((bullet, bulletIndex) => (
                  <View key={bulletIndex} style={styles.bulletRow}>
                    <Text style={styles.bulletMarker}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Projects */}
        {cv.projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {cv.projects.map((project, index) => (
              <View key={index} style={styles.entry} wrap={false}>
                <Text style={styles.entryTitle}>{project.name}</Text>
                {project.description ? <Text>{project.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Certifications */}
        {cv.certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {cv.certifications.map((certification, index) => (
              <View key={index} style={styles.bulletRow}>
                <Text style={styles.bulletMarker}>•</Text>
                <Text style={styles.bulletText}>{certification}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  )
}
