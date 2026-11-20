import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { describe, expect, it } from 'vitest'

// REQUIREMENTS 6.2: the viewer has no code path that writes inside the vault.
const WRITE = /\b(writeFile|writeFileSync|appendFile|appendFileSync|rename|renameSync|rm|rmSync|rmdir|unlink|unlinkSync|mkdir|mkdirSync|copyFile|cp|cpSync|createWriteStream|truncate|chmod|utimes|symlink)\s*\(/

describe('read-only', () => {
  it('no file under main/vault, and not ipc.ts, calls a write function', () => {
    const dir = resolve(__dirname, '../../src/main/vault')
    const files = [...readdirSync(dir).map((n) => join(dir, n)), resolve(dir, '../ipc.ts')]
    for (const f of files) expect(readFileSync(f, 'utf8'), f).not.toMatch(WRITE)
  })
})
