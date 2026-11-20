/**
 * References and links. `Type/id` resolves to a path by the vault's resource map (section 3),
 * without searching; relative markdown links resolve against the file they're in.
 * All paths are vault-relative and POSIX ("memory/conditions/cond-….md").
 */

const FOLDER: Record<string, string> = {
  Patient: 'memory/patient/',
  Practitioner: 'memory/patient/care-team/',
  Organization: 'memory/patient/care-team/',
  Condition: 'memory/conditions/',
  Encounter: 'memory/encounters/<yyyy>/',
  DiagnosticReport: 'memory/reports/<yyyy>/',
  Observation: 'memory/observations/standalone/<yyyy>/',
  Procedure: 'memory/procedures/',
  MedicationStatement: 'memory/medications/',
  AllergyIntolerance: 'memory/allergies/',
  Immunization: 'memory/immunizations/',
  DocumentReference: 'memory/documents/<yyyy>/',
  FamilyMemberHistory: 'memory/family-history/',
  Device: 'memory/patient/devices/',
  EpisodeOfCare: 'memory/episodes/'
}

const ID = /^[a-z0-9][a-z0-9-]{0,63}$/

/** "Condition/cond-20261012-x" → "memory/conditions/cond-20261012-x.md", or null. */
export function refToPath(ref: string): string | null {
  const m = /^([A-Za-z]+)\/(.+)$/.exec(ref.trim())
  if (!m) return null
  const [, type, id] = m
  const folder = FOLDER[type]
  if (!folder || !ID.test(id)) return null
  if (folder.includes('<yyyy>')) {
    const y = /^[a-z]+-(\d{4})\d{4}-/.exec(id)
    if (!y) return null
    return `${folder.replace('<yyyy>', y[1])}${id}.md`
  }
  return `${folder}${id}.md`
}

/** An episode id from `vault.episode` → its hub. */
export function episodePath(id: string): string | null {
  return ID.test(id) ? `memory/episodes/${id}.md` : null
}

/** The folder part of a vault path, with a trailing slash ("" at the root). */
export function dirOf(path: string): string {
  const i = path.lastIndexOf('/')
  return i < 0 ? '' : path.slice(0, i + 1)
}

/**
 * Resolves a relative markdown link from the file at `from`. Returns null for external links,
 * in-page anchors, absolute paths and anything that climbs out of the vault.
 */
export function resolveLink(from: string, href: string): string | null {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('#') || href.startsWith('/')) return null
  let target = href.replace(/^<|>$/g, '').split('#')[0].split('?')[0]
  if (!target) return null
  try {
    target = decodeURI(target)
  } catch {
    /* keep as written */
  }
  const parts = dirOf(from).split('/').filter(Boolean)
  for (const seg of target.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') {
      if (!parts.length) return null
      parts.pop()
    } else parts.push(seg)
  }
  return parts.join('/')
}

/** Markdown with code blocks and inline code removed, so example links in code don't count. */
export function stripCode(md: string): string {
  return md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
}

/** Every relative link target in a markdown body, resolved from `from`. */
export function bodyLinks(from: string, body: string): string[] {
  const out: string[] = []
  const re = /\[[^\]]*\]\(\s*(<[^>\n]+>|[^)\s]+)(?:\s+"[^"]*")?\s*\)/g
  for (const m of stripCode(body).matchAll(re)) {
    const p = resolveLink(from, m[1])
    if (p) out.push(p)
  }
  return out
}

/** Every `reference: "Type/id"` anywhere inside a value, plus the vault block's own pointers. */
export function frontmatterLinks(fm: Record<string, unknown>): string[] {
  const out: string[] = []
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>
      if (typeof o.reference === 'string') {
        const p = refToPath(o.reference)
        if (p) out.push(p)
      }
      Object.values(o).forEach(walk)
    }
  }
  walk(fm.fhir)
  const vault = fm.vault as Record<string, unknown> | undefined
  if (vault) {
    if (typeof vault.episode === 'string') {
      const p = episodePath(vault.episode)
      if (p) out.push(p)
    } else if (vault.episode && typeof vault.episode === 'object') {
      const anchor = (vault.episode as Record<string, unknown>).anchor
      if (typeof anchor === 'string') {
        const p = refToPath(anchor)
        if (p) out.push(p)
      }
    }
    if (Array.isArray(vault.documents)) {
      for (const d of vault.documents) {
        const p = typeof d === 'string' ? refToPath(d) : null
        if (p) out.push(p)
      }
    }
  }
  return out
}
