import { readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'

export const SAMPLE = resolve(__dirname, '../../../examples/sample-vault')
export const RICH = resolve(__dirname, '../fixtures/rich-vault')

/** Vault-relative .md paths under memory/, like `find memory -name '*.md'`. */
export function findMarkdown(root: string, dir = 'memory'): string[] {
  const out: string[] = []
  for (const name of readdirSync(join(root, dir))) {
    if (name.startsWith('.')) continue
    const rel = `${dir}/${name}`
    if (statSync(join(root, rel)).isDirectory()) out.push(...findMarkdown(root, rel))
    else if (name.endsWith('.md')) out.push(rel)
  }
  return out
}
