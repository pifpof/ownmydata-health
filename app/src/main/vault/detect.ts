import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import type { DetectResult } from '@shared/vault-model'
import { parseMarkdown } from './parse'

export const SUPPORTED_LAYOUTS = ['hv-1.0']

/** Is this folder an Own My Data.Health health vault? Reads `memory.md` only; writes nothing. */
export async function detectVault(path: string): Promise<DetectResult> {
  try {
    const s = await stat(path)
    if (!s.isDirectory()) return { ok: false, path, reason: 'missing' }
  } catch {
    return { ok: false, path, reason: 'missing' }
  }
  let text: string
  try {
    text = await readFile(join(path, 'memory.md'), 'utf8')
  } catch {
    return { ok: false, path, reason: 'not-a-vault' }
  }
  const { frontmatter, error } = parseMarkdown(text)
  if (error || !frontmatter) return { ok: false, path, reason: 'unreadable' }
  const layout = frontmatter.layout
  if (typeof layout === 'string' && SUPPORTED_LAYOUTS.includes(layout)) return { ok: true, path }
  if (typeof layout === 'string' && layout.startsWith('hv-')) return { ok: false, path, reason: 'other-layout' }
  return { ok: false, path, reason: 'not-a-vault' }
}
