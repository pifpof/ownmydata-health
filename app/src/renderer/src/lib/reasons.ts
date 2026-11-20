import type { DetectResult } from '@shared/vault-model'

/** Words for a folder that couldn't be opened (REQUIREMENTS 3). */
export function reasonText(r: DetectResult | null): string | null {
  if (!r || r.ok) return null
  switch (r.reason) {
    case 'cancelled':
      return null
    case 'missing':
      return 'The vault folder you used last time can’t be found. It may have been moved or renamed.'
    case 'other-layout':
      return 'That vault was made by a newer version of ownmydata than this viewer can read. Updating the app should fix it.'
    case 'unreadable':
      return 'That folder has a memory.md file, but the viewer couldn’t read it.'
    default:
      return 'That folder doesn’t have a health vault in it. Pick the folder you chose when you set up ownmydata (it has a file called memory.md).'
  }
}
