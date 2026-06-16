'use client'

// Reads an uploaded CV file into plain text — entirely in the browser. The file
// is never uploaded or stored anywhere; we only read its bytes locally and throw
// them away once the text is extracted.
//
// PDFs are parsed with pdf.js (bundled module worker). Plain-text files are read
// directly. Image-only / scanned PDFs yield little text (no OCR) — that is what
// the manual-tagging fallback is for.

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export class UnsupportedCvFileError extends Error {}
export class CvParseError extends Error {}

export function isSupportedCvFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return (
    file.type === 'application/pdf' ||
    name.endsWith('.pdf') ||
    file.type.startsWith('text/') ||
    name.endsWith('.txt') ||
    name.endsWith('.md')
  )
}

export async function extractTextFromCvFile(file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new CvParseError('That file is over 10 MB. Please upload a smaller CV.')
  }
  const name = file.name.toLowerCase()
  const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf')
  const isText = file.type.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md')

  if (isPdf) return readPdf(file)
  if (isText) return (await file.text()).trim()
  throw new UnsupportedCvFileError('Please upload a PDF or a .txt file.')
}

async function readPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')

  // Bundled module worker — keeps parsing local (the CV stays in the browser).
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()

  const buffer = await file.arrayBuffer()
  let doc
  try {
    doc = await pdfjs.getDocument({ data: buffer }).promise
  } catch {
    throw new CvParseError('We could not open that PDF. It may be corrupted or password-protected.')
  }

  try {
    const pages: string[] = []
    for (let n = 1; n <= doc.numPages; n += 1) {
      const page = await doc.getPage(n)
      const content = await page.getTextContent()
      const lines: string[] = []
      let line = ''
      for (const item of content.items) {
        if (!('str' in item)) continue
        line += item.str
        if ((item as { hasEOL?: boolean }).hasEOL) {
          lines.push(line)
          line = ''
        } else {
          line += ' '
        }
      }
      if (line.trim()) lines.push(line)
      pages.push(lines.join('\n'))
      page.cleanup()
    }
    return pages.join('\n\n')
  } finally {
    await doc.destroy()
  }
}
