import { z } from 'zod'

/** One file the reader knows about, as the lists and the sidebar see it. */
export const RecordSummarySchema = z.object({
  /** Vault-relative POSIX path, e.g. "memory/conditions/cond-20261012-x.md". */
  path: z.string(),
  /** `type` from the frontmatter, or null when it couldn't be read. */
  type: z.string().nullable(),
  /** Plain-word kind ("Condition", "Lab report"). */
  kind: z.string(),
  title: z.string(),
  description: z.string(),
  /** Main date as written in the record (ISO, partial ISO, or the person's words). */
  date: z.string().nullable(),
  /** Status in plain words, most important first. */
  status: z.array(z.string()),
  /** Sidebar section id, or 'system' for files shown only under All files. */
  section: z.string(),
  /** Why the file is in Other. */
  otherReason: z.string().optional(),
  restricted: z.boolean(),
  /** Searchable words: title, aliases, description. Neutral only, for restricted records. */
  search: z.string(),
  /** Set when the file couldn't be read. */
  problem: z.string().optional()
})
export type RecordSummary = z.infer<typeof RecordSummarySchema>

export const VaultSnapshotSchema = z.object({
  root: z.string(),
  /** The owner's name from memory/patient/pt-self.md, if present. */
  patientName: z.string().nullable(),
  records: z.array(RecordSummarySchema),
  /** Every readable path the viewer shows (records and system files), sorted. */
  paths: z.array(z.string())
})
export type VaultSnapshot = z.infer<typeof VaultSnapshotSchema>

export const SourceViewSchema = z.object({
  kind: z.enum(['session', 'file', 'other']),
  label: z.string(),
  /** Vault-relative path of an original, for kind 'file'. */
  path: z.string().optional(),
  exists: z.boolean().optional()
})
export type SourceView = z.infer<typeof SourceViewSchema>

export const OpenedFileSchema = z.object({
  path: z.string(),
  summary: RecordSummarySchema.nullable(),
  /** True when the record is restricted and the owner hasn't clicked Show. */
  hidden: z.boolean(),
  /** null when hidden or when the file has no frontmatter. */
  frontmatter: z.record(z.string(), z.unknown()).nullable(),
  /** The real title, once revealed. */
  title: z.string(),
  body: z.string().nullable(),
  sources: z.array(SourceViewSchema),
  verified: z.boolean(),
  /** Records whose links point here, as summaries (restricted ones stay neutral). */
  linkedFrom: z.array(RecordSummarySchema)
})
export type OpenedFile = z.infer<typeof OpenedFileSchema>

export const DetectResultSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), path: z.string() }),
  z.object({
    ok: z.literal(false),
    path: z.string().nullable(),
    reason: z.enum(['cancelled', 'missing', 'not-a-vault', 'other-layout', 'unreadable'])
  })
])
export type DetectResult = z.infer<typeof DetectResultSchema>
