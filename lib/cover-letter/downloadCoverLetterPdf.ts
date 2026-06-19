import type { GeneratedCoverLetter } from './types'

/**
 * Generate the cover-letter PDF in the browser and trigger a download.
 * @react-pdf/renderer (~1.5 MB) is loaded on demand here so it never enters the
 * route bundle or runs during SSR. Mirrors lib/cv-tailor/downloadCvPdf.ts.
 */
export async function downloadCoverLetterPdf(letter: GeneratedCoverLetter): Promise<void> {
  const [{ pdf }, { default: CoverLetterPdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/cover-letter/CoverLetterPdfDocument'),
  ])

  const blob = await pdf(CoverLetterPdfDocument({ letter })).toBlob()
  const url = URL.createObjectURL(blob)
  const safeName = letter.fullName.trim().replace(/[\\/:*?"<>|\s]+/g, '-') || 'My'

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${safeName}-Cover-Letter.pdf`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
