/**
 * Key facts: a generic walk of a record's `fhir:` block into labelled, readable rows
 * (REQUIREMENTS 5). Per-type layouts can replace this later; the walker stays the fallback.
 */
import { readableDate } from './record-meta'
import { refToPath } from './refs'

export type FactValue = { text: string; ref?: string }
export interface Fact {
  label: string
  values: FactValue[]
}

const LABELS: Record<string, string> = {
  code: 'What',
  name: 'Name',
  clinicalStatus: 'Status',
  verificationStatus: 'Certainty',
  status: 'Status',
  category: 'Category',
  bodySite: 'Body site',
  onsetDateTime: 'Since',
  onsetString: 'Since',
  onsetAge: 'Since age',
  abatementDateTime: 'Ended',
  abatementString: 'Ended',
  recordedDate: 'Recorded',
  asserter: 'Recorded by',
  recorder: 'Recorded by',
  encounter: 'Visit',
  context: 'Visit',
  note: 'Notes',
  class: 'Setting',
  type: 'Type',
  participant: 'Seen by',
  individual: 'Person',
  period: 'When',
  reasonCode: 'Reason',
  reasonReference: 'Reason',
  diagnosis: 'Diagnosis',
  serviceProvider: 'Where',
  basedOn: 'Based on',
  effectiveDateTime: 'Date',
  effectivePeriod: 'When',
  issued: 'Reported',
  performer: 'Done by',
  resultsInterpreter: 'Read by',
  conclusion: 'Conclusion',
  valueQuantity: 'Value',
  valueString: 'Value',
  valueCodeableConcept: 'Value',
  interpretation: 'Flag',
  referenceRange: 'Range',
  performedDateTime: 'Date',
  performedString: 'When',
  performedPeriod: 'When',
  outcome: 'Outcome',
  actor: 'Who',
  medicationCodeableConcept: 'Medicine',
  dosage: 'How to take it',
  dateAsserted: 'Recorded',
  informationSource: 'Told by',
  reaction: 'Reaction',
  manifestation: 'Reaction',
  severity: 'Severity',
  criticality: 'Risk',
  vaccineCode: 'Vaccine',
  occurrenceDateTime: 'Date',
  occurrenceString: 'When',
  primarySource: 'From the clinic’s record',
  reportOrigin: 'Reported by',
  lotNumber: 'Lot number',
  site: 'Where on the body',
  protocolApplied: 'Dose',
  doseNumberString: 'Dose',
  docStatus: 'Document status',
  date: 'Filed',
  author: 'Author',
  description: 'Description',
  content: 'File',
  attachment: 'File',
  title: 'Title',
  contentType: 'Format',
  url: 'Location',
  related: 'Records made from it',
  relationship: 'Relationship',
  sex: 'Sex',
  deceasedBoolean: 'Deceased',
  deceasedAge: 'Died at age',
  deceasedString: 'Deceased',
  condition: 'Condition',
  contributedToDeath: 'Contributed to death',
  qualification: 'Qualifications',
  telecom: 'Contact',
  address: 'Address',
  birthDate: 'Born',
  gender: 'Gender',
  generalPractitioner: 'Family doctor',
  deviceName: 'Name',
  text: 'Text'
}

/** Plain words for the codes the vault writes most (resource-map 5). Others show as written. */
const CODE_WORDS: Record<string, string> = {
  'problem-list-item': 'Problem list',
  'encounter-diagnosis': 'Diagnosis at a visit',
  'social-history': 'Lifestyle',
  'vital-signs': 'Vital signs',
  laboratory: 'Laboratory',
  activity: 'Activity',
  LAB: 'Laboratory',
  AU: 'Audiology',
  RAD: 'Imaging',
  PAT: 'Pathology',
  AMB: 'Clinic visit',
  VR: 'Phone or video',
  IMP: 'Hospital stay',
  EMER: 'Emergency',
  HH: 'Home visit',
  'entered-in-error': 'entered in error'
}
const word = (code: unknown): string => {
  const c = String(code ?? '')
  return CODE_WORDS[c] ?? c
}

