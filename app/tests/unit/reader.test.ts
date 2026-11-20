import { createHash } from 'crypto'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { isSystemFile } from '@shared/sections'
import { createVaultReader } from '../../src/main/vault/reader'
import { detectVault } from '../../src/main/vault/detect'
import { findMarkdown, RICH, SAMPLE } from './helpers'

describe('reader on the sample vault', async () => {
  const r = createVaultReader(SAMPLE)
  await r.load()
  const snap = r.snapshot()

  it('puts every record file in exactly one section, none in Other (VA4)', () => {
    const records = findMarkdown(SAMPLE).filter((p) => !isSystemFile(p))
    expect(snap.records.map((x) => x.path).sort()).toEqual(records.sort())
    expect(snap.records.filter((x) => x.section === 'other')).toEqual([])
    expect(snap.records.filter((x) => x.problem)).toEqual([])
  })

  it('reads the owner name', () => {
    expect(snap.patientName).toBeTruthy()
  })

  it('resolves every link in every file to a file in the vault', () => {
    const paths = new Set(snap.paths)
    for (const p of snap.paths) {
      const f = r.open(p, true)!
      expect(f).not.toBeNull()
    }
    // linkedFrom only ever lists existing files
    const f = r.open('memory/conditions/cond-20261012-hearing-loss-left.md', false)!
    expect(f.linkedFrom.map((x) => x.path)).toContain('memory/episodes/ep-20261012-left-ear.md')
    for (const x of f.linkedFrom) expect(paths.has(x.path)).toBe(true)
  })

  it('shows sources with originals that exist', () => {
    const f = r.open('memory/conditions/cond-20261012-hearing-loss-left.md', false)!
    const file = f.sources.find((s) => s.kind === 'file')!
    expect(file.path).toBe('data/documents/2026/2026-10-12-ent-consult-note.pdf')
    expect(file.exists).toBe(true)
    expect(f.sources.some((s) => s.kind === 'session' && s.label.startsWith('From what you told me'))).toBe(true)
  })

  it('derives status words and dates', () => {
    const cond = snap.records.find((x) => x.type === 'condition')!
    expect(cond.status).toEqual(['resolved', 'provisional'])
    expect(cond.date).toBe('2026-09')
    const ep = snap.records.find((x) => x.type === 'episode')!
    expect(ep.status).toEqual(['finished'])
    const med = snap.records.find((x) => x.type === 'medication-statement')!
    expect(med.status).toEqual(['planned'])
  })

  it('finds a problem by its alias', () => {
    const ep = snap.records.find((x) => x.type === 'episode')!
    expect(ep.search).toContain('ear thing')
  })

  it('refuses paths outside the vault', () => {
    expect(r.locate('../README.md')).toBeNull()
    expect(r.locate('/etc/passwd')).toBeNull()
    expect(r.open('../README.md', false)).toBeNull()
  })
})

describe('reader on the intake test vault', async () => {
  const r = createVaultReader(RICH)
  await r.load()
  const snap = r.snapshot()
  const RESTRICTED = 'memory/conditions/cond-20261118-restricted.md'
  const BROKEN = 'memory/conditions/cond-20261119-broken-yaml.md'

  it('keeps a broken file in its section with the reason (VA10)', () => {
    const b = snap.records.find((x) => x.path === BROKEN)!
    expect(b.section).toBe('conditions')
    expect(b.problem).toMatch(/couldn’t be read/)
    expect(b.description).toBe('Couldn’t read this file')
  })

  it('withholds a restricted record until revealed (VA8)', () => {
    const s = snap.records.find((x) => x.path === RESTRICTED)!
    expect(s.restricted).toBe(true)
    expect(s.title).toBe('Private condition')
    expect(s.search).not.toContain('anxiety')
    const hidden = r.open(RESTRICTED, false)!
    expect(hidden.hidden).toBe(true)
    expect(hidden.body).toBeNull()
    expect(hidden.frontmatter).toBeNull()
    expect(hidden.sources).toEqual([])
    const shown = r.open(RESTRICTED, true)!
    expect(shown.hidden).toBe(false)
    expect(shown.body).toContain('anxiety')
  })

  it('never gates the owner’s own patient file', () => {
    const pt = snap.records.find((x) => x.type === 'patient')!
    expect(pt.restricted).toBe(false)
    expect(pt.section).toBe('you')
  })

  it('files family history, allergies and medications', () => {
    const by = (s: string) => snap.records.filter((x) => x.section === s).length
    expect(by('family')).toBe(2)
    expect(by('allergies')).toBe(2)
    expect(by('medications')).toBe(5)
  })

  it('changes nothing on disk (VA12)', async () => {
    const hash = (dir: string): string => {
      const h = createHash('sha256')
      const walk = (d: string): void => {
        for (const n of readdirSync(d).sort()) {
          const p = join(d, n)
          if (statSync(p).isDirectory()) walk(p)
          else h.update(p).update(readFileSync(p))
        }
      }
      walk(dir)
      return h.digest('hex')
    }
    const before = hash(RICH)
    await r.load()
    for (const p of r.snapshot().paths) r.open(p, true)
    expect(hash(RICH)).toBe(before)
  })
})

describe('detect', () => {
  it('accepts a vault, rejects other folders', async () => {
    expect((await detectVault(SAMPLE)).ok).toBe(true)
    expect(await detectVault(join(SAMPLE, 'memory'))).toMatchObject({ ok: false, reason: 'not-a-vault' })
    expect(await detectVault(join(SAMPLE, 'nope'))).toMatchObject({ ok: false, reason: 'missing' })
  })
})
