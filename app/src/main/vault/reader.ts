/**
 * The vault reader (IMPLEMENTATION_PLAN, key decision 1). Reads every markdown file under
 * memory/ plus the router and the load log into memory, classifies them, builds the link
 * graph, and answers the renderer. READ-ONLY: nothing in this folder writes to disk
 * (tests/unit/no-writes.test.ts checks).
 */
import { existsSync } from 'fs'
import { lstat, readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { classify, isSystemFile } from '@shared/sections'
import { bodyLinks, frontmatterLinks } from '@shared/refs'
import { kindLabel, mainDate, sessionLabel, statusWords } from '@shared/record-meta'
import type { OpenedFile, RecordSummary, SourceView, VaultSnapshot } from '@shared/vault-model'
import { resolveInside, toPosix } from './guard'
import { firstHeading, parseMarkdown, type Obj } from './parse'

interface Entry {
  path: string
  summary: RecordSummary
  fm: Obj | null
  body: string
  /** Paths this file links to (body links and references), de-duplicated. */
  links: string[]
}

const EXTRA_FILES = ['memory.md', 'data/load-log.md']

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined

/** Recursively lists .md files under `dir` (vault-relative), skipping dotfiles and symlinks. */
async function listMarkdown(root: string, dir: string): Promise<string[]> {
  let names: string[]
  try {
    names = await readdir(join(root, dir))
  } catch {
    return []
  }
  const out: string[] = []
  await Promise.all(
    names.map(async (name) => {
      if (name.startsWith('.')) return
      const rel = `${dir}/${name}`
      const st = await lstat(join(root, rel)).catch(() => null)
      if (!st || st.isSymbolicLink()) return
      if (st.isDirectory()) out.push(...(await listMarkdown(root, rel)))
      else if (st.isFile() && name.endsWith('.md')) out.push(rel)
    })
  )
  return out
}

export function summarize(path: string, text: string): Entry {
  const { frontmatter: fm, body, error } = parseMarkdown(text)
  const name = path.split('/').pop() ?? path
  const system = isSystemFile(path)
  const type = str(fm?.type) ?? null
  const links = [...new Set([...(fm ? frontmatterLinks(fm) : []), ...bodyLinks(path, body)])]

  if (system) {
    const title = str(fm?.title) ?? firstHeading(body) ?? name
    return {
      path,
      fm,
      body,
      links,
      summary: {
        path,
        type,
        kind: path.startsWith('memory/reference/') ? 'Rules file' : 'Vault file',
        title,
        description: str(fm?.description) ?? '',
        date: null,
        status: [],
        section: 'system',
        restricted: false,
        search: `${title} ${name}`.toLowerCase()
      }
    }
  }

  const problem =
    error ??
    (fm === null
      ? 'This file has no block of fields at the top, so the viewer can’t tell what it is.'
      : !type
        ? 'This file has no “type” field, so the viewer can’t tell what it is.'
        : undefined)

  const cls = classify(path, problem ? null : type)
  const kind = kindLabel(type, fm ?? undefined)
  const vault = fm?.vault as Obj | undefined
  const restricted = !problem && vault?.sensitivity === 'restricted' && type !== 'patient'

  if (problem) {
    return {
      path,
      fm,
      body,
      links: [],
      summary: {
        path,
        type,
        kind: 'File',
        title: name,
        description: 'Couldn’t read this file',
        date: null,
        status: [],
        section: cls.section,
        otherReason: cls.reason,
        restricted: false,
        search: name.toLowerCase(),
        problem
      }
    }
  }

  const date = mainDate(fm ?? undefined, path)
  if (restricted) {
    const title = `Private ${kind.toLowerCase()}`
    return {
      path,
      fm,
      body,
      links,
      summary: {
        path,
        type,
        kind,
        title,
        description: 'Private. Hidden until you choose Show.',
        date,
        status: [],
        section: cls.section,
        otherReason: cls.reason,
        restricted: true,
        search: `${title} ${kind}`.toLowerCase()
      }
    }
  }

  const title = str(fm?.title) ?? firstHeading(body) ?? name
  const description = str(fm?.description) ?? ''
  const aliases = Array.isArray(fm?.aliases) ? fm.aliases.filter((a) => typeof a === 'string') : []
  return {
    path,
    fm,
    body,
    links,
    summary: {
      path,
      type,
      kind,
      title,
      description,
      date,
      status: statusWords(type, fm ?? undefined),
      section: cls.section,
      otherReason: cls.reason,
      restricted: false,
      search: [title, description, kind, ...aliases].join(' ').toLowerCase()
    }
  }
}

export interface VaultReader {
  readonly root: string
  /** Reads (or re-reads) the whole vault. Vaults are small; a full read is well under a second. */
  load(): Promise<void>
  snapshot(): VaultSnapshot
  open(path: string, reveal: boolean): OpenedFile | null
  /** Absolute path of a file inside the vault, or null (outside, symlinked out, missing). */
  locate(path: string): string | null
}

export function createVaultReader(root: string): VaultReader {
  let entries = new Map<string, Entry>()

  const sourcesOf = (fm: Obj | null): SourceView[] => {
    const list = Array.isArray(fm?.sources) ? fm.sources : []
    return list.flatMap((s): SourceView[] => {
      const resource = typeof s === 'string' ? s : str((s as Obj | null)?.resource)
      if (!resource) return []
      const session = sessionLabel(resource)
      if (session) return [{ kind: 'session', label: session }]
      const clean = resource.replace(/^"|"$/g, '')
      if (clean.startsWith('data/')) {
        const abs = resolveInside(root, clean)
        return [
          {
            kind: 'file',
            label: clean.split('/').pop() ?? clean,
            path: clean,
            exists: !!abs && existsSync(abs)
          }
        ]
      }
      return [{ kind: 'other', label: clean }]
    })
  }

  return {
    root,
    async load() {
      const paths = [
        ...(await listMarkdown(root, 'memory')),
        ...EXTRA_FILES.filter((p) => existsSync(join(root, p)))
      ]
      const next = new Map<string, Entry>()
      await Promise.all(
        paths.map(async (p) => {
          const rel = toPosix(p)
          try {
            next.set(rel, summarize(rel, await readFile(join(root, rel), 'utf8')))
          } catch {
            // Vanished between listing and reading: the next change event re-reads.
          }
        })
      )
      entries = next
    },
    snapshot() {
      const all = [...entries.values()]
      const pt = entries.get('memory/patient/pt-self.md')
      return {
        root,
        patientName: str(pt?.fm?.title) ?? null,
        records: all.filter((e) => e.summary.section !== 'system').map((e) => e.summary),
        paths: all.map((e) => e.path).sort()
      }
    },
    open(path, reveal) {
      const e = entries.get(path)
      if (!e) return null
      const linkedFrom = [...entries.values()]
        .filter((o) => o.path !== path && o.summary.section !== 'system' && o.links.includes(path))
        .map((o) => o.summary)
        .sort((a, b) => a.title.localeCompare(b.title))
      const hidden = e.summary.restricted && !reveal
      return {
        path,
        summary: e.summary.section === 'system' ? null : e.summary,
        hidden,
        frontmatter: hidden ? null : e.fm,
        title: hidden ? e.summary.title : (str(e.fm?.title) ?? e.summary.title),
        body: hidden ? null : e.body,
        sources: hidden ? [] : sourcesOf(e.fm),
        verified: e.fm?.verified !== undefined && e.fm?.verified !== null,
        linkedFrom
      }
    },
    locate(path) {
      return resolveInside(root, path)
    }
  }
}