// Elements that say nothing to the owner: ids, the owner pointer, coding systems.
const SKIP = new Set(['resourceType', 'id', 'subject', 'patient', 'system', 'meta'])

export function labelFor(key: string): string {
  if (LABELS[key]) return LABELS[key]
  const words = key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)

/** A leaf-like value (CodeableConcept, Reference, Quantity, Period, Coding…) as text, or null. */
function readable(v: unknown, titleOf: (path: string) => string | null): FactValue[] | null {
  if (v === null || v === undefined || v === '') return []
  if (typeof v === 'string') return [{ text: readableDate(word(v)) }]
  if (typeof v === 'number') return [{ text: String(v) }]
  if (typeof v === 'boolean') return [{ text: v ? 'yes' : 'no' }]
  if (!isObj(v)) return null
  if (typeof v.reference === 'string') {
    const ref = refToPath(v.reference) ?? undefined
    const text =
      (typeof v.display === 'string' && v.display) ||
      (ref && titleOf(ref)) ||
      (v.reference === 'Patient/pt-self' ? 'You' : v.reference)
    return [{ text, ref }]
  }
  if ('value' in v && ('unit' in v || 'code' in v) && !('coding' in v)) {
    return [{ text: [v.value, v.unit ?? v.code].filter((x) => x !== undefined).join(' ') }]
  }
  if (('start' in v || 'end' in v) && Object.keys(v).every((k) => k === 'start' || k === 'end')) {
    const s = typeof v.start === 'string' ? readableDate(v.start) : ''
    const e = typeof v.end === 'string' ? readableDate(v.end) : ''
    return [{ text: e ? `${s || '?'} to ${e}` : s ? `from ${s}` : '' }]
  }
  if (typeof v.text === 'string' && Object.keys(v).every((k) => k === 'text' || k === 'coding')) {
    return [{ text: v.text }]
  }
  if (Array.isArray(v.coding) && Object.keys(v).every((k) => k === 'coding' || k === 'text')) {
    return v.coding
      .filter(isObj)
      .map((c) => ({ text: CODE_WORDS[String(c.code)] ?? String(c.display ?? c.code ?? '') }))
      .filter((x) => x.text)
  }
  if ('code' in v && 'system' in v && Object.keys(v).length <= 4) {
    return [{ text: CODE_WORDS[String(v.code)] ?? String(v.display ?? v.code) }]
  }
  return null
}

/** Walks a `fhir:` block into labelled rows. `titleOf` names a referenced record. */
export function keyFacts(fhir: unknown, titleOf: (path: string) => string | null): Fact[] {
  const facts: Fact[] = []
  const add = (label: string, values: FactValue[]): void => {
    const vals = values.filter((x) => x.text !== '')
    if (!vals.length) return
    const prev = facts.find((f) => f.label === label)
    if (prev) prev.values.push(...vals)
    else facts.push({ label, values: vals })
  }
  const walk = (key: string, v: unknown, prefix: string): void => {
    if (SKIP.has(key)) return
    const label = prefix ? `${prefix} · ${labelFor(key)}` : labelFor(key)
    if (Array.isArray(v)) {
      const simple = v.map((x) => readable(x, titleOf))
      if (simple.every((x) => x !== null)) add(label, simple.flat() as FactValue[])
      else v.forEach((x) => walk(key, x, prefix))
      return
    }
    const r = readable(v, titleOf)
    if (r) return add(label, r)
    if (isObj(v)) {
      // Nested structure (reaction, diagnosis, attachment): one level of prefix keeps it readable.
      const inner = prefix ? prefix : labelFor(key)
      for (const [k, x] of Object.entries(v)) walk(k, x, inner)
    }
  }
  if (isObj(fhir)) for (const [k, v] of Object.entries(fhir)) walk(k, v, '')
  return facts
}
