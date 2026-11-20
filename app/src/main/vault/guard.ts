import { realpathSync } from 'fs'
import { isAbsolute, relative, resolve, sep } from 'path'

/** POSIX form of a relative path. */
export const toPosix = (p: string): string => p.split(sep).join('/')

const inside = (root: string, abs: string): boolean => {
  const rel = relative(root, abs)
  return rel === '' ? false : !rel.startsWith('..') && !isAbsolute(rel)
}

/**
 * Resolves a vault-relative path to an absolute one, or null when it would leave the vault,
 * including through a symbolic link, per REQUIREMENTS 6.3. The file need not exist; when it does,
 * its real path must still sit inside the vault's real path.
 */
export function resolveInside(root: string, relPath: string): string | null {
  if (!relPath || isAbsolute(relPath) || relPath.includes('\0')) return null
  const abs = resolve(root, relPath)
  if (!inside(resolve(root), abs)) return null
  let realRoot: string
  try {
    realRoot = realpathSync(root)
  } catch {
    return null
  }
  try {
    const real = realpathSync(abs)
    return inside(realRoot, real) ? abs : null
  } catch {
    // Doesn't exist (yet): the lexical check above is all there is to check.
    return abs
  }
}
