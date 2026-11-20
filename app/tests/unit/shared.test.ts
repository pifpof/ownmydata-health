import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { keyFacts } from '@shared/fhir-labels'
import { bodyLinks, refToPath, resolveLink } from '@shared/refs'
import { classify } from '@shared/sections'
import { resolveInside } from '../../src/main/vault/guard'

describe('refs', () => {
  it('maps references by the resource map', () => {
    expect(refToPath('Encounter/enc-20261012-ent-consult')).toBe('memory/encounters/2026/enc-20261012-ent-consult.md')
    expect(refToPath('Practitioner/prac-example-ent')).toBe('memory/patient/care-team/prac-example-ent.md')
    expect(refToPath('Observation/obs-20250101-bp')).toBe('memory/observations/standalone/2025/obs-20250101-bp.md')
    expect(refToPath('Patient/pt-self')).toBe('memory/patient/pt-self.md')
    expect(refToPath('Condition/../../x')).toBeNull()
    expect(refToPath('Nope/x')).toBeNull()
  })
  it('resolves relative links and ignores code', () => {
    expect(resolveLink('memory/episodes/ep.md', '../conditions/c.md')).toBe('memory/conditions/c.md')
    expect(resolveLink('memory/x.md', '../../../etc/passwd')).toBeNull()
    expect(resolveLink('memory/x.md', 'https://example.com')).toBeNull()
    expect(bodyLinks('memory/a/b.md', 'see [x](../c.md) and `[y](../d.md)`')).toEqual(['memory/c.md'])
  })
})

describe('classify', () => {
  it('uses the longest folder and checks the type', () => {
    expect(classify('memory/patient/care-team/prac-x.md', 'practitioner').section).toBe('care-team')
    expect(classify('memory/patient/pt-self.md', 'patient').section).toBe('you')
    expect(classify('memory/conditions/x.md', 'encounter')).toMatchObject({ section: 'other' })
    expect(classify('memory/somewhere/x.md', 'condition')).toMatchObject({ section: 'other' })
    expect(classify('memory/library/q.md', 'note').section).toBe('library')
  })
})

describe('key facts', () => {
  it('labels elements and links references', () => {
    const facts = keyFacts(
      {
        resourceType: 'Condition',
        id: 'cond-x',
        code: { text: 'Left ear' },
        bodySite: [{ text: 'Left ear' }],
        subject: { reference: 'Patient/pt-self' },
        asserter: { reference: 'Practitioner/prac-example-ent', display: 'Dr. A. Example' },
        clinicalStatus: { coding: [{ system: 'http://x', code: 'resolved' }] },
        reaction: [{ manifestation: [{ text: 'hives' }], severity: 'moderate' }],
        valueQuantity: { value: 5.1, unit: 'mmol/L' }
      },
      () => null
    )
    const get = (l: string) => facts.find((f) => f.label === l)
    expect(get('Body site')?.values[0].text).toBe('Left ear')
    expect(get('Recorded by')?.values[0]).toEqual({ text: 'Dr. A. Example', ref: 'memory/patient/care-team/prac-example-ent.md' })
    expect(get('Status')?.values[0].text).toBe('resolved')
    expect(get('Reaction · Reaction')?.values[0].text).toBe('hives')
    expect(get('Reaction · Severity')?.values[0].text).toBe('moderate')
    expect(get('Value')?.values[0].text).toBe('5.1 mmol/L')
    expect(facts.some((f) => f.label === 'Subject' || f.label === 'Id')).toBe(false)
  })
})

describe('guard', () => {
  it('refuses traversal and symlinks out of the vault', () => {
    const base = mkdtempSync(join(tmpdir(), 'omd-'))
    const vault = join(base, 'vault')
    mkdirSync(join(vault, 'memory'), { recursive: true })
    writeFileSync(join(base, 'secret.md'), 'x')
    symlinkSync(join(base, 'secret.md'), join(vault, 'memory', 'link.md'))
    expect(resolveInside(vault, 'memory/link.md')).toBeNull()
    expect(resolveInside(vault, '../secret.md')).toBeNull()
    expect(resolveInside(vault, 'memory/ok.md')).toBe(join(vault, 'memory/ok.md'))
  })
})

describe('dates', async () => {
  const { readableDate, mainDate } = await import('@shared/record-meta')
  it('shortens date-times and keeps words', () => {
    expect(readableDate('2026-11-05T07:45:00-07:00')).toBe('2026-11-05 07:45')
    expect(readableDate('2026-10')).toBe('2026-10')
    expect(readableDate('since I was a teenager')).toBe('since I was a teenager')
    expect(mainDate({ fhir: { effectiveDateTime: '2026-11-05T07:45:00-07:00' } }, 'x.md')).toBe('2026-11-05')
  })
})
