/**
 * The section registry (REQUIREMENTS 4, 7). The sidebar, the lists and the classifier all read
 * from here: reordering the sidebar or adding a section is an edit to this file only.
 */

export type SectionId =
  | 'episodes'
  | 'conditions'
  | 'medications'
  | 'allergies'
  | 'results'
  | 'visits'
  | 'procedures'
  | 'vaccines'
  | 'family'
  | 'you'
  | 'care-team'
  | 'devices'
  | 'documents'
  | 'library'
  | 'decisions'
  | 'plans'
  | 'other'

export type GroupId = 'health' | 'people' | 'files' | 'vault'

export type ColumnId = 'title' | 'date' | 'status' | 'kind' | 'description'

export interface SectionDef {
  id: SectionId
  label: string
  group: GroupId
  /** lucide icon name, mapped to a component in the renderer. */
  icon: string
  /** Folder prefixes under the vault root, with a trailing slash. Longest prefix wins. */
  folders: string[]
  /** Record types that belong here; 'any' takes whatever sits in the folders. */
  types: string[] | 'any'
  columns: ColumnId[]
  /** One line shown when the section is empty. */
  empty: string
}

export const GROUPS: { id: GroupId; label: string | null }[] = [
  { id: 'health', label: 'Your health' },
  { id: 'people', label: 'People and things' },
  { id: 'files', label: 'Your files' },
  { id: 'vault', label: 'Vault' }
]

const STD: ColumnId[] = ['title', 'date', 'status', 'description']

export const SECTIONS: SectionDef[] = [
  {
    id: 'episodes',
    label: 'Episodes',
    group: 'health',
    icon: 'folder-heart',
    folders: ['memory/episodes/'],
    types: ['episode'],
    columns: STD,
    empty: 'Problems Claude follows over time ("the ear thing") appear here.'
  },
  {
    id: 'conditions',
    label: 'Conditions',
    group: 'health',
    icon: 'stethoscope',
    folders: ['memory/conditions/'],
    types: ['condition'],
    columns: STD,
    empty: 'Problems and diagnoses appear here.'
  },
  {
    id: 'medications',
    label: 'Medications',
    group: 'health',
    icon: 'pill',
    folders: ['memory/medications/'],
    types: ['medication-statement'],
    columns: STD,
    empty: 'Medicines you take or took appear here.'
  },
  {
    id: 'allergies',
    label: 'Allergies',
    group: 'health',
    icon: 'shield-alert',
    folders: ['memory/allergies/'],
    types: ['allergy-intolerance'],
    columns: STD,
    empty: 'Allergies and intolerances appear here.'
  },
  {
    id: 'results',
    label: 'Results',
    group: 'health',
    icon: 'flask-conical',
    folders: ['memory/reports/', 'memory/observations/'],
    types: ['diagnostic-report', 'observation'],
    columns: ['title', 'date', 'kind', 'description'],
    empty: 'Lab reports, test results and measurements appear here.'
  },
  {
    id: 'visits',
    label: 'Visits',
    group: 'health',
    icon: 'calendar-days',
    folders: ['memory/encounters/'],
    types: ['encounter'],
    columns: STD,
    empty: 'Appointments, calls and hospital stays appear here.'
  },
  {
    id: 'procedures',
    label: 'Procedures',
    group: 'health',
    icon: 'scissors',
    folders: ['memory/procedures/'],
    types: ['procedure'],
    columns: STD,
    empty: 'Operations, biopsies and therapies appear here.'
  },
  {
    id: 'vaccines',
    label: 'Vaccines',
    group: 'health',
    icon: 'syringe',
    folders: ['memory/immunizations/'],
    types: ['immunization'],
    columns: STD,
    empty: 'Vaccines appear here.'
  },
  {
    id: 'family',
    label: 'Family history',
    group: 'health',
    icon: 'users',
    folders: ['memory/family-history/'],
    types: ['family-member-history'],
    columns: ['title', 'status', 'description'],
    empty: 'Health conditions in your family appear here.'
  },
  {
    id: 'you',
    label: 'You',
    group: 'people',
    icon: 'user-round',
    folders: ['memory/patient/'],
    types: ['patient'],
    columns: ['title', 'description'],
    empty: 'Your own details appear here.'
  },
  {
    id: 'care-team',
    label: 'Care team',
    group: 'people',
    icon: 'hospital',
    folders: ['memory/patient/care-team/'],
    types: ['practitioner', 'organization'],
    columns: ['title', 'kind', 'description'],
    empty: 'Your doctors, clinics and labs appear here.'
  },
  {
    id: 'devices',
    label: 'Devices',
    group: 'people',
    icon: 'ear',
    folders: ['memory/patient/devices/'],
    types: ['device'],
    columns: ['title', 'status', 'description'],
    empty: 'Hearing aids, implants and other devices appear here.'
  },
  {
    id: 'documents',
    label: 'Documents',
    group: 'files',
    icon: 'file-text',
    folders: ['memory/documents/'],
    types: ['document-reference'],
    columns: ['title', 'date', 'description'],
    empty: 'Every original you give Claude gets a record here.'
  },
  {
    id: 'library',
    label: 'Notes and questions',
    group: 'files',
    icon: 'notebook-pen',
    folders: ['memory/library/'],
    types: 'any',
    columns: ['title', 'date', 'description'],
    empty: 'Questions for your doctors and notes you asked Claude to keep appear here.'
  },
  {
    id: 'decisions',
    label: 'Decisions',
    group: 'files',
    icon: 'scale',
    folders: ['memory/decisions/'],
    types: 'any',
    columns: ['title', 'date', 'description'],
    empty: 'Health and treatment decisions, with the reasons, appear here.'
  },
  {
    id: 'plans',
    label: 'Plans',
    group: 'files',
    icon: 'list-checks',
    folders: ['memory/plans/'],
    types: 'any',
    columns: ['title', 'date', 'description'],
    empty: 'Care plans appear here.'
  },
  {
    id: 'other',
    label: 'Other',
    group: 'vault',
    icon: 'shapes',
    folders: [],
    types: 'any',
    columns: ['title', 'kind', 'description'],
    empty: 'Records the viewer doesn’t have a section for appear here.'
  }
]

export const sectionById = (id: SectionId): SectionDef =>
  SECTIONS.find((s) => s.id === id) ?? SECTIONS[SECTIONS.length - 1]

const SYSTEM_NAMES = new Set(['index.md', 'log.md'])

/** Vault files that aren't records: indexes, logs, the card, the rules, the router. */
export function isSystemFile(path: string): boolean {
  const name = path.split('/').pop() ?? ''
  if (SYSTEM_NAMES.has(name)) return true
  if (name.startsWith('_')) return true
  if (!path.startsWith('memory/')) return true
  return path.startsWith('memory/reference/')
}

export interface Classification {
  section: SectionId
  /** Why it landed in Other, in plain words. */
  reason?: string
}

/** Which section a record belongs to (IMPLEMENTATION_PLAN, key decision 2). */
export function classify(path: string, type: string | null): Classification {
  let best: SectionDef | null = null
  let bestLen = -1
  for (const s of SECTIONS) {
    for (const f of s.folders) {
      if (path.startsWith(f) && f.length > bestLen) {
        best = s
        bestLen = f.length
      }
    }
  }
  if (!best) return { section: 'other', reason: 'It sits in a folder the viewer doesn’t know.' }
  if (type === null || best.types === 'any' || best.types.includes(type)) return { section: best.id }
  return {
    section: 'other',
    reason: `Its type (“${type}”) doesn’t belong in ${best.label}.`
  }
}
