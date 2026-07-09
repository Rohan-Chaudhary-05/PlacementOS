import { describe, expect, it } from 'vitest'
import {
  isAcademicEmail,
  isCompanyEmail,
  isValidUrl,
  normaliseUrl,
  parseSalary,
} from '@/lib/validation'

describe('isAcademicEmail', () => {
  it('accepts genuine academic domains', () => {
    expect(isAcademicEmail('name@durham.ac.uk')).toBe(true)
    expect(isAcademicEmail('name@students.bham.ac.uk')).toBe(true)
    expect(isAcademicEmail('name@mit.edu')).toBe(true)
    expect(isAcademicEmail('name@unsw.edu.au')).toBe(true)
  })

  it('rejects non-academic and stuffed domains', () => {
    expect(isAcademicEmail('name@gmail.com')).toBe(false)
    expect(isAcademicEmail('evil@gmail.com.ac.uk')).toBe(false)
    expect(isAcademicEmail('x@outlook.com.edu')).toBe(false)
    expect(isAcademicEmail('not-an-email')).toBe(false)
  })
})

describe('isCompanyEmail', () => {
  it('accepts a normal company domain', () => {
    expect(isCompanyEmail('jane@acme-robotics.co.uk')).toBe(true)
  })

  it('rejects free providers, including 3-label domains and subdomains', () => {
    expect(isCompanyEmail('jane@gmail.com')).toBe(false)
    expect(isCompanyEmail('jane@yahoo.co.uk')).toBe(false)
    expect(isCompanyEmail('jane@mail.gmail.com')).toBe(false)
  })
})

describe('isValidUrl', () => {
  it('accepts http(s) links with real hosts', () => {
    expect(isValidUrl('https://careers.example.com/apply')).toBe(true)
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('rejects unsafe schemes, dotless hosts and malformed values', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
    expect(isValidUrl('data:text/html,hi')).toBe(false)
    expect(isValidUrl('http://localhost')).toBe(false)
    expect(isValidUrl('https://exa mple.com')).toBe(false)
    expect(isValidUrl('')).toBe(false)
  })
})

describe('normaliseUrl', () => {
  it('adds https:// to bare domains and leaves schemes alone', () => {
    expect(normaliseUrl('acme.com/careers')).toBe('https://acme.com/careers')
    expect(normaliseUrl('http://acme.com')).toBe('http://acme.com')
    expect(normaliseUrl('')).toBe('')
  })
})

describe('parseSalary', () => {
  it('parses grouped and currency-prefixed values', () => {
    expect(parseSalary('£22,000')).toBe(22000)
    expect(parseSalary(22000)).toBe(22000)
  })

  it('rejects decimals, negatives and empty input', () => {
    expect(parseSalary('22.5')).toBeNaN()
    expect(parseSalary(-5)).toBeNaN()
    expect(parseSalary('')).toBeNaN()
  })
})
