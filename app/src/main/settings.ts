import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'

const BoundsSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number(),
  height: z.number()
})

const SettingsSchema = z.object({
  schemaVersion: z.literal(1),
  vaultPath: z.string().nullable(),
  windowBounds: BoundsSchema.nullable()
})

export type Settings = z.infer<typeof SettingsSchema>

const defaults = (): Settings => ({ schemaVersion: 1, vaultPath: null, windowBounds: null })

export interface SettingsStore {
  get(): Settings
  update(patch: Partial<Settings>): Settings
}

/**
 * settings.json in the app's own user-data folder, never in the vault (REQUIREMENTS 6.2).
 * Written atomically (temp file, then rename).
 */
export function createSettingsStore(dir: string): SettingsStore {
  const file = join(dir, 'settings.json')
  let cache: Settings | null = null
  const load = (): Settings => {
    try {
      const parsed = SettingsSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')))
      if (parsed.success) return parsed.data
    } catch {
      // missing or corrupt: defaults
    }
    return defaults()
  }
  return {
    get() {
      cache ??= load()
      return cache
    },
    update(patch) {
      const next = { ...this.get(), ...patch }
      mkdirSync(dir, { recursive: true })
      const tmp = `${file}.tmp`
      writeFileSync(tmp, JSON.stringify(next, null, 2))
      renameSync(tmp, file)
      cache = next
      return next
    }
  }
}
