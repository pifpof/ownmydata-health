import { parse } from 'yaml'

export type Obj = Record<string, unknown>

export interface Parsed {
  /** null when the file has no frontmatter block. */
  frontmatter: Obj | null
  body: string
  /** Set when a frontmatter block exists but can't be read. */
  error?: string
}

const FENCE = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/

/**
 * Splits and parses a markdown file's YAML frontmatter. YAML 1.2 core schema, so dates stay
 * strings exactly as written ("2026-10" is not turned into a Date).
 */
export function parseMarkdown(text: string): Parsed {
  const src = text.replace(/^\uFEFF/, '')
  const m = FENCE.exec(src)
  if (!m) return { frontmatter: null, body: src }
  const body = src.slice(m[0].length)
  try {
    const data = parse(m[1], { schema: 'core', uniqueKeys: true })
    if (data === null || data === undefined) return { frontmatter: {}, body }
    if (typeof data !== 'object' || Array.isArray(data))
      return { frontmatter: null, body, error: 'The block at the top isn’t a list of fields.' }
    return { frontmatter: data as Obj, body }
  } catch (err) {
    const msg = err instanceof Error ? err.message.split('\n')[0] : 'unknown error'
    return { frontmatter: null, body, error: `The block at the top couldn’t be read (${msg}).` }
  }
}

/** The first `# Heading` in a body, for files without a title field. */
export function firstHeading(body: string): string | null {
  const m = /^#\s+(.+)$/m.exec(body)
  return m ? m[1].trim() : null
}
