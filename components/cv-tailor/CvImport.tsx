'use client'

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import Button from '@/components/ui/Button'
import { extractCvFromText, type CvExtraction } from '@/lib/cv-tailor/extractCv'
import {
  extractTextFromCvFile,
  isSupportedCvFile,
  CvParseError,
  UnsupportedCvFileError,
} from '@/lib/cv-tailor/parseCvFile'

type Status = 'idle' | 'parsing' | 'done' | 'error'

interface CvImportProps {
  /** Called with the parsed result so the consumer can prefill its fields. */
  onImport: (extraction: CvExtraction) => void
  /** When provided, low-confidence parses offer a "tag it manually" action. */
  onManual?: (extraction: CvExtraction) => void
  /** Heading above the drop zone. */
  heading?: string
  /** Sub-line under the heading. */
  subheading?: string
  /** Bolded call-to-action shown after a successful import. */
  reviewLabel?: string
  /**
   * Overrides which labels count as "filled" — for consumers that only care about
   * a subset of the extraction (e.g. the profile importer maps a CV to just
   * discipline/skills/location). Drives BOTH the success summary AND whether
   * onImport fires. Defaults to the full extraction.found.
   */
  deriveFound?: (extraction: CvExtraction) => string[]
}

export default function CvImport({
  onImport,
  onManual,
  heading = 'Already have a CV?',
  subheading = "Upload it and we'll autofill the form. Or just start from scratch below.",
  reviewLabel = 'Review and edit everything below before generating.',
  deriveFound,
}: CvImportProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<CvExtraction | null>(null)

  async function handleFile(file: File) {
    setFileName(file.name)
    setError('')
    setStatus('parsing')
    try {
      const text = await extractTextFromCvFile(file)
      const extraction = extractCvFromText(text)
      setResult(extraction)
      setStatus('done')
      const effectiveFound = deriveFound ? deriveFound(extraction) : extraction.found
      if (effectiveFound.length > 0) onImport(extraction)
    } catch (err) {
      setStatus('error')
      if (err instanceof UnsupportedCvFileError || err instanceof CvParseError) {
        setError(err.message)
      } else {
        setError('Something went wrong reading that file. Try a different file or fill in the form below.')
      }
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = '' // allow re-selecting the same file
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!isSupportedCvFile(file)) {
      setStatus('error')
      setFileName(file.name)
      setError('Please drop a PDF or a .txt file.')
      return
    }
    handleFile(file)
  }

  function reset() {
    setStatus('idle')
    setResult(null)
    setError('')
    setFileName('')
  }

  // ---- Success summary ----
  if (status === 'done' && result) {
    const found = deriveFound ? deriveFound(result) : result.found
    const filledSomething = found.length > 0
    return (
      <div className="rounded-2xl border border-gray-100 bg-white shadow-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${filledSomething ? 'bg-green-50' : 'bg-amber-50'}`}>
            {filledSomething ? (
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.5 0L3.18 16.25A2 2 0 005 19z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {filledSomething ? (
              <>
                <p className="text-sm font-semibold text-primary">
                  Imported from <span className="font-normal text-muted break-all">{fileName}</span>
                </p>
                <p className="text-sm text-muted mt-1">
                  We filled in: {found.join(' · ')}.{' '}
                  <span className="text-primary font-medium">{reviewLabel}</span>
                </p>
                {result.confidence === 'low' && (
                  <p className="text-xs text-amber-600 mt-2">
                    Some sections were hard to read — please double-check them.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-primary">
                  We couldn&apos;t read much from <span className="font-normal text-muted break-all">{fileName}</span>
                </p>
                <p className="text-sm text-muted mt-1">
                  It may be a scanned image or an unusual layout.{' '}
                  {onManual
                    ? 'You can tag the text manually, or just fill in the form below.'
                    : 'You can fill in the fields below manually.'}
                </p>
              </>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {onManual && (result.confidence !== 'high' || !filledSomething) && (
                <Button type="button" variant="secondary" size="sm" onClick={() => onManual(result)}>
                  Tag sections manually
                </Button>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={reset}>
                Upload a different file
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---- Drop zone (idle / parsing / error) ----
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-primary">{heading}</h2>
          <p className="text-xs text-muted mt-0.5">{subheading}</p>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          'flex flex-col items-center justify-center text-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 cursor-pointer transition-colors',
          dragging ? 'border-accent bg-accent-light/50' : 'border-gray-200 hover:border-accent hover:bg-surface',
          status === 'parsing' ? 'opacity-70 pointer-events-none' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,application/pdf,text/plain"
          className="sr-only"
          onChange={onInputChange}
        />
        {status === 'parsing' ? (
          <>
            <span className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-primary">Reading {fileName}…</p>
          </>
        ) : (
          <>
            <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16a4 4 0 01-.88-7.9A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 13l3-3m0 0l3 3m-3-3v9" />
            </svg>
            <p className="text-sm font-medium text-primary">
              Drop your CV here, or <span className="text-accent">browse</span>
            </p>
            <p className="text-xs text-muted">PDF or TXT · up to 10 MB</p>
          </>
        )}
      </div>

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-500 mt-3">
          {error}
        </p>
      )}

      <p className="text-xs text-muted mt-3 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Processed in your browser — your CV is never uploaded or stored.
      </p>
    </div>
  )
}
