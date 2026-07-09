'use client'

// Reads an uploaded CV file into plain text — entirely in the browser. The file
// is never uploaded or stored anywhere; we only read its bytes locally and throw
// them away once the text is extracted.
//
// PDFs are parsed with pdf.js (bundled module worker); Word (.docx) files with
// mammoth (dynamic import, browser build). Plain-text files are read directly.
// Image-only / scanned PDFs yield little text (no OCR) — that is what the
// manual-tagging fallback is for.

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const LEGACY_DOC_MIME = 'application/msword'

export class UnsupportedCvFileError extends Error {}
export class CvParseError extends Error {}

export function isSupportedCvFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return (
    file.type === 'application/pdf' ||
    name.endsWith('.pdf') ||
    file.type === DOCX_MIME ||
    name.endsWith('.docx') ||
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
  const isDocx = file.type === DOCX_MIME || name.endsWith('.docx')
  const isLegacyDoc = !isDocx && (file.type === LEGACY_DOC_MIME || name.endsWith('.doc'))
  const isText = file.type.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md')

  if (isPdf) return readPdf(file)
  if (isDocx) return readDocx(file)
  if (isLegacyDoc) {
    throw new UnsupportedCvFileError(
      "Old-style .doc files aren't supported. Please export your CV as PDF or .docx and try again."
    )
  }
  if (isText) return (await file.text()).trim()
  throw new UnsupportedCvFileError('Please upload a PDF, Word (.docx), or .txt file.')
}

async function readDocx(file: File): Promise<string> {
  // Dynamic import keeps mammoth out of the server bundle; its browser build
  // parses locally, so the CV stays on the device.
  const mammoth = (await import('mammoth')).default
  let value: string
  try {
    ;({ value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() }))
  } catch {
    throw new CvParseError('We could not read that Word document. It may be corrupted or password-protected.')
  }
  // Mammoth separates paragraphs with double newlines; normalise line endings
  // and tame blank runs so the extractor sees one logical line per row.
  return value.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
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
