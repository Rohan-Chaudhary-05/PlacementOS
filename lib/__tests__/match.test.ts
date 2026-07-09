import { describe, expect, it } from 'vitest'
import { bandFor, scoreMatch, type MatchableOpp, type StudentProfile } from '@/lib/match'

function makeProfile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    discipline: null,
    study_year: null,
    skills: null,
    target_sectors: [],
    work_modes: [],
    preferred_locations: null,
    min_salary: null,
    ...overrides,
  }
}

function makeOpp(overrides: Partial<MatchableOpp> = {}): MatchableOpp {
  return {
    sector: 'Software & IT',
    workMode: 'HYBRID',
    location: 'Leeds, UK',
    salaryMin: 22000,
    salaryMax: 26000,
    requirements: 'TypeScript, React',
    description: 'Build product features on a modern web stack.',
    role: 'Software Engineering Placement',
    ...overrides,
  }
}

describe('scoreMatch', () => {
  it('returns null with no profile', () => {
    expect(scoreMatch(null, makeOpp())).toBeNull()
  })

  it('returns null when no dimension is active (all-blank profile)', () => {
    expect(scoreMatch(makeProfile(), makeOpp())).toBeNull()
  })

  it('renormalises over only the filled dimensions', () => {
    const profile = makeProfile({ work_modes: ['HYBRID'] })
    const hit = scoreMatch(profile, makeOpp({ workMode: 'HYBRID' }))
    expect(hit).not.toBeNull()
    expect(hit!.score).toBe(100)
    expect(hit!.band).toBe('strong')
    expect(hit!.reasons).toEqual(['Hybrid — your preference'])

    const miss = scoreMatch(profile, makeOpp({ workMode: 'OFFICE' }))
    expect(miss!.score).toBe(0)
  })

  it('scores 100 with all dimensions filled and matching, capping reasons at 4', () => {
    const profile = makeProfile({
      discipline: 'computer science',
      skills: 'TypeScript, React',
      target_sectors: ['Software & IT'],
      work_modes: ['HYBRID'],
      preferred_locations: 'Leeds',
      min_salary: 24000,
    })
    const result = scoreMatch(profile, makeOpp())
    expect(result!.score).toBe(100)
    // Five reasons are generated (sector, skills, work mode, location, salary) — capped at 4.
    expect(result!.reasons).toHaveLength(4)
  })

  it('gives 0.6 sector sub-score for discipline affinity without a target sector', () => {
    const profile = makeProfile({ discipline: 'computer science' })
    const result = scoreMatch(profile, makeOpp({ sector: 'Software & IT' }))
    expect(result!.score).toBe(60)
    expect(result!.band).toBe('good')
    expect(result!.reasons).toContain('Aligned with your discipline')
  })

  it('matches skills on word boundaries', () => {
    // 'C' must not match inside 'CAD'…
    const cProfile = makeProfile({ skills: 'C' })
    const cad = scoreMatch(cProfile, makeOpp({ requirements: 'CAD modelling', description: 'CAD work', role: 'CAD Engineer' }))
    expect(cad!.score).toBe(0)
    // …but does match next to punctuation ('C++').
    const cpp = scoreMatch(cProfile, makeOpp({ requirements: 'C++ experience', description: '', role: 'Engineer' }))
    expect(cpp!.score).toBeGreaterThan(0)
  })

  it('counts multiple matched skills', () => {
    const profile = makeProfile({ skills: 'TypeScript, React' })
    const result = scoreMatch(profile, makeOpp())
    expect(result!.score).toBe(100)
    expect(result!.reasons).toContain('2 of your skills mentioned')
  })

  it('gives partial salary credit below the floor and full credit at the floor', () => {
    const below = scoreMatch(makeProfile({ min_salary: 20000 }), makeOpp({ salaryMax: 10000 }))
    expect(below!.score).toBe(50)
    expect(below!.band).toBe('weak')
    expect(below!.reasons).toHaveLength(0)

    const at = scoreMatch(makeProfile({ min_salary: 20000 }), makeOpp({ salaryMax: 20000 }))
    expect(at!.score).toBe(100)
    expect(at!.reasons).toContain('Pays above your £20,000 floor')
  })

  it('treats remote roles as matching any preferred location', () => {
    const profile = makeProfile({ preferred_locations: 'Manchester' })
    const result = scoreMatch(profile, makeOpp({ location: 'London, UK', workMode: 'REMOTE' }))
    expect(result!.score).toBe(100)
    expect(result!.reasons).toContain('Remote — works anywhere')
  })

  it('is deterministic', () => {
    const profile = makeProfile({ discipline: 'physics', skills: 'Python', min_salary: 25000 })
    const opp = makeOpp()
    expect(scoreMatch(profile, opp)).toEqual(scoreMatch(profile, opp))
  })
})

describe('bandFor', () => {
  it('applies the 80/60 thresholds', () => {
    expect(bandFor(80)).toBe('strong')
    expect(bandFor(79)).toBe('good')
    expect(bandFor(60)).toBe('good')
    expect(bandFor(59)).toBe('weak')
  })
})
