// IMPORTANT: only ever import this module dynamically (see
// lib/cover-letter/downloadCoverLetterPdf.ts) — a static import would pull
// @react-pdf/renderer into the route bundle and SSR.
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { GeneratedCoverLetter } from '@/lib/cover-letter/types'

const PRIMARY = '#1a1a2e'
const MUTED = '#6b7280'
const ACCENT = '#4f46e5'

const styles = StyleSheet.create({
  page: {
    paddingVertical: 54,
    paddingHorizontal: 56,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: PRIMARY,
    lineHeight: 1.55,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.2,
    lineHeight: 1.2,
  },
  contactLine: {
    fontSize: 9,
    color: MUTED,
    marginTop: 4,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  date: {
    fontSize: 10,
    color: MUTED,
    marginTop: 18,
  },
  recipient: {
    marginTop: 14,
  },
  recipientLine: {
    fontSize: 10,
  },
  greeting: {
    marginTop: 18,
  },
  paragraph: {
    marginTop: 11,
    textAlign: 'justify',
  },
  signOff: {
    marginTop: 20,
  },
  signName: {
    marginTop: 22,
    fontFamily: 'Helvetica-Bold',
  },
  roleTag: {
    fontSize: 9,
    color: ACCENT,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
})

export default function CoverLetterPdfDocument({ letter }: { letter: GeneratedCoverLetter }) {
  return (
    <Document
      title={`${letter.fullName} — Cover Letter`}
      author={letter.fullName}
      subject={`Cover letter for ${letter.meta.role} at ${letter.meta.company}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Sender header */}
        <Text style={styles.name}>{letter.fullName}</Text>
        {letter.contactLine ? <Text style={styles.contactLine}>{letter.contactLine}</Text> : null}

        {/* Date */}
        <Text style={styles.date}>{letter.date}</Text>

        {/* Recipient */}
        <View style={styles.recipient}>
          {letter.recipientBlock.map((line, i) =>
            i === 1 ? (
              <Text key={i} style={styles.roleTag}>
                {line}
              </Text>
            ) : (
              <Text key={i} style={styles.recipientLine}>
                {line}
              </Text>
            )
          )}
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>{letter.greeting}</Text>

        {/* Body */}
        {letter.paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}

        {/* Sign-off */}
        <Text style={styles.signOff}>{letter.signOff}</Text>
        <Text style={styles.signName}>{letter.fullName}</Text>
      </Page>
    </Document>
  )
}
