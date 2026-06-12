import type { PolishedCv } from './types'

/**
 * Generate the CV PDF in the browser and trigger a download.
 * @react-pdf/renderer (~1.5 MB) is loaded on demand here so it never enters
 * the route bundle or runs during SSR.
 */
export async function downloadCvPdf(cv: PolishedCv): Promise<void> {
  const [{ pdf }, { default: CvPdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/cv-tailor/CvPdfDocument'),
  ])

  // Call the component directly so pdf() receives the <Document> element itself
  const blob = await pdf(CvPdfDocument({ cv })).toBlob()
  const url = URL.createObjectURL(blob)
  const safeName = cv.contact.fullName.trim().replace(/[\\/:*?"<>|\s]+/g, '-') || 'My'

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${safeName}-CV.pdf`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
