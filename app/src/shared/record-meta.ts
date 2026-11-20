/**
 * Derived words for records: kind, main date, status. Lists, headers and later layouts all
 * use these, so the same record reads the same everywhere (REQUIREMENTS 7).
 */

type Obj = Record<string, unknown>
const obj = (v: unknown): Obj | undefined =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : undefined
const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : typeof v === 'number' ? String(v) : undefined

const KIND: Record<string, string> = {
  patient: 'You',
  practitioner: 'Doctor',
  organization: 'Clinic or lab',
  condition: 'Condition',
  encounter: 'Visit',
  'diagnostic-report': 'Report',
  observation: 'Measurement',
  procedure: 'Procedure',
  'medication-statement': 'Medication',
  'allergy-intolerance': 'Allergy',
  immunization: 'Vaccine',
  'document-reference': 'Document',
  'family-member-history': 'Family history',
  device: 'Device',
  episode: 'Episode',
  system: 'Vault file',
  reference: 'Rules file'
}

export function kindLabel(type: string | null, fm?: Obj): string {
  if (!type) return 'File'
  if (type === 'diagnostic-report') {
    const cat = codesOf(obj(fm?.fhir)?.category)
    if (cat.includes('LAB')) return 'Lab report'
    if (cat.includes('AU')) return 'Hearing test'
    if (cat.includes('RAD')) return 'Imaging report'
    if (cat.includes('PAT')) return 'Pathology report'
  }
  if (type === 'observation') {
    const cat = codesOf(obj(fm?.fhir)?.category)
    if (cat.includes('social-history') || cat.includes('activity')) return 'Lifestyle'
    if (cat.includes('vital-signs')) return 'Vital sign'
    if (cat.includes('laboratory')) return 'Lab result'
  }
  return KIND[type] ?? type.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

/** Codes inside a CodeableConcept, a list of them, or a Coding. */
export function codesOf(v: unknown): string[] {
  if (Array.isArray(v)) return v.flatMap(codesOf)
  const o = obj(v)
  if (!o) return []
  if (Array.isArray(o.coding)) return o.coding.flatMap(codesOf)
  const c = str(o.code)
  return c ? [c] : []
}

const DATE_KEYS = [
  'onsetDateTime',
  'onsetString',
  'effectiveDateTime',
  'effectivePeriod',
  'performedDateTime',
  'performedPeriod',
  'performedString',
  'occurrenceDateTime',
  'occurrenceString',
  'period',
  'issued',
  'date',
  'recordedDate',
  'dateAsserted'
]

/** The date a list sorts by and a header shows, as written. */
export function mainDate(fm: Obj | undefined, path: string): string | null {
  const fhir = obj(fm?.fhir)
  const episode = obj(obj(fm?.vault)?.episode)
  const fromEp = str(obj(episode?.period)?.start)
  if (fromEp) return fromEp
  if (fhir) {
    for (const k of DATE_KEYS) {
      const v = fhir[k]
      const s = str(v) ?? str(obj(v)?.start)
      if (s) return /^\d{4}-\d{2}-\d{2}T/.test(s) ? s.slice(0, 10) : s
    }
  }
  const m = /-(\d{4})(\d{2})(\d{2})-/.exec(path.split('/').pop() ?? '')
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null
}

/** Sort key: ISO-ish dates first, newest first; words after. */
export function dateSortKey(d: string | null): string {
  return d && /^\d{4}/.test(d) ? `1${d}` : '0'
}

const WORDS: Record<string, string> = {
  'entered-in-error': 'entered in error',
  'in-progress': 'in progress',
  'on-hold': 'on hold',
  onhold: 'on hold',
  'not-done': 'not done',
  'not-taken': 'not taken',
  'health-unknown': 'health unknown',
  'unable-to-assess': 'unable to assess',
  finished: 'finished'
}
const MED: Record<string, string> = {
  active: 'taking',
  intended: 'planned',
  completed: 'finished',
  stopped: 'stopped',
  'on-hold': 'on hold',
  unknown: 'status unknown'
}
// Statuses that say nothing to the owner of a past event.
const QUIET = new Set(['final', 'completed', 'current', 'finished'])

/** Status chips, plain words, most telling first. */
export function statusWords(type: string | null, fm: Obj | undefined): string[] {
  const out: string[] = []
  const fhir = obj(fm?.fhir)
  const episode = obj(obj(fm?.vault)?.episode)
  const epStatus = str(episode?.status)
  if (epStatus) out.push(WORDS[epStatus] ?? epStatus)
  if (fhir) {
    const clinical = codesOf(fhir.clinicalStatus)[0]
    if (clinical) out.push(WORDS[clinical] ?? clinical)
    const verification = codesOf(fhir.verificationStatus)[0]
    if (verification && verification !== 'confirmed')
      out.push(WORDS[verification] ?? verification)
    const status = str(fhir.status)
    if (status) {
      if (type === 'medication-statement') out.push(MED[status] ?? status)
      else if (!QUIET.has(status)) out.push(WORDS[status] ?? status)
    }
  }
  return [...new Set(out)]
}

/** "2026-11-05T07:45:00-07:00" → "2026-11-05 07:45"; anything else as written. */
export function readableDate(s: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/.exec(s)
  if (!m) return s
  return m[2] === '00:00' ? m[1] : `${m[1]} ${m[2]}`
}

/** "session:2026-11-18" → "From what you told me, 2026-11-18". */
export function sessionLabel(resource: string): string | null {
  const m = /^session:\s*(.*)$/.exec(resource)
  if (!m) return null
  return m[1] ? `From what you told me, ${m[1]}` : 'From what you told me'
}
